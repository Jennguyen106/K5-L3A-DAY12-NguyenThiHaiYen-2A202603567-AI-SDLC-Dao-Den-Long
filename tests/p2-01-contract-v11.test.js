// P2-01: contract_version "1.1", tuning đúng phase-2-spec mục 2, đủ khóa dash/night2/night3.
import test from 'node:test';
import assert from 'node:assert/strict';
import { contract } from './helpers.js';
import { createConfig } from '../src/logic/index.js';

const SPEC_TUNING = {
  player_speed: 6, carry_capacity: 10, lantern_cost: 10, lantern_count_night1: 5,
  pickup_radius: 1.0, interact_radius: 2.0, pulse_cost: 3, pulse_radius: 5,
  night1_duration_s: 300, night2_duration_s: 330, night3_duration_s: 360,
  flames: 3, invuln_s: 1.5, hit_drop_ratio: 0.5, pulse_stun_s: 2, pulse_push_m: 4, pulse_cooldown_s: 3,
  safe_radius: 6, shade_speed: 4.0, shade_hit_radius: 1.0, fall_enabled: true,
  dash_speed: 14, dash_duration_s: 0.2, dash_cooldown_s: 1.5,
  score: { per_mote: 10, per_lantern: 100, per_stun: 5, per_second_left: 2, per_flame_left: 50 },
};

test('P2-01: contract v1.1 và tuning chuẩn', () => {
  const c = contract();
  assert.equal(c.contract_version, '1.1');
  for (const k of ['dash_speed', 'dash_duration_s', 'dash_cooldown_s', 'night2_duration_s', 'night3_duration_s']) {
    assert.ok(k in c.tuning, `thiếu khóa tuning.${k}`);
  }
  assert.deepEqual(c.tuning, SPEC_TUNING);

  // Game dùng đúng các số này (đổi sang tick ở 60 tick/giây).
  const cfg = createConfig(c.tuning);
  assert.equal(cfg.dash_speed, 14);
  assert.equal(cfg.dash_ticks, 12);
  assert.equal(cfg.dash_cooldown_ticks, 90);
  assert.equal(cfg.stun_ticks, 120);
  assert.equal(cfg.pulse_cooldown_ticks, 180);
  assert.equal(cfg.invuln_ticks, 90);
  assert.deepEqual({ ...cfg.night_ticks_by_night }, { 1: 18000, 2: 19800, 3: 21600 });
  assert.equal(cfg.fall_enabled, true);
});
