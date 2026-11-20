// Dựng cấu hình mô phỏng từ khối "tuning" của game.contract.json.
// Việc đọc file nằm ngoài src/logic (headless/render tự đọc rồi truyền vào).

export const TICK_RATE = 60;

// Hằng số màn Đêm 1 – Đảo Bến (phase-1-spec mục 2, 4).
export const LEVEL = Object.freeze({
  island_radius: 40,
  lantern_ring_radius: 25,
  mote_min_radius: 3,
  mote_max_radius: 38,
  mote_initial: 60,
  mote_respawn_every_ticks: 120,
  mote_respawn_below: 20,
  shade_initial: 2,
  shade_spawn_radius: 38,
  shade_spawn_every_ticks: 1800,
  shade_max: 6,
  shade_height: 1.0,
  jump_velocity: 6,
  gravity: 20,
});

const NUMERIC_KEYS = [
  'player_speed', 'carry_capacity', 'lantern_cost', 'lantern_count_night1',
  'pickup_radius', 'interact_radius', 'pulse_cost', 'pulse_radius',
  'night1_duration_s', 'flames', 'invuln_s', 'hit_drop_ratio', 'pulse_stun_s',
  'pulse_push_m', 'pulse_cooldown_s', 'safe_radius', 'shade_speed', 'shade_hit_radius',
];
const SCORE_KEYS = ['per_mote', 'per_lantern', 'per_stun', 'per_second_left', 'per_flame_left'];

const secToTicks = (s) => Math.round(s * TICK_RATE);

export function createConfig(tuning) {
  if (!tuning || typeof tuning !== 'object') throw new Error('tuning missing');
  for (const k of NUMERIC_KEYS) {
    if (typeof tuning[k] !== 'number' || !Number.isFinite(tuning[k])) {
      throw new Error(`tuning.${k} must be a number`);
    }
  }
  const score = tuning.score ?? {};
  for (const k of SCORE_KEYS) {
    if (typeof score[k] !== 'number') throw new Error(`tuning.score.${k} must be a number`);
  }
  return Object.freeze({
    tuning,
    ...LEVEL,
    player_speed: tuning.player_speed,
    carry_capacity: tuning.carry_capacity,
    lantern_cost: tuning.lantern_cost,
    lantern_count: tuning.lantern_count_night1,
    pickup_radius: tuning.pickup_radius,
    interact_radius: tuning.interact_radius,
    pulse_cost: tuning.pulse_cost,
    pulse_radius: tuning.pulse_radius,
    night_ticks: secToTicks(tuning.night1_duration_s),
    flames: tuning.flames,
    invuln_ticks: secToTicks(tuning.invuln_s),
    hit_drop_ratio: tuning.hit_drop_ratio,
    stun_ticks: secToTicks(tuning.pulse_stun_s),
    pulse_push_m: tuning.pulse_push_m,
    pulse_cooldown_ticks: secToTicks(tuning.pulse_cooldown_s),
    safe_radius: tuning.safe_radius,
    shade_speed: tuning.shade_speed,
    shade_hit_radius: tuning.shade_hit_radius,
    fall_enabled: tuning.fall_enabled === true,
    score: Object.freeze({ ...score }),
  });
}
