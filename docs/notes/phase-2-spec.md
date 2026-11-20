# Phase 2 – Spec, giả định, ưu tiên & tiêu chí nghiệm thu

Nguồn: `docs/requirements/TICKET-02.md` (Contract v1.1). Ticket là chuẩn. File này chỉ thêm **ưu tiên**, **giả định** cho chỗ ticket chưa nói rõ, và **AC**.
Số liệu Phase 1 tự chọn bị **thay hoàn toàn** bằng số chuẩn của ticket.

## 1. Ưu tiên (thời gian có hạn, làm theo thứ tự)

| Mức | Phạm vi | Lý do |
|---|---|---|
| **P0** | Phần 1 (số liệu chuẩn, thứ tự tick, điểm, thắng/thua, lướt, rơi, trạng thái Bóng Mực, vùng an toàn, đom đóm rơi) + bản đồ chuẩn Đêm 1 + Contract v1.1 (contract.json, snapshot, scenario, input, event) + sửa test Phase 1 | Test ẩn chấm tự động và chạy regression |
| **P1** | Đêm 2, Đêm 3 (bản đồ, tầng, dốc, bục nhảy, gió) + Gió Lạc + Bùa Gió + pause trong headless | Tính năng mới, mỗi cái cần ≥ 1 scenario |
| **P2** | Giao diện: chuỗi 3 Đêm + menu, tạm dừng, cài đặt (localStorage), HUD đầy đủ, bảng màu, âm thanh, đo FPS | Chất lượng sản phẩm, làm phần còn kịp |

## 2. Tuning v1.1 (`game.contract.json`)

player_speed 6 · carry_capacity 10 · lantern_cost 10 · lantern_count_night1 5 · pickup_radius 1.0 · interact_radius 2.0 · pulse_cost 3 · pulse_radius 5 · night1_duration_s 300 · night2_duration_s 330 · night3_duration_s 360 · flames 3 · invuln_s 1.5 · hit_drop_ratio 0.5 · pulse_stun_s 2 · pulse_push_m 4 · pulse_cooldown_s 3 · safe_radius 6 · shade_speed 4.0 · shade_hit_radius 1.0 · fall_enabled true · dash_speed 14 · dash_duration_s 0.2 · dash_cooldown_s 1.5 · score: per_mote 10, per_lantern 100, per_stun 5, per_second_left 2, per_flame_left 50.

## 3. Giả định (chỗ ticket chưa nói rõ)

- **Tăng tốc/dừng:** tức thời (0 s, thỏa "≤ 0.1 s"). Nhờ vậy test di chuyển của Phase 1 vẫn giữ nguyên kết quả.
- **`per_mote`** từ v1.1 tính khi **nạp** đom đóm vào đèn (+10 mỗi con nạp), không còn tính lúc nhặt. Test AC7 của Phase 1 phải sửa kỳ vọng điểm, kèm lý do.
- **Bóng Mực `spawning`:** kéo dài 30 tick sau khi sinh; trong thời gian đó không di chuyển, không gây hit, rồi chuyển sang `wander`.
- **`wander`:** lượn chậm 1.5 m/s quanh điểm sinh theo PRNG. Chuyển sang `chase` khi Mây cách ≤ 12 m; quay về `wander` khi cách > 18 m.
- **`recoil`:** sau khi gây hit, lùi 2 m trong 60 tick ra xa Mây, rồi quay về `chase` hoặc `wander` tùy khoảng cách.
- **Chọn điểm sinh:** bốc ngẫu nhiên bằng PRNG trong các điểm hợp lệ (điểm trống; với Bóng Mực thì cách Mây ≥ 15 m).
- **Đêm 1:** sinh 2 Bóng Mực tại tick 300, sau đó 1 con mỗi 480 tick, tối đa 6. Đêm 2: mỗi 420 tick, tối đa 8. Đêm 3: mỗi 360 tick, tối đa 10 (lịch đều bắt đầu ở tick 300).
- **Gió (Đêm 3):** cơn đầu tiên bắt đầu ở tick 1800, mỗi cơn dài 300 tick, hướng chọn bằng PRNG. `wind_enabled` mặc định true ở Đêm 3, false ở Đêm 1–2.
- **Gió Lạc idle:** lượn 2 m/s quanh điểm sinh. "Điểm sương" = các điểm sinh Bóng Mực của Đêm đó.
- **Headless chạy một Đêm;** `score` trong output là điểm của Đêm đó.
- **Âm thanh:** tự tạo bằng WebAudio (không dùng file ngoài) và ghi vào CREDITS.md.

## 4. Tiêu chí nghiệm thu (mỗi AC có scenario headless + test, trừ mục ghi "UI")

| AC | Tính năng | Mong đợi |
|---|---|---|
| P2-01 | contract v1.1 | `contract_version` "1.1", tuning đúng mục 2, đủ khóa dash/night2/night3 |
| P2-02 | Regression | Toàn bộ test Phase 1 chạy với số chuẩn; test nào đổi kỳ vọng thì có comment ghi lý do |
| P2-03 | Snapshot v1.1 | Có `night`, `wind`, các trường mới của player, các mảng `motes`/`drifters`/`charms` |
| P2-04 | Lướt | dash từ (0,0,0) hướng +Z: sau 12 tick z ≈ 2.8; dash lại trước 90 tick thì bị bỏ qua |
| P2-05 | Tỏa Sáng | carried 3, Bóng Mực cách 4 m → stunned 120 tick, bị đẩy 4 m trong 15 tick, +5 điểm; carried 2 → không kích hoạt |
| P2-06 | Bị đánh | carried 5 → flames 2, dropped 2, 2 đom đóm `dropped` nằm trong vành 1.5–2.5 m, ttl 8 s; bất tử 90 tick |
| P2-07 | Rơi khỏi đảo | đi ra ngoài bán kính 40 m → `player_hit` by fall, lost = số đang mang; sau 60 tick hồi sinh tại (0,0,0) |
| P2-08 | Vùng an toàn | Bóng Mực không vào trong 6 m quanh đèn đã sáng; con đang ở trong lúc đèn vừa thắp bị đẩy ra trong ≤ 30 tick, không gây hit |
| P2-09 | Thắng/thua | hết lửa → no_flames; đèn cuối thắp đúng tick hết giờ → won |
| P2-10 | Đêm 2 | `--night 2` có 6 đèn và cầu; bục nhảy (20,0,18) đưa Mây đáp xuống đảo B |
| P2-11 | Đêm 3 | `--night 3` có 7 đèn; đi lên dốc 30° tới Y=3; bục (0,3,13) đưa Mây lên tầng 2 (Y=6) |
| P2-12 | Gió | Đêm 3, scenario bật gió: người chơi đứng yên bị đẩy 2 m/s đúng hướng `dir_deg` |
| P2-13 | Gió Lạc | carried 6, Gió Lạc cách 10 m → chase → steal 3 → flee → removed sau 240 tick; pulse lúc chase → flee, không cướp; pulse lúc flee → drop lại đồ đã cướp |
| P2-14 | Bùa Gió | nhặt bùa → `charm_picked` charm_ticks 600; tốc độ 7.2; lướt không hồi chiêu; bùa xuất hiện lại sau 2700 tick |
| P2-15 | Pause | input pause → event paused; `sim_tick` và `time_left_s` đứng yên, state "paused"; pause lần nữa → resumed |
| P2-16 | Hiệu năng headless | một Đêm 21.600 tick chạy xong ≤ 30 s (ghi thời gian đo) |
| P2-17 | UI | menu → giới thiệu Đêm → chơi → kết quả → Đêm kế; Bình Minh sau Đêm 3; thua thì chơi lại Đêm đó (ảnh chụp) |
| P2-18 | UI | tạm dừng Esc/P có Tiếp tục / Chơi lại / Cài đặt / Về menu; cài đặt được lưu (ảnh chụp) |
| P2-19 | UI | HUD đủ các phần, bảng màu chuẩn, có âm thanh (ảnh chụp) |
| P2-20 | UI | ≥ 30 FPS ở 1280×720 (ảnh có số FPS + cấu hình máy) |

## 5. Giả định thêm khi cài P0 (ticket chưa nói rõ)

- **Góc trên bản đồ:** x = r·cos θ, z = r·sin θ. Cách này khớp với "tầng 1 ở nửa z > 0" và các điểm 20°…160° của Đêm 3.
- **Bộ đếm theo tick:** bất tử 90, choáng 120, lướt 12, hồi chiêu lướt 90 / Tỏa Sáng 180, đếm từ tick kích hoạt.
  - Choáng ở tick T thì các tick T…T+119 là `stunned`, tick T+120 hết choáng.
  - Bị đánh ở tick T thì lần chạm sớm nhất tiếp theo là T+90.
  - Rơi ở tick T thì hồi sinh ở tick T+60.
- **Hết choáng / hết recoil:** chuyển sang `chase` nếu Mây cách ≤ 12 m, ngược lại `wander`.
- **Recoil:** lùi đều 2 m trong 60 tick theo hướng ra xa Mây, tính lúc gây hit. Trong lúc recoil không gây hit.
- **Wander:** điểm đích ngẫu nhiên (PRNG) trong bán kính 4 m quanh điểm sinh, tốc độ 1.5 m/s.
- **Bóng Mực trong scenario:** mặc định `wander` (tự chuyển `chase` nếu Mây ≤ 12 m). `state_ticks_left` mặc định: `spawning` 30, `stunned` 120, `recoil` 60.
- **Độ cao Bóng Mực:** tâm luôn ở mặt đất + 1.0 m. Tọa độ y trong scenario bị bỏ qua.
- **Đẩy ra khỏi vùng an toàn:** đẩy đều theo hướng từ đèn ra, tới mép đúng sau tối đa 30 tick. Trong lúc bị đẩy, Bóng Mực không di chuyển theo AI và không gây hit. Áp dụng cho mọi con ở trong vùng của đèn đã sáng, kể cả đèn đặt sẵn `lit: true` trong scenario.
- **Vùng an toàn là vật cản:** di chuyển, recoil và đẩy lùi do Tỏa Sáng đều bị chặn ở mép 6 m.
- **Tỏa Sáng:** trúng mọi Bóng Mực trong tầm, kể cả con đang `spawning`. Hướng đẩy chốt lúc kích hoạt.
- **Điểm trống cho đom đóm:** điểm sinh không có đom đóm `random` nào gắn với nó. Trần 30 tính tổng mọi đom đóm, gồm cả `dropped`. Đom đóm trong scenario không gắn với điểm sinh nào.
- **Đom đóm rơi:** góc và bán kính chọn bằng PRNG trong vành 1.5–2.5 m. Điểm không có đất thì thử lại (tối đa 16 lần); không được thì đặt tại chỗ Mây đứng.
- **Rơi:** Mây rời mặt đất khi bước ra ngoài đảo, rơi theo trọng lực. Chỉ khi Y < −10 mới tính là rơi. Trong 60 tick chờ hồi sinh, Mây đứng yên tại chỗ rơi, không nhặt, không tương tác, không bị chạm.
- **Snapshot `player.invuln`:** kiểu boolean (true khi đang bất tử hoặc đang chờ hồi sinh). `ttl_s` của đom đóm `random` là `null`.
- **Sự kiện `night_start`:** ghi ngay sau snapshot tick 0, với `tick: 0`.
- **Pause:** khi bỏ tạm dừng thì phát `resumed` và chạy tiếp bước mô phỏng ngay trong tick đó.
- **Chưa cài (P1):** `--night 2|3`, Gió Lạc, Bùa Gió, gió. Headless trả exit 1 kèm thông báo khi gặp `--night 2|3`, hoặc scenario có `drifters`/`charms` không rỗng hay `wind_enabled: true`.
