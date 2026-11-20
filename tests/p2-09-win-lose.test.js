// P2-09: hết lửa → no_flames; đèn cuối thắp đúng tick hết giờ → won;
// hết lửa luôn thua, kể cả khi mọi đèn đã sáng cùng tick.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runHeadless, eventsNamed } from './helpers.js';

const over = (r) => eventsNamed(r, 'game_over');

test('P2-09: hết lửa → lost no_flames', () => {
  const r = runHeadless({ ticks: 50, scenario: 'p2-09-no-flames.scenario.json' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(over(r).map((e) => [e.tick, e.data]), [[1, { result: 'lost', reason: 'no_flames' }]]);
  assert.equal(r.end.state, 'lost');
});

test('P2-09: thắp đèn cuối đúng tick hết giờ → won', () => {
  const r = runHeadless({
    ticks: 50, scenario: 'p2-09-win-at-timeout.scenario.json', inputs: 'p2-09-interact.inputs.json',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(over(r).map((e) => [e.tick, e.data]), [[1, { result: 'won', reason: 'all_lit' }]]);
  assert.equal(r.end.state, 'won');
  // 10 đom đóm nạp ×10 + 1 đèn ×100 + 0 giây còn lại ×2 + 3 lửa ×50.
  assert.equal(r.end.score, 100 + 100 + 0 + 150);
});

// Không thể dựng "thắp đèn cuối + bị Bóng Mực đánh" cùng tick: muốn nạp thì Mây phải cách đèn ≤ 2 m,
// nên con đứng sát Mây (≤ 1 m) chắc chắn nằm trong vùng 6 m và bị đẩy ra, không gây hit (P2-08).
// Vì vậy scenario đặt sẵn cả 5 đèn đã sáng; Mây ở giữa đảo, xa mọi vùng an toàn.
test('P2-09: mọi đèn đã sáng nhưng hết lửa ở tick đó → vẫn thua no_flames', () => {
  const r = runHeadless({ ticks: 50, scenario: 'p2-09-all-lit-but-no-flames.scenario.json' });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.snapshots[0].lanterns.every((l) => l.lit));
  assert.deepEqual(over(r).map((e) => [e.tick, e.data]), [[1, { result: 'lost', reason: 'no_flames' }]]);
  assert.equal(r.end.state, 'lost');
});
