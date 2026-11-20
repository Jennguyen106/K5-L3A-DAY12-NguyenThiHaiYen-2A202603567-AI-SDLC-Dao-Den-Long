// AC2: chạy headless 100 tick → exit 0, dòng cuối type:end, có snapshot tick 0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runHeadless, snapshotAt } from './helpers.js';

test('AC2: headless 100 tick', () => {
  const r = runHeadless({ seed: 7, ticks: 100, scenario: 'ac02-smoke.scenario.json' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.end.type, 'end');
  assert.equal(r.end.ticks, 100);
  const s0 = snapshotAt(r, 0);
  assert.ok(s0, 'phải có snapshot tick 0');
  assert.equal(r.lines[0], s0, 'snapshot tick 0 là dòng đầu tiên');
  assert.equal(s0.state, 'playing');
  assert.deepEqual(s0.player.pos, [0, 0, 0]);
  assert.equal(s0.time_left_s, 300);
  assert.equal(s0.lanterns.length, 5);
  assert.equal(s0.motes_active, 60);
  assert.equal(s0.shades.length, 2);
  // snapshot mặc định mỗi 10 tick: 0, 10, …, 100
  assert.deepEqual(r.snapshots.map((s) => s.tick), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
});
