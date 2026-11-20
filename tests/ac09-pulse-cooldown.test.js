// AC9: shade cách 5 m và 10 m, carried 4, pulse 2 lần liền →
// lần 1 chỉ choáng con 5 m; lần 2 bị cooldown chặn.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runHeadless, eventsNamed, snapshotAt } from './helpers.js';

test('AC9: pulse lần 1 choáng S1, lần 2 bị cooldown chặn', () => {
  const r = runHeadless({
    ticks: 10, every: 1,
    scenario: 'ac09-pulse-cooldown.scenario.json', inputs: 'ac09-pulse-cooldown.inputs.json',
  });
  assert.equal(r.status, 0, r.stderr);
  const pulses = eventsNamed(r, 'pulse');
  assert.equal(pulses.length, 1, 'chỉ có 1 lần pulse thành công');
  assert.equal(pulses[0].tick, 1);
  assert.deepEqual(pulses[0].data, { stunned_ids: ['S1'] });

  const s1 = snapshotAt(r, 1);
  assert.equal(s1.player.carried, 2);
  assert.equal(s1.score, 20);
  assert.equal(s1.shades.find((s) => s.id === 'S1').state, 'stunned');
  assert.notEqual(s1.shades.find((s) => s.id === 'S2').state, 'stunned');

  // Lần bấm thứ 2 (tick 2) không trừ đom đóm, không cộng điểm.
  const s3 = snapshotAt(r, 3);
  assert.equal(s3.player.carried, 2);
  assert.equal(s3.score, 20);
});
