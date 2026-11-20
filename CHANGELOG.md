# Changelog

## [1.0.0] Phase 4 – Contract v1.3 "Bình minh: phát hành" (TICKET-04)

### Thêm mới
- **Contract v1.3:** `game.contract.json` thêm `bench_cmd` (`node tools/bench.js`) và `soak_cmd` (`node --expose-gc src/soak.js`). `build_cmd` thêm `npx playwright install chromium`.
- **Soak test** `src/soak.js`: 10 Đêm xoay vòng 1 → 2 → 3, input ngẫu nhiên theo seed, đo RSS. Kết quả thật: `docs/proof/phase-4/soak.json`.
- **Benchmark:**
  - Chế độ `index.html?bench=1`: cảnh chuẩn 200 Bóng Mực, 100 đom đóm, L1–L3 sáng; camera bay vòng.
  - `tools/bench.js` dùng Playwright mở Chromium có cửa sổ 1280×720, tắt vsync.
  - Công thức số đo ở `src/bench-stats.js`. Kết quả thật: `docs/proof/phase-4/bench.json`.
- **Địa hình Đêm 2/3** trong logic: hai đảo + cầu tre, ba tầng, dốc, vách đứng, tháp chuông, bục nhảy. Bóng Mực Đêm 3 chạy 4.5 m/s. Đêm 3 xuất phát ở (0,0,−30).
- **Bảng xếp hạng cục bộ:**
  - API `/api/leaderboard` trong `tools/serve.js`, lưu `data/leaderboard.json`.
  - Nhập tên sau khi Đêm kết thúc; màn hình Bảng xếp hạng từ menu.
  - Xuất bằng `npm start -- --export-leaderboard out.json`.
- **Đóng gói:** `npm run dist` tạo `dist/dao-den-long-web-v1.0.0/` và file zip (không dùng thư viện ngoài).
- README đầy đủ (yêu cầu hệ thống, cài đặt, điều khiển, test, headless, bench, soak, ảnh chụp), CREDITS, LICENSE (MIT).
- Test P4-01…P4-05, P4-10; P2-10/P2-11 (phần địa hình).

### Thay đổi
- `contract_version` "1.2" → "1.3". Tuning và luật v1.0–v1.2 giữ nguyên.
- `--night 2|3` chạy được (trước đó trả exit 1).
- `package.json` lên version 1.0.0.
- 3 test cũ đổi kỳ vọng version, kèm comment `[v1.3]`.

### Chưa làm
- Gió Lạc, Bùa Gió, gió mạnh Đêm 3.
- Chuỗi 3 Đêm, tạm dừng và cài đặt trên giao diện.
- Accessibility (đổi phím, phụ đề, giảm chuyển động, cỡ chữ), âm thanh.

## Phase 3 – Contract v1.2 "Đèn cạn dầu" (TICKET-03)

Quyết định thiết kế: [`docs/adr/0001-den-can-dau.md`](docs/adr/0001-den-can-dau.md).

### Breaking changes
- `contract_version` đổi `"1.1"` → `"1.2"`.
- **Thời lượng Đêm** 1/2/3: 300/330/360 s → **240/270/300 s**.
- **Luật thắng thay thế:** không còn thắng ngay khi mọi đèn sáng. Chỉ xét ở bình minh:
  - còn sống và số đèn đang sáng ≥ `ceil(0.6 × tổng đèn)` → `won / dawn_survived`;
  - dưới ngưỡng → `lost / dawn`;
  - hết Ngọn Lửa luôn thua `no_flames` trước, kể cả ở tick cuối.
- `game_over.reason`: **bỏ `all_lit`**, thêm `dawn_survived`.
- **Bảng điểm thay toàn bộ** (`tuning.score`):
  - Mỗi đom đóm nạp: +10 → **+5**; giờ tính cả khi thắp lại và châm dầu.
  - Thắp lần đầu: +100. Thắp lại: **+40** (mới).
  - Tỏa Sáng: +5 mỗi con, **+15 nếu con đó đang `drain`**.
  - Bình minh (chỉ khi thắng): mỗi đèn đang sáng **+50 + floor(fuel)**, mỗi lửa +50.
  - **Bỏ thưởng thời gian** (`per_second_left` = 0).
  - Khóa mới: `per_relight`, `per_stun_drain`, `per_lantern_dawn`.
- **Đèn đã sáng có thể tắt:** hết dầu thì `lit` về false, `deposited` về 0. Đèn đã sáng nhận thêm đom đóm để châm dầu (trước đó: không nhận).
- **Vùng an toàn** chỉ còn ở đèn sáng có fuel ≥ 30 (trước đó: mọi đèn đã sáng).
- **Bóng Mực:** thêm trạng thái `drain`; hết choáng thì về `wander` (trước đó: `chase` nếu Mây trong 12 m); `wander` ưu tiên đi tới đèn yếu, rồi tới đèn tắt.
- **Sức chứa** không còn cố định 10: `min(20, 10 + 2 × successful_lights)`.
- Sự kiện `lantern_lit` thêm trường `relight` (`true|false`).

### Thêm mới (không phá tương thích)
- `tuning`: `fuel_max`, `fuel_decay_per_s`, `fuel_per_mote`, `relight_cost`, `win_ratio`, `drain_per_s`, `low_fuel_threshold`, `capacity_max`.
- Snapshot: mỗi đèn thêm `fuel` (1 chữ số thập phân; đèn tắt 0), `ever_lit`, `relit_count`; `player.capacity`.
- Scenario: `lanterns[].fuel`, `lanterns[].ever_lit` (đèn `lit: true` không có `fuel` thì mặc định 100); `player.successful_lights`; `shades[].target_lantern_id` (bắt buộc khi `state: "drain"`).
- Sự kiện mới: `refuel {lantern_id, amount, fuel}`, `lantern_out {lantern_id}`, `fuel_drain {lantern_id, shade_id, fuel}` (mỗi 60 tick hút).

### Test
- 6 test cũ sửa kỳ vọng, mỗi chỗ có comment `[v1.2]`:
  - AC1, P2-01: contract 1.2.
  - AC2: Đêm 1 dài 240 s.
  - AC8: điểm 150, `relight: false`.
  - AC13: bỏ phần "thắng", giữ phần "đèn đặt sẵn không được điểm".
  - P2-09: `dawn_survived`, điểm mới.
- Không test nào bị skip. Thêm P3-01…P3-12.

## Phase 2 – Contract v1.1 (TICKET-02, P0)

### Breaking changes
- Số chuẩn TICKET-02 thay toàn bộ số tự chọn của Phase 1, ví dụ:
  - nhặt 1.0 m (trước 1.5), tương tác 2.0 m (trước 2.5);
  - Tỏa Sáng tốn 3, bán kính 5 m đo 3D (trước tốn 2, bán kính 6 m);
  - Bóng Mực 4.0 m/s (trước 3.5).
- Đầu Đêm có 20 đom đóm (trước 60). Bóng Mực sinh từ tick 300 (trước có sẵn 2 con).
- Điểm: +10 mỗi đom đóm **nạp** (trước tính khi nhặt); thưởng thắng 2 điểm mỗi giây còn lại.
- `fall_enabled` = true: đi ra ngoài đảo là rơi (trước bị chặn ở mép).
- Trạng thái Bóng Mực dùng tên chuẩn: `spawning`, `wander`, `chase`, `recoil`, `stunned`.

### Thêm mới
- Thứ tự 11 bước trong một tick (pause xử lý trước); bản đồ chuẩn Đêm 1.
- Lướt, rơi khỏi đảo và hồi sinh, đom đóm rơi ra vành 1.5–2.5 m (TTL 8 s), recoil, đẩy Bóng Mực ra khỏi vùng an toàn khi đèn vừa thắp, pause.
- Snapshot/scenario/input/event v1.1:
  - trường mới: `night`, `wind`, `vel`, `grounded`, `invuln`, `dash_cd_s`…;
  - sự kiện mới: `dash`, `night_start`, `paused`/`resumed`.
- AGENTS.md cho Phase 2; skill `.claude/skills/verify`.
- Test P2-01…P2-09, P2-16. Sửa 7 test Phase 1 kèm comment `[v1.1]`.

## Phase 1 – Contract v1.0 (PRD-0)
- Logic Đêm 1 thuần JS, tất định (`mulberry32`), không đồ họa trong `src/logic`.
- Headless theo Test Contract v1.0 (`src/headless.js`): JSONL snapshot/event/end, mã thoát 0/1/2.
- Game 3D Three.js trong trình duyệt (`npm start`): HUD, màn hình thắng/thua, chơi lại.
- `game.contract.json` v1.0; test AC1–AC14; bằng chứng `docs/proof/phase-1/`.
