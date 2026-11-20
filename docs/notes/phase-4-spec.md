# Phase 4 – Spec, thiết kế & tiêu chí nghiệm thu (Release v1.0.0)

Nguồn: `docs/requirements/TICKET-04.md` (Contract v1.3). Ticket là chuẩn.

## 1. Ưu tiên
| Mức | Phạm vi |
|---|---|
| **P0** | Contract v1.3; soak (headless, tự động chấm); bench; bench.json + soak.json commit vào repo |
| **P1** | Bảng xếp hạng + lệnh export; đóng gói (README ≤ 3 lệnh, `npm run dist`), CHANGELOG 4 phase, CREDITS, LICENSE |
| **P2** | Accessibility (đổi phím, phụ đề/chỉ báo, giảm chuyển động, cỡ chữ); phần UI còn thiếu của Phase 2–3 |
| **Bắt buộc cuối** | Retro, bằng chứng phase 4, tag phase-4, Release v1.0.0, video |

## 2. Quyết định thiết kế
- **Soak:** `node src/soak.js --seed 7 --nights 10 --out soak.json`. Dùng chung src/logic, input ngẫu nhiên bằng PRNG (seed 7+i) đúng tỉ lệ ticket. RSS đo bằng `process.memoryUsage().rss`. Mỗi Đêm chạy trong try/catch để đếm crashes.
- **Bench (bản web):** `node tools/bench.js --seed 42 --duration 30 --out bench.json`. Dùng Playwright mở Chromium **có cửa sổ** 1280×720 (cờ `--disable-gpu-vsync --disable-frame-rate-limit`) tới `index.html?bench=1&seed=42`. Trang ở chế độ bench dựng cảnh chuẩn (200 Bóng Mực wander, 100 đom đóm, L1–L3 sáng fuel 100, tắt spawn/sát thương/nhặt/hao dầu/kết thúc), camera bay vòng theo ticket, ghi dt từng khung bằng requestAnimationFrame. 3 s khởi động không đo. Node tính avg_fps, p1_low_fps, frame_ms_p95, frames, load_ms (từ lúc tiến trình bench bắt đầu tới khung đầu tiên của cảnh). peak_mem_mb: lấy từ Chrome DevTools Protocol (`Performance.getMetrics` / JSHeapUsedSize) hoặc null kèm giải thích trong README. `build_cmd` thêm `npx playwright install chromium`.
- **Bảng xếp hạng:** lưu ở file `data/leaderboard.json` qua server `tools/serve.js` (API GET/POST `/api/leaderboard`), nên vẫn còn sau khi tắt game. `npm start -- --export-leaderboard out.json` đọc file đó, ghi `{"entries":[...]}` rồi thoát. Validate tên ở cả client và server; top 10; sắp score giảm dần, bằng điểm thì achieved_at sớm hơn đứng trên. `data/` có trong .gitignore.
- **Release:** `npm run dist` tạo thư mục `dist/` (index.html, src, three.module.js, tools/serve.js) và `dist/dao-den-long-web-v1.0.0.zip`; chạy bằng `node serve.js` hoặc bất kỳ server tĩnh nào.

## 3. Tiêu chí nghiệm thu
| AC | Mong đợi |
|---|---|
| P4-01 | contract v1.3 có bench_cmd, soak_cmd; test cũ Phase 1–3 vẫn xanh |
| P4-02 | soak: nights 10, crashes 0, mem_end_mb ≤ 1.2 × mem_start_mb (test tự động với nights nhỏ + chạy thật 10 Đêm lưu docs/proof/phase-4/soak.json) |
| P4-03 | bench chạy 30 s, thoát 0, bench.json đủ trường; công thức avg/p1_low/p95 có unit test trên mảng dt mẫu |
| P4-04 | Cảnh bench đúng: 200 shade wander, 100 mote, 3 đèn sáng, không spawn thêm (test logic chế độ bench) |
| P4-05 | Leaderboard: tên sai bị từ chối; top 10; sắp đúng; export đúng thứ tự (test) |
| P4-06 | Leaderboard còn sau khi tắt/mở lại server (ảnh hoặc test) |
| P4-07 | Đổi phím + báo trùng + khôi phục mặc định, được lưu (ảnh) |
| P4-08 | Phụ đề/chỉ báo, giảm chuyển động, chữ ≥ 18 px, chữ lớn ×1.25 (ảnh) |
| P4-09 | Clone sạch → 3 lệnh README → chơi được (ghi lệnh + kết quả) |
| P4-10 | Release v1.0.0 có zip web chạy được + video |

## 4. Giả định khi cài P0
- **Soak:**
  - Đêm thứ i (0-based) là Đêm `1 + (i mod 3)`, seed `7 + i`. Input dùng PRNG riêng `mulberry32((seed ^ 0x9e3779b9) >>> 0)`.
  - Mỗi 30 tick chọn hướng mới (vector đơn vị, `cam_yaw_deg` 0). Mỗi tick các nút được bốc true/false theo xác suất, nên có cạnh lên.
  - RSS đo sau `global.gc()` khi chạy với `--expose-gc` (có trong `soak_cmd`).
  - soak.json có thêm `details` (Đêm, seed, lý do, số tick) làm bằng chứng.
- **Đêm 2/3 (để soak xoay vòng được):** đã cài địa hình (đảo, cầu, tầng, dốc, vách, tháp chuông, bục nhảy), đèn, đom đóm, lịch Bóng Mực, Bóng Mực Đêm 3 4.5 m/s. **Chưa cài** Gió Lạc, Bùa Gió, gió mạnh: các Đêm này chạy không có chúng. Đêm 3 xuất phát (0,0,−30), vì (0,0,0) nằm trong tháp chuông.
- **Bench:**
  - Cả 200 Bóng Mực giữ trạng thái `wander`: tắt chuyển sang chase khi Mây ≤ 12 m, để "di chuyển theo luật wander". Theo luật v1.2, wander đi về đèn tắt gần nhất (L4, L5) nên nhiều con dồn về đó.
  - Bóng Mực và đom đóm rải đều theo diện tích trên đĩa bán kính 38 m, PRNG riêng từ seed. Bóng Mực không đặt trong vùng an toàn 6 m của L1–L3.
- **Camera bench:** (30·cos θ, 15, 30·sin θ) với θ = 2π·t/15, t tính từ khung đầu tiên của cảnh. Cùng quy ước góc của bản đồ (ngược chiều kim đồng hồ nhìn từ trên xuống).
- **Đo bench:**
  - dt = hiệu timestamp `requestAnimationFrame`. Khoảng đo bắt đầu sau 3 s và kết thúc khi tổng dt ≥ `duration`.
  - `p95` theo nearest-rank.
  - `load_ms` = khung đầu tiên (epoch) − thời điểm tiến trình `tools/bench.js` bắt đầu (`Date.now() − process.uptime()`).
  - `peak_mem_mb` = null: không đo được RSS của Chromium một cách đa nền tảng; kèm `js_heap_peak_mb` (JS heap của trang, qua CDP).
  - `vsync_off` = true dựa trên cờ `--disable-gpu-vsync --disable-frame-rate-limit`; FPS đo được vượt 60 cho thấy cờ có hiệu lực.
