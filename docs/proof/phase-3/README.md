# Bằng chứng Phase 3 ("Đèn cạn dầu", Contract v1.2)

> **Bằng chứng được tạo trong Phase 4, chạy trên mã của tag phase-3** (commit `c32391d`). Cách tạo: `git worktree` checkout tag `phase-3` vào thư mục tạm, `npm install` mới, `npm test`; xong thì xóa worktree. Lúc chốt Phase 3 chưa có thư mục bằng chứng riêng, và tag `phase-3` bị quên rồi được push muộn (xem `docs/notes/retro.md`).

- Output đầy đủ: [`test-output.txt`](test-output.txt), **47/47 pass, 0 fail, 0 skipped**, exit 0 (14 test Phase 1 + 13 test Phase 2 + 20 test Phase 3).
- Tiêu chí lấy từ `docs/notes/phase-3-spec.md` mục 4. Quyết định thiết kế: `docs/adr/0001-den-can-dau.md`. Thay đổi phá tương thích: `CHANGELOG.md`.

Ký hiệu: ✅ Đạt · ⏳ Chưa làm.

| AC | Mong đợi | Kết quả | File test | Ghi chú |
|---|---|---|---|---|
| P3-01 | Contract v1.2 đủ khóa; snapshot đèn có fuel/ever_lit/relit_count, player có capacity | ✅ Đạt | `tests/p3-01-contract-v12.test.js` | |
| P3-02 | Đèn fuel 100, không ai hút: sau 600 tick fuel = 90.0 | ✅ Đạt | `tests/p3-02-fuel-decay.test.js` | |
| P3-03 | Fuel 1 → tắt đúng tick 60: lantern_out, deposited 0, ever_lit true | ✅ Đạt | `tests/p3-03-lantern-out.test.js` | |
| P3-04 | Thắp lại đèn ever_lit cần 5 đom đóm, relight true, +40 +25 | ✅ Đạt | `tests/p3-04-relight.test.js` | Có thêm ca đối chứng: đèn chưa từng sáng thì 5 đom đóm chưa đủ |
| P3-05 | Châm dầu: fuel 55, carried 10 → used 5, fuel 100, refuel, +25; đèn đầy dầu không được chọn | ✅ Đạt | `tests/p3-05-refuel.test.js` | "Đèn đầy dầu không được chọn" kiểm trên hàm `pickInteractLantern`, không qua headless: hao dầu (bước 2) luôn chạy trước tương tác (bước 5), nên qua headless không dựng được đèn đầy đúng 100 lúc bấm E |
| P3-06 | Wander → đèn fuel < 30, cách ≤ 2 m → drain, hút 5/s (+1/s tự hao); fuel = 30 vẫn còn vùng an toàn | ✅ Đạt | `tests/p3-06-drain.test.js` | |
| P3-07 | Drain → chase khi Mây vào 6 m; pulse trúng con đang drain → +15 | ✅ Đạt | `tests/p3-07-drain-chase-pulse.test.js` | |
| P3-08 | Đủ 5 đèn không kết thúc Đêm; 3/5 → won dawn_survived; 2/5 → lost dawn | ✅ Đạt | `tests/p3-08-dawn-rule.test.js` | |
| P3-09 | Hết lửa ở tick cuối → lost no_flames | ✅ Đạt | `tests/p3-09-no-flames-at-dawn.test.js` | |
| P3-10 | Sau 2 lần thắp thành công capacity = 14; tối đa 20 | ✅ Đạt | `tests/p3-10-capacity.test.js` | Có thêm ca: nhặt không vượt sức chứa |
| P3-11 | Điểm bình minh: mỗi đèn sáng +50 + floor(fuel), mỗi lửa +50 | ✅ Đạt | `tests/p3-11-dawn-score.test.js` | Kỳ vọng 497 được tính tay trước khi chạy |
| P3-12 | Test cũ bị thay thế đã sửa/xóa có comment lý do, không skip | ✅ Đạt | `tests/p3-12-old-tests-updated.test.js` | 6 test cũ có `[v1.2]` (AC1, AC2, AC8, AC13, P2-01, P2-09); không có `test.skip`/`todo` |
| P3-13 (UI) | Thanh dầu, nhấp nháy, HUD mang/sức chứa, chế độ mù màu (ảnh chụp) | ⏳ Chưa làm | — | Tại tag phase-3, giao diện chỉ thêm câu thông báo cho lý do thắng `dawn_survived`. Chưa có thanh dầu, chưa nhấp nháy khi fuel < 30, HUD vẫn hiện sức chứa cố định 10, chưa có chế độ mù màu. Không có ảnh chụp |

**Tổng:** 12/13 đạt (P3-01…P3-12, toàn bộ phần P0 chấm tự động); P3-13 (P1, giao diện) chưa làm.
