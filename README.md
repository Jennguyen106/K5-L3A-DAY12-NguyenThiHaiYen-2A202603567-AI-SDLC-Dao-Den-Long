# Đảo Đèn Lồng

Game 3D chạy trên trình duyệt (Three.js). Bạn điều khiển Mây, người giữ đèn nhỏ tuổi của Đảo Bến. Mây chạy khắp đảo nhặt đom đóm, mang về thắp lại 5 Đèn Lồng Lớn và tránh những Bóng Mực tím đen sống trong sương.

Day 12 · AI SDLC Lab · Phase 1. Team: `2A202603567-nguyen-thi-hai-yen`.

## Cài đặt và chạy

Cần Node.js ≥ 18. Chạy được trên macOS, Linux và Windows.

```bash
npm install                     # cài three.js
npm start                       # mở server, rồi vào URL được in ra (mặc định http://localhost:8080/)
node src/headless.js --seed 42 --night 1 --ticks 3000 --out out.jsonl   # chế độ headless
```

Tham số đầy đủ của headless theo Test Contract v1.0:

```
node src/headless.js --seed <int> --night 1 [--scenario <file.json>] [--inputs <file.json>]
                     --ticks <int> --out <file.jsonl> [--snapshot-every <int, mặc định 10>]
```

Mã thoát: `0` là chạy xong, `1` là tham số sai hoặc không đọc được file, `2` là file inputs/scenario sai định dạng.

## Điều khiển

| Phím | Hành động |
|---|---|
| W A S D (hoặc ↑ ↓) | Đi |
| Chuột (bấm vào màn hình để khóa chuột) hoặc Q / Z (hoặc ← →) | Xoay camera |
| Space | Nhảy |
| E | Nạp đom đóm vào đèn ở gần |
| F | Tỏa sáng: xua Bóng Mực, tốn 2 đom đóm |
| R | Chơi lại |

Mỗi ván dùng một seed ngẫu nhiên. Muốn chơi lại đúng một ván thì thêm `?seed=42` vào URL.

## Luật và cách tính điểm

- Nhặt đom đóm bằng cách đi tới gần (≤ 1.5 m), mang tối đa 10 con.
- Đứng gần đèn (≤ 2.5 m) và bấm E để nạp. Đủ 10 đom đóm thì đèn thắp sáng.
- Bóng Mực đuổi theo Mây. Bị chạm thì mất 1 lửa, rơi mất một nửa số đom đóm đang mang, rồi được bất tử 1.5 s.
- Tỏa sáng (F) làm choáng mọi Bóng Mực trong 6 m trong 3 s và đẩy chúng lùi 4 m. Hồi chiêu 2 s.
- Bóng Mực không vào được vùng 6 m quanh đèn đã thắp.
- Thắp đủ 5 đèn thì **thắng**. Hết lửa thì **thua**. Hết 300 s (trời sáng) mà chưa thắp đủ đèn cũng **thua**.

| Sự kiện | Điểm |
|---|---|
| Nhặt 1 đom đóm | +10 |
| Thắp 1 đèn | +100 |
| Mỗi Bóng Mực bị choáng | +20 |
| Khi thắng: mỗi giây còn lại (làm tròn xuống) | +1 |
| Khi thắng: mỗi lửa còn lại | +50 |

Đèn đặt sẵn `lit: true` trong scenario không được cộng điểm.

## Chạy test

```bash
npm test
```

Có 14 test node:test (AC1–AC14 trong `tests/`), mỗi test chạy headless thật trên một scenario trong `scenarios/`. Bằng chứng nằm ở [`docs/proof/phase-1/`](docs/proof/phase-1/README.md).

## Tuning (`game.contract.json`)

Game đọc trực tiếp khối `tuning` trong `game.contract.json` (qua `createConfig` trong `src/logic/config.js`), nên số khai báo cũng chính là số game đang dùng. Đơn vị độ dài là mét, khoảng cách đo theo mặt phẳng XZ.

| Khóa | Giá trị | Ý nghĩa |
|---|---|---|
| `player_speed` | 6 | Tốc độ chạy của Mây (m/s) |
| `carry_capacity` | 10 | Số đom đóm mang được tối đa |
| `lantern_cost` | 10 | Số đom đóm cần để thắp 1 đèn |
| `lantern_count_night1` | 5 | Số Đèn Lồng Lớn ở Đêm 1 |
| `pickup_radius` | 1.5 | Bán kính tự nhặt đom đóm |
| `interact_radius` | 2.5 | Bán kính nạp đèn khi bấm E |
| `pulse_cost` | 2 | Số đom đóm tốn cho 1 lần tỏa sáng |
| `pulse_radius` | 6 | Bán kính tỏa sáng |
| `night1_duration_s` | 300 | Thời lượng Đêm 1 (s) |
| `flames` | 3 | Số lửa ("máu") ban đầu |
| `invuln_s` | 1.5 | Thời gian bất tử sau khi bị chạm |
| `hit_drop_ratio` | 0.5 | Tỉ lệ đom đóm rơi mất khi bị chạm (làm tròn xuống) |
| `pulse_stun_s` | 3 | Thời gian Bóng Mực bị choáng |
| `pulse_push_m` | 4 | Khoảng cách đẩy Bóng Mực ra xa |
| `pulse_cooldown_s` | 2 | Hồi chiêu tỏa sáng |
| `safe_radius` | 6 | Bán kính quanh đèn **đã thắp** mà Bóng Mực không vào được |
| `shade_speed` | 3.5 | Tốc độ Bóng Mực (m/s) |
| `shade_hit_radius` | 1.0 | Khoảng cách Bóng Mực chạm được Mây |
| `fall_enabled` | `false` | Không có rơi khỏi đảo: Mây bị chặn ở mép đảo (bán kính 40 m), nên không có event `player_hit` với `by: "fall"` |
| `score.*` | xem bảng điểm | Điểm cho mỗi sự kiện |

Các giả định cho chỗ PRD còn mơ hồ (thứ tự bước, đếm tick, sinh đom đóm/Bóng Mực…) được ghi ở [`docs/notes/phase-1-spec.md`](docs/notes/phase-1-spec.md).

## Cấu trúc

- `src/logic/`: luật game thuần JS, tất định (mulberry32), không đồ họa. Game và headless dùng chung.
- `src/render/`: hiển thị 3D bằng Three.js, HUD, điều khiển.
- `src/headless.js`: chế độ không giao diện theo Test Contract v1.0.
- `tools/serve.js`: server tĩnh không dùng thư viện (`npm start`).
- `scenarios/`, `tests/`: tình huống và test AC1–AC14.
