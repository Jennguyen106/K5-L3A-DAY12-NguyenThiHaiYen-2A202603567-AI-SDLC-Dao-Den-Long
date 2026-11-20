// Một bước mô phỏng k → k+1, đúng thứ tự ở phase-1-spec mục 4.
import { spawnMote, spawnShade, r3 } from './level.js';
import { TICK_RATE } from './config.js';

const DT = 1 / TICK_RATE;
const distXZ = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// Bóng Mực không vào được vùng safe_radius quanh đèn đã thắp: đặt lại ở mép vùng.
function keepOutOfLitLanterns(s, sh) {
  const R = s.cfg.safe_radius;
  for (const l of s.lanterns) {
    if (!l.lit) continue;
    const dx = sh.x - l.x;
    const dz = sh.z - l.z;
    const d = Math.hypot(dx, dz);
    if (d < R) {
      const [ux, uz] = d === 0 ? [1, 0] : [dx / d, dz / d];
      sh.x = l.x + ux * R;
      sh.z = l.z + uz * R;
    }
  }
}

export function step(s, inp) {
  if (s.state !== 'playing') return [];
  const c = s.cfg;
  const p = s.player;
  const t = s.tick + 1;
  const events = [];
  const emit = (name, data) => events.push({ type: 'event', tick: t, name, data });

  // 1. Input tick k (hành động kích hoạt khi false → true).
  const pressed = (k) => inp[k] === true && !s.prevButtons[k];
  const doJump = pressed('jump');
  const doInteract = pressed('interact');
  const doPulse = pressed('pulse');
  s.prevButtons = { jump: !!inp.jump, interact: !!inp.interact, pulse: !!inp.pulse, dash: !!inp.dash };

  // 2. Bộ đếm.
  if (p.invuln > 0) p.invuln--;
  if (p.pulse_cd > 0) p.pulse_cd--;
  for (const sh of s.shades) {
    if (sh.state === 'stunned') {
      sh.stun--;
      if (sh.stun <= 0) {
        sh.stun = 0;
        sh.state = 'chase';
      }
    }
  }

  // 3. Di chuyển / nhảy.
  let [mx, mz] = inp.move;
  const len = Math.hypot(mx, mz);
  if (len > 1) {
    mx /= len;
    mz /= len;
  }
  const th = (inp.cam_yaw_deg * Math.PI) / 180;
  const wx = mx * Math.cos(th) + mz * Math.sin(th);
  const wz = -mx * Math.sin(th) + mz * Math.cos(th);
  p.x += wx * c.player_speed * DT;
  p.z += wz * c.player_speed * DT;
  const dc = Math.hypot(p.x, p.z);
  if (dc > c.island_radius) {
    p.x *= c.island_radius / dc;
    p.z *= c.island_radius / dc;
  }
  if (doJump && p.y <= 0 && p.vy === 0) p.vy = c.jump_velocity;
  if (p.y > 0 || p.vy !== 0) {
    p.vy -= c.gravity * DT;
    p.y += p.vy * DT;
    if (p.y <= 0) {
      p.y = 0;
      p.vy = 0;
    }
  }

  // 4. Nhặt đom đóm (theo thứ tự id tăng dần = thứ tự tạo).
  s.motes = s.motes.filter((m) => {
    if (p.carried >= c.carry_capacity) return true;
    if (distXZ(p.x, p.z, m.x, m.z) > c.pickup_radius) return true;
    p.carried++;
    s.score += c.score.per_mote;
    emit('mote_picked', { carried: p.carried });
    return false;
  });

  // 5. Nạp đèn: đèn chưa thắp gần nhất trong interact_radius (bằng nhau → id nhỏ hơn).
  if (doInteract) {
    let best = null;
    let bestD = Infinity;
    for (const l of s.lanterns) {
      if (l.lit) continue;
      const d = distXZ(p.x, p.z, l.x, l.z);
      if (d <= c.interact_radius && d < bestD) {
        best = l;
        bestD = d;
      }
    }
    if (best) {
      const amount = Math.min(p.carried, c.lantern_cost - best.deposited);
      if (amount > 0) {
        p.carried -= amount;
        best.deposited += amount;
        emit('deposit', { lantern_id: best.id, amount, deposited: best.deposited });
        if (best.deposited >= c.lantern_cost) {
          best.lit = true;
          s.score += c.score.per_lantern;
          emit('lantern_lit', { lantern_id: best.id });
        }
      }
    }
  }

  // 6. Tỏa sáng.
  if (doPulse && p.pulse_cd === 0 && p.carried >= c.pulse_cost) {
    p.carried -= c.pulse_cost;
    const ids = [];
    for (const sh of s.shades) {
      const dx = sh.x - p.x;
      const dz = sh.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d > c.pulse_radius) continue;
      sh.state = 'stunned';
      sh.stun = c.stun_ticks;
      const [ux, uz] = d === 0 ? [1, 0] : [dx / d, dz / d];
      sh.x += ux * c.pulse_push_m;
      sh.z += uz * c.pulse_push_m;
      keepOutOfLitLanterns(s, sh);
      ids.push(sh.id);
    }
    s.score += c.score.per_stun * ids.length;
    p.pulse_cd = c.pulse_cooldown_ticks;
    emit('pulse', { stunned_ids: ids });
  }

  // 7. Sinh đom đóm / Bóng Mực.
  if (s.random_motes && t % c.mote_respawn_every_ticks === 0 && s.motes.length < c.mote_respawn_below) {
    spawnMote(s);
  }
  if (s.random_shades && t % c.shade_spawn_every_ticks === 0 && s.shades.length < c.shade_max) {
    const sh = spawnShade(s);
    emit('shade_spawned', { id: sh.id });
  }

  // 8. Bóng Mực di chuyển (không đi quá người chơi).
  for (const sh of s.shades) {
    if (sh.state !== 'chase') continue;
    const dx = p.x - sh.x;
    const dz = p.z - sh.z;
    const d = Math.hypot(dx, dz);
    if (d > 0) {
      const stepLen = Math.min(c.shade_speed * DT, d);
      sh.x += (dx / d) * stepLen;
      sh.z += (dz / d) * stepLen;
    }
    keepOutOfLitLanterns(s, sh);
  }

  // 9. Bị chạm (tối đa 1 lần mỗi bước).
  if (p.invuln === 0) {
    const hit = s.shades.find(
      (sh) => sh.state === 'chase' && distXZ(p.x, p.z, sh.x, sh.z) <= c.shade_hit_radius,
    );
    if (hit) {
      p.flames = Math.max(0, p.flames - 1);
      const dropped = Math.floor(p.carried * c.hit_drop_ratio);
      p.carried -= dropped;
      p.invuln = c.invuln_ticks;
      emit('player_hit', { by: 'shade', flames: p.flames, dropped });
    }
  }

  // 10. Thời gian (đếm bằng số nguyên tick để tránh sai số số thực).
  if (s.time_left_ticks > 0) s.time_left_ticks--;

  // 11. Kết thúc: all_lit > no_flames > dawn.
  let over = null;
  if (s.lanterns.every((l) => l.lit)) {
    over = { result: 'won', reason: 'all_lit' };
    s.score += c.score.per_second_left * Math.floor(s.time_left_ticks / TICK_RATE);
    s.score += c.score.per_flame_left * p.flames;
  } else if (p.flames <= 0) {
    over = { result: 'lost', reason: 'no_flames' };
  } else if (s.time_left_ticks <= 0) {
    over = { result: 'lost', reason: 'dawn' };
  }
  if (over) {
    s.state = over.result;
    s.result = over;
    emit('game_over', over);
  }

  s.tick = t;
  return events;
}

export function snapshot(s) {
  const p = s.player;
  return {
    type: 'snapshot',
    tick: s.tick,
    sim_tick: s.tick,
    state: s.state,
    time_left_s: r3(s.time_left_ticks / TICK_RATE),
    score: s.score,
    player: { pos: [r3(p.x), r3(p.y), r3(p.z)], flames: p.flames, carried: p.carried },
    lanterns: s.lanterns.map((l) => ({
      id: l.id, pos: [r3(l.x), r3(l.y), r3(l.z)], lit: l.lit, deposited: l.deposited,
    })),
    shades: s.shades.map((sh) => ({
      id: sh.id, pos: [r3(sh.x), s.cfg.shade_height, r3(sh.z)], state: sh.state,
    })),
    motes_active: s.motes.length,
    motes: s.motes.map((m) => ({ id: m.id, pos: [r3(m.x), r3(m.y), r3(m.z)] })),
  };
}
