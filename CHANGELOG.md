# Changelog

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
- Số chuẩn thay số tự chọn của Phase 1; thứ tự tick bắt buộc; bản đồ chuẩn Đêm 1.
- Lướt, rơi khỏi đảo và hồi sinh, đom đóm rơi, recoil, 5 trạng thái Bóng Mực, điểm chuẩn hóa.
- Snapshot/scenario/input/event v1.1, `--night 1|2|3` (Đêm 2/3 chưa cài: exit 1).

## Phase 1 – Contract v1.0
- Logic Đêm 1, headless theo Test Contract v1.0, game 3D Three.js.
