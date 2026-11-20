# Bằng chứng Phase 2

Tiêu chí lấy từ `docs/notes/phase-2-spec.md` mục 4 (TICKET-02, Contract v1.1).

- Output đầy đủ của `npm test`: [`test-output.txt`](test-output.txt), kết quả **27/27 pass, 0 fail** (14 test Phase 1 + 13 test Phase 2).
- Phạm vi đã làm: **P0** (số chuẩn, thứ tự tick, bản đồ chuẩn Đêm 1, contract v1.1, sửa test Phase 1).
- **P1 dừng giữa chừng** để chuyển phase: phần dở dang (bản đồ Đêm 2/3, dữ liệu Gió Lạc/Bùa Gió) **không** được commit, đang nằm trong `git stash` ("P1 do dang…"). Bản chốt chưa có gì của P1.
- **P2 (giao diện) chưa làm.**

Ký hiệu: ✅ Đạt (có test xanh) · ⚠️ Một phần · ❌ Chưa đạt · ⏳ Chưa làm.

| AC | Tính năng | Kết quả | File test / bằng chứng | Ghi chú |
|---|---|---|---|---|
| P2-01 | Contract v1.1 | ✅ Đạt | `tests/p2-01-contract-v11.test.js` | `contract_version` "1.1", tuning khớp spec mục 2, đủ khóa dash/night2/night3 |
| P2-02 | Regression Phase 1 | ✅ Đạt | `tests/p2-02-regression.test.js`, `tests/ac01…ac14-*.test.js` | Đủ 14 test Phase 1 và đều xanh. 7 test đổi kỳ vọng hoặc scenario (AC1, 2, 7, 8, 9, 13, 14), đều có comment `[v1.1]` ghi lý do |
| P2-03 | Snapshot v1.1 | ✅ Đạt | `tests/p2-03-snapshot-v11.test.js` | Có `night`, `wind`, các trường player mới, mảng `motes`/`drifters`/`charms`, tên trạng thái Bóng Mực chuẩn. `drifters`/`charms` luôn rỗng vì Gió Lạc/Bùa chưa cài |
| P2-04 | Lướt | ✅ Đạt | `tests/p2-04-dash.test.js` | z = 2.8 sau 12 tick; bấm lại ở tick 30 bị bỏ qua |
| P2-05 | Tỏa Sáng | ✅ Đạt | `tests/p2-05-pulse.test.js` | Choáng 120 tick, đẩy 4 m trong 15 tick, +5 điểm; carried 2 thì không kích hoạt |
| P2-06 | Bị đánh | ✅ Đạt | `tests/p2-06-hit.test.js` | flames 2, dropped 2, đom đóm rơi trong vành 1.5–2.5 m, ttl 8 s, bất tử 90 tick, recoil |
| P2-07 | Rơi khỏi đảo | ✅ Đạt | `tests/p2-07-fall.test.js` | `player_hit` by fall, lost 4; hồi sinh tại (0,0,0) sau 60 tick |
| P2-08 | Vùng an toàn | ✅ Đạt | `tests/p2-08-safe-zone.test.js` | Con ở trong lúc đèn thắp bị đẩy ra trong ≤ 30 tick, không gây hit; con bên ngoài bị chặn ở mép 6 m |
| P2-09 | Thắng/thua | ✅ Đạt | `tests/p2-09-win-lose.test.js` | no_flames; thắp đèn cuối đúng tick hết giờ → won; hết lửa luôn thua kể cả khi mọi đèn đã sáng. Ghi chú: "thắp đèn cuối + bị đánh cùng tick" không dựng được theo luật chuẩn, lý do ghi trong test |
| P2-10 | Đêm 2 | ⏳ Chưa làm | — | `--night 2` hiện trả exit 1 ("thuộc phạm vi P1"). Phần bản đồ dở dang nằm trong stash |
| P2-11 | Đêm 3 | ⏳ Chưa làm | — | `--night 3` hiện trả exit 1. Tầng, dốc, vách, bục nhảy, tháp chuông chưa có |
| P2-12 | Gió | ⏳ Chưa làm | — | Snapshot luôn `wind.active: false`; scenario `wind_enabled: true` trả exit 1 |
| P2-13 | Gió Lạc | ⏳ Chưa làm | — | Scenario có `drifters` không rỗng trả exit 1 |
| P2-14 | Bùa Gió | ⏳ Chưa làm | — | Scenario có `charms` không rỗng trả exit 1 |
| P2-15 | Pause | ❌ Chưa đạt (chưa kiểm chứng) | — | Đã cài trong logic (bước 1 của tick: event `paused`/`resumed`, `sim_tick`/thời gian đứng yên, state "paused") nhưng **chưa có scenario + test**, nên không tính là đạt |
| P2-16 | Hiệu năng headless | ✅ Đạt | `tests/p2-16-performance.test.js`, `test-output.txt` | Đêm 1 kéo dài 21.600 tick (scenario `time_left_s: 360`) chạy xong trong 0.58 s (giới hạn 30 s). Máy đo: Windows 11, Node v26.13.1 |
| P2-17 | UI: chuỗi 3 Đêm | ⏳ Chưa làm | — | Giao diện vẫn là bản Phase 1, chỉ có 1 Đêm |
| P2-18 | UI: tạm dừng, cài đặt | ⏳ Chưa làm | — | |
| P2-19 | UI: HUD, bảng màu, âm thanh | ⏳ Chưa làm | — | HUD vẫn là bản Phase 1; chưa áp bảng màu chuẩn; chưa có âm thanh |
| P2-20 | UI: ≥ 30 FPS | ⏳ Chưa làm | — | Chưa đo |

**Tổng:** 10/20 đạt (P2-01…P2-09 và P2-16). P2-15 đã cài nhưng chưa kiểm chứng. P2-10…P2-14 và P2-17…P2-20 chưa làm.

**Lưu ý thêm:** giao diện đã được sửa cho chạy với logic v1.1 (Shift để lướt; Mây có thể rơi khỏi đảo), nhưng **chưa chơi thử lại trên trình duyệt** sau khi đổi sang số chuẩn, nên chưa có ảnh chụp.
