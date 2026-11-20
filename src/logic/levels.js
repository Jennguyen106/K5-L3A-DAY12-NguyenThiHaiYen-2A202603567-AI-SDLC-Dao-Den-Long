// Bản đồ chuẩn (TICKET-02 Phần 2). Góc đo từ trục +X, ngược chiều kim đồng hồ nhìn từ trên xuống:
// x = r·cos(θ), z = r·sin(θ)  (nhờ vậy các điểm 20°…160° của Đêm 3 nằm ở nửa z > 0).
// P0 mới có Đêm 1. Đêm 2 và 3 thuộc P1.

const rad = (d) => (d * Math.PI) / 180;

export function ring(r, startDeg, stepDeg, n, y = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rad(startDeg + i * stepDeg);
    pts.push([r * Math.cos(a), y, r * Math.sin(a)]);
  }
  return pts;
}

export const NIGHTS = Object.freeze({
  1: Object.freeze({
    night: 1,
    name: 'Đảo Bến',
    radius: 40,
    start: [0, 0, 0],
    facing: [0, 1], // quay mặt về +Z
    lanterns: [
      ['L1', 0, 0, 25],
      ['L2', 23.8, 0, 7.7],
      ['L3', 14.7, 0, -20.2],
      ['L4', -14.7, 0, -20.2],
      ['L5', -23.8, 0, 7.7],
    ],
    mote_points: [...ring(12, 0, 45, 8), ...ring(33, 0, 22.5, 16)],
    mote_initial: 20,
    shade_points: ring(37, 15, 30, 12),
    shade_schedule: { first_tick: 300, first_count: 2, every_ticks: 480, max: 6 },
    // Độ cao mặt đất tại (x, z); null = không có đất (biển mây → rơi).
    ground(x, z) {
      return Math.hypot(x, z) <= 40 ? 0 : null;
    },
  }),
});

export class UnsupportedError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'UnsupportedError';
  }
}

export function getNight(n) {
  const L = NIGHTS[n];
  if (!L) throw new UnsupportedError(`night ${n} is not implemented yet (Đêm 2/3 thuộc phạm vi P1)`);
  return L;
}
