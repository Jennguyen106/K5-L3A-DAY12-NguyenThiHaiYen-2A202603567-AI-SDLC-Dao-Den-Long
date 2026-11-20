// AC13: L1–L4 lit sẵn, carried 10 cạnh L5, interact → won all_lit;
// không cộng điểm cho đèn đặt sẵn.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runHeadless, eventsNamed, contract } from './helpers.js';

test('AC13: thắp L5 thì thắng, đèn đặt sẵn không được cộng điểm', () => {
  const r = runHeadless({ ticks: 10, scenario: 'ac13-win.scenario.json', inputs: 'ac13-win.inputs.json' });
  assert.equal(r.status, 0, r.stderr);

  assert.equal(r.snapshots[0].score, 0, 'dựng scenario không cộng điểm');
  const lit = eventsNamed(r, 'lantern_lit');
  assert.deepEqual(lit.map((e) => e.data.lantern_id), ['L5']);

  const over = eventsNamed(r, 'game_over');
  assert.equal(over.length, 1);
  assert.equal(over[0].tick, 1);
  assert.deepEqual(over[0].data, { result: 'won', reason: 'all_lit' });
  assert.equal(r.end.state, 'won');

  // Điểm: 1 đèn + giây còn lại (sau 1 bước) + lửa còn lại.
  // [v1.1] Điểm chuẩn hóa: thêm per_mote × 10 đom đóm nạp vào L5; per_second_left = 2.
  // = 100 + 100 + 299×2 + 3×50 = 948 (Phase 1: 100 + 299 + 150 = 549).
  const { tuning } = contract();
  const secondsLeft = Math.floor((tuning.night1_duration_s * 60 - 1) / 60);
  const expected = tuning.score.per_mote * tuning.lantern_cost
    + tuning.score.per_lantern
    + tuning.score.per_second_left * secondsLeft
    + tuning.score.per_flame_left * tuning.flames;
  assert.equal(r.end.score, expected);
});
