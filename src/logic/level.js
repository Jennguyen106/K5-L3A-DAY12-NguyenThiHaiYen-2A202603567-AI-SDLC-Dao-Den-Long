// Dựng trạng thái ban đầu của Đêm 1 và áp scenario (không phát event, không cộng điểm).
import { mulberry32 } from './rng.js';
import { validateScenario } from './validate.js';

export const r3 = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return r === 0 ? 0 : r; // chuẩn hóa -0
};

const idNum = (id) => {
  const m = /(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
};

export function spawnMote(s) {
  const a = s.rng() * Math.PI * 2;
  const r = s.cfg.mote_min_radius + s.rng() * (s.cfg.mote_max_radius - s.cfg.mote_min_radius);
  const m = { id: `M${s.nextMoteId++}`, x: r * Math.sin(a), y: 0, z: r * Math.cos(a) };
  s.motes.push(m);
  return m;
}

export function spawnShade(s) {
  const a = s.rng() * Math.PI * 2;
  const r = s.cfg.shade_spawn_radius;
  const sh = { id: `S${s.nextShadeId++}`, x: r * Math.sin(a), z: r * Math.cos(a), state: 'chase', stun: 0 };
  s.shades.push(sh);
  return sh;
}

export function createLevel(cfg, seed) {
  const s = {
    cfg,
    rng: mulberry32(seed),
    tick: 0,
    state: 'playing',
    result: null,
    score: 0,
    time_left_ticks: cfg.night_ticks,
    random_motes: true,
    random_shades: true,
    nextMoteId: 1,
    nextShadeId: 1,
    prevButtons: { jump: false, interact: false, pulse: false, dash: false },
    player: { x: 0, y: 0, z: 0, vy: 0, flames: cfg.flames, carried: 0, invuln: 0, pulse_cd: 0 },
    lanterns: [],
    motes: [],
    shades: [],
  };
  for (let i = 0; i < cfg.lantern_count; i++) {
    const phi = (i * 2 * Math.PI) / cfg.lantern_count;
    s.lanterns.push({
      id: `L${i + 1}`,
      x: r3(cfg.lantern_ring_radius * Math.sin(phi)),
      y: 0,
      z: r3(cfg.lantern_ring_radius * Math.cos(phi)),
      lit: false,
      deposited: 0,
    });
  }
  for (let i = 0; i < cfg.mote_initial; i++) spawnMote(s);
  for (let i = 0; i < cfg.shade_initial; i++) spawnShade(s);
  return s;
}

export function applyScenario(s, sc) {
  validateScenario(sc, s.lanterns.map((l) => l.id));
  if (sc.player) {
    const p = s.player;
    if (sc.player.pos) [p.x, p.y, p.z] = sc.player.pos;
    if ('carried' in sc.player) p.carried = sc.player.carried;
    if ('flames' in sc.player) p.flames = sc.player.flames;
  }
  if ('random_motes' in sc) s.random_motes = sc.random_motes;
  if ('random_shades' in sc) s.random_shades = sc.random_shades;
  if (sc.motes) {
    s.motes = [];
    s.nextMoteId = 1;
    for (const [x, y, z] of sc.motes) s.motes.push({ id: `M${s.nextMoteId++}`, x, y, z });
  }
  if (sc.shades) {
    s.shades = [];
    const explicit = sc.shades.filter((d) => d.id).map((d) => idNum(d.id));
    let next = Math.max(0, ...explicit) + 1;
    for (const d of sc.shades) {
      const id = d.id ?? `S${next++}`;
      s.shades.push({ id, x: d.pos[0], z: d.pos[2], state: 'chase', stun: 0 });
    }
    s.nextShadeId = next;
  }
  if (sc.lanterns) {
    for (const d of sc.lanterns) {
      const l = s.lanterns.find((x) => x.id === d.id);
      if (d.pos) [l.x, l.y, l.z] = d.pos;
      if ('deposited' in d) l.deposited = d.deposited;
      if ('lit' in d) l.lit = d.lit;
    }
  }
  if ('time_left_s' in sc) s.time_left_ticks = Math.round(sc.time_left_s * 60);
  return s;
}
