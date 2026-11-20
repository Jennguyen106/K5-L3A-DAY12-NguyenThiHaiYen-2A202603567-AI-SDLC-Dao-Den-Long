# Phase 3 – Spec, giả định & tiêu chí nghiệm thu (Change Request "Đèn cạn dầu")

Nguồn: `docs/requirements/TICKET-03.md` (Contract v1.2). Ticket là chuẩn; file này thêm ưu tiên, giả định, AC.

## 1. Ưu tiên (chỉ có 30 phút)
| Mức | Phạm vi |
|---|---|
| **P0** | Logic + Contract v1.2: nhiên liệu, châm dầu, tắt/thắp lại, drain, luật thắng mới, sức chứa tăng dần, điểm mới; cập nhật test cũ có lý do; ADR; CHANGELOG breaking changes |
| **P1** | Hiển thị: thanh dầu, nhấp nháy 1 Hz khi fuel < 30, HUD mang/sức chứa; chế độ mù màu (lưu localStorage) |

## 2. Tuning thêm (game.contract.json, version "1.2")
fuel_max 100 · fuel_decay_per_s 1.0 · fuel_per_mote 10 · relight_cost 5 · win_ratio 0.6 · drain_per_s 5 · low_fuel_threshold 30 · capacity_max 20 · night1/2/3_duration_s 240/270/300.
Điểm (score.*): per_mote 5, per_lantern 100, per_relight 40, per_stun 5, per_stun_drain 15, per_lantern_dawn 50 (+floor(fuel)), per_flame_left 50, per_second_left 0.

## 3. Giả định
- Lưu fuel dạng số nguyên đơn vị 1/60 (fuel_max = 6000); hao 1 đơn vị/tick, mỗi Bóng Mực drain hút 5 đơn vị/tick. Xuất ra chia 60, làm tròn 1 chữ số.
- Đèn đang sáng: `deposited` giữ bằng chi phí đã thắp; khi tắt về 0.
- Thắp lại (ever_lit): nạp dần như thắp mới nhưng chi phí 5; `relit_count` +1; event `lantern_lit` relight:true; +40.
- Châm dầu chỉ phát `refuel` (không phát `deposit`); +5 mỗi đom đóm dùng.
- `fuel_drain` ghi lần đầu sau 60 tick hút liên tục của con đó, rồi mỗi 60 tick.
- `successful_lights` tăng khi thắp mới hoặc thắp lại; sức chứa = min(20, 10 + 2 × successful_lights).
- Mù màu không ảnh hưởng headless.

## 4. Tiêu chí nghiệm thu (P0 có scenario + test)
| AC | Mong đợi |
|---|---|
| P3-01 | contract v1.2 đủ khóa mục 2; snapshot đèn có fuel/ever_lit/relit_count, player có capacity |
| P3-02 | Đèn lit fuel 100, không ai hút: sau 600 tick fuel = 90.0 |
| P3-03 | Đèn lit fuel 1 → tắt đúng tick 60: lantern_out, deposited 0, ever_lit true |
| P3-04 | Thắp lại đèn ever_lit cần 5 đom đóm, lantern_lit relight true, +40 +25 |
| P3-05 | Châm dầu: fuel 55, carried 10 → used 5, fuel 100, event refuel, +25; đèn đầy dầu không được chọn |
| P3-06 | Bóng Mực wander đi tới đèn fuel < 30, cách ≤ 2 m → drain, hút 5/s (+1/s tự hao); fuel = 30 vẫn còn vùng an toàn |
| P3-07 | Drain → chase khi Mây vào 6 m; pulse trúng con đang drain → +15 |
| P3-08 | Thắp đủ 5 đèn không kết thúc Đêm; hết giờ với 3/5 đèn sáng → won dawn_survived; 2/5 → lost dawn |
| P3-09 | Hết lửa ở tick cuối → lost no_flames |
| P3-10 | Sức chứa: sau 2 lần thắp thành công, capacity = 14; tối đa 20 |
| P3-11 | Điểm bình minh: mỗi đèn sáng +50 + floor(fuel), mỗi lửa +50 |
| P3-12 | Test cũ bị thay thế: đã sửa/xóa có comment lý do, không skip |
| P3-13 (UI) | Thanh dầu, nhấp nháy, HUD mang/sức chứa, chế độ mù màu (ảnh chụp) |
