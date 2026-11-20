# Bằng chứng Phase 4 (Release v1.0.0, Contract v1.3)

Tiêu chí lấy từ `docs/notes/phase-4-spec.md` mục 3.

- Output đầy đủ của `npm test`: [`test-output.txt`](test-output.txt), **70/70 pass, 0 fail, 0 skipped** (gồm toàn bộ test Phase 1–3).
- Soak thật: [`soak.json`](soak.json). Bench thật: [`bench.json`](bench.json). Clone sạch: [`clean-clone.txt`](clean-clone.txt).

Ký hiệu: ✅ Đạt · ⚠️ Một phần · ⏳ Chưa làm.

| AC | Mong đợi | Kết quả | Bằng chứng | Ghi chú |
|---|---|---|---|---|
| P4-01 | Contract v1.3 có bench_cmd, soak_cmd; test cũ Phase 1–3 vẫn xanh | ✅ Đạt | `tests/p4-01-contract-v13.test.js`, `test-output.txt` | 3 test cũ chỉ đổi kỳ vọng version, có comment `[v1.3]` |
| P4-02 | Soak: nights 10, crashes 0, mem_end ≤ 1.2 × mem_start | ✅ Đạt | `soak.json`, `tests/p4-02-soak.test.js` | crashes 0; RSS 46.8 → 53.6 MB (×1.145, khá sát ngưỡng). Mọi Đêm thua `no_flames` sau 1.421–4.429 tick vì input ngẫu nhiên; chi tiết trong `details` |
| P4-03 | Bench chạy 30 s, thoát 0, đủ trường; unit test công thức | ✅ Đạt | `bench.json`, `tests/p4-03-bench-stats.test.js` | avg 148.1 fps · 1% low 76.1 · p95 10.3 ms · load 2062 ms trên máy tự đo (Ryzen 5 7530U, GPU tích hợp). `peak_mem_mb` = null kèm giải thích; ghi thêm `js_heap_peak_mb` |
| P4-04 | Cảnh bench đúng: 200 shade wander, 100 mote, 3 đèn sáng, không spawn thêm | ✅ Đạt | `tests/p4-04-bench-scene.test.js`, `docs/screenshots/bench.png` | Giả định: tắt chuyển chase để cả 200 con ở `wander` |
| P4-05 | Leaderboard: tên sai bị từ chối; top 10; sắp đúng; export đúng thứ tự | ✅ Đạt | `tests/p4-05-leaderboard.test.js` | Test gồm phần đơn vị và server thật (API + export). Luồng nhập tên trên giao diện **chưa** được chơi thử trọn vẹn trong trình duyệt; màn hình Bảng xếp hạng có ảnh `docs/screenshots/leaderboard.png` (dữ liệu thử) |
| P4-06 | Leaderboard còn sau khi tắt/mở lại server | ✅ Đạt | `tests/p4-05-leaderboard.test.js` (tắt rồi mở lại server, dữ liệu còn nguyên) | |
| P4-07 | Đổi phím + báo trùng + khôi phục mặc định, được lưu | ⏳ Chưa làm | — | |
| P4-08 | Phụ đề/chỉ báo, giảm chuyển động, chữ ≥ 18 px, chữ lớn ×1.25 | ⏳ Chưa làm | — | HUD hiện dùng chữ 15 px, **chưa đạt** mức tối thiểu 18 px |
| P4-09 | Clone sạch → 3 lệnh README → chơi được | ✅ Đạt | `clean-clone.txt` | Clone từ GitHub ở commit 667ae3f → `npm install` (4 s) → `npm start` → trang, three.js, API trả 200; trên bản clone `npm test` cũng xanh 70/70. Chỉ thử trên Windows 11 |
| P4-10 | Release v1.0.0 có zip web chạy được + video | ⚠️ Một phần | `tests/p4-10-dist.test.js`, `npm run dist` | `npm run dist` tạo `dist/dao-den-long-web-v1.0.0.zip`; test kiểm zip (CRC, nội dung) và chạy server từ bản đóng gói. **Chưa** tạo GitHub Release, **chưa** có video demo |

**Tổng:** 7/10 đạt (P4-01…P4-06, P4-09); P4-10 một phần; P4-07, P4-08 chưa làm.

**Ngoài bảng AC (TICKET-04 DoD):**
- Tag `phase-4`: có.
- GitHub Release v1.0.0: chưa có.
- Video demo: chưa có.
- Retro: [`docs/notes/retro.md`](../../notes/retro.md).
- Phần còn thiếu từ các phase trước (Gió Lạc, Bùa Gió, gió; giao diện Đêm 2/3; tạm dừng/cài đặt; thanh dầu; âm thanh) ghi ở README, mục "Giới hạn đã biết".
