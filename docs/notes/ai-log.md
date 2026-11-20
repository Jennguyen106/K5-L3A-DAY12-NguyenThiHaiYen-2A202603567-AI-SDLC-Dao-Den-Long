# AI Log

| Phase | Việc giao cho AI | AI làm đúng/sai gì | Token/chi phí ước tính | Cách tiết kiệm |
|-------|------------------|--------------------|------------------------|----------------|
| Phase 1 | Dựng khung repo; chép PRD/spec; viết logic `src/logic`, headless, 14 test AC1–AC14; game 3D Three.js + HUD; server tĩnh; bằng chứng `docs/proof/phase-1` | **Đúng:** 14/14 test xanh, headless tất định (seed 42 chạy 2 lần cho cùng SHA-256), không sửa luật trong `src/logic` khi làm đồ họa. **Sai/vướng:** (1) Test AC8 ban đầu đọc nhầm snapshot tick 0 (chạy 5 tick mà snapshot mặc định mỗi 10 tick, nên chỉ có tick 0, trước khi nạp đèn). Đã sửa cách lấy snapshot (`--snapshot-every 1`), giữ nguyên kỳ vọng. (2) Prompt gán phím E cho 2 việc ("Q/E xoay camera" và "E nạp đèn"); Claude hỏi lại, chốt E nạp đèn, Q/Z xoay. (3) Node.js mới cài bằng winget nhưng chưa có trong PATH của phiên đang chạy, phải gọi bằng đường dẫn đầy đủ. | | Viết spec + AC chi tiết trước khi code; tính tay kỳ vọng các AC từ trước để không phải chạy đi chạy lại; chia commit nhỏ theo từng phần; hỏi lại ngay khi prompt mâu thuẫn thay vì đoán. |
| Phase 2 | Chép TICKET-02 + spec phase 2; P0: viết lại `src/logic` theo số chuẩn và thứ tự tick bắt buộc, bản đồ chuẩn Đêm 1, lướt/rơi/đom đóm rơi/recoil/5 trạng thái Bóng Mực/đẩy ra khỏi vùng an toàn, điểm chuẩn hóa, contract v1.1; sửa 7 test Phase 1 kèm comment `[v1.1]`; test P2-01…P2-09, P2-16; cập nhật AGENTS.md; tạo skill `verify`. Bắt đầu P1 (Đêm 2/3, Gió Lạc, Bùa Gió, pause) | **Đúng:** 27/27 test xanh; headless một Đêm 21.600 tick ≈ 0.6 s; mỗi kỳ vọng đổi đều ghi lý do; dừng lại báo khi số chuẩn làm đổi ý nghĩa test (AC9, AC14). **Sai/vướng:** (1) Scenario P2-09 ban đầu đặt Bóng Mực trong vùng 6 m của đèn vừa thắp nên nó bị đẩy ra và không đánh được. Logic đúng, test dựng sai; đã dựng lại tình huống và ghi lý do trong test. (2) Test P2-16 lần đầu chỉ chạy 18.000 tick vì Đêm 1 hết giờ ở 300 s; đã thêm scenario `time_left_s: 360` để đo đủ 21.600 tick. (3) Commit `18ad927` (logic v1.1) đứng một mình thì test Phase 1 còn đỏ; commit kế tiếp mới sửa kỳ vọng. (4) Ticket không nói kiểu của `player.invuln` và không có điểm xuất phát hợp lệ cho Đêm 3 ((0,0,0) nằm trong tháp chuông): AI tự giả định (boolean; (0,0,−30)) và ghi vào spec. **Chưa làm:** P1 (P2-10…P2-14) dừng giữa chừng để chuyển phase; phần dở (bản đồ Đêm 2/3, dữ liệu Gió Lạc/Bùa Gió) để trong `git stash`, không commit. Pause đã cài trong logic nhưng chưa có test P2-15. Toàn bộ P2 giao diện (P2-17…P2-20) chưa làm. | | Ưu tiên P0 (test ẩn chấm tự động) trước P1/P2; tính tay kỳ vọng từng AC trước khi chạy; dùng skill `verify` để lưu bằng chứng theo một quy trình cố định. |
## Tổng kết token sau Phase 1–3 (đo bằng /usage lúc 16:50)
- Chi phí ước tính: $14.92 (gói Claude Pro, không phát sinh tiền thật); 48% hạn mức phiên.
- Opus 5.5: 291.1k output, 28.8M cache read, 414.3k cache write; Haiku: không đáng kể.
- 99% input lấy từ prompt cache; 4434 dòng thêm / 260 dòng xóa.
- Cách tiết kiệm đã dùng: spec + AC viết trước khi code; plan mode trước khi build; prompt gom nhiều việc nhỏ có tiêu chí rõ; commit nhỏ.
- Phase 4: /clear trước khi bắt đầu, Opus cho bench/soak, Sonnet cho tài liệu/release.

  Session
  Estimated cost:         $25.15
  Total duration (API):   59m 49s
  Total duration (wall):  2h 0m 55s
  Total code changes:     6516 lines added, 410 lines removed
  Usage by model:
  claude-haiku-5-5:       3.6k input, 398 output, 0 cache read, 0 cache write ($0.0006)
  claude-opus-5-5:        4.7k input, 404.4k output, 62.2m cache read, 575.6k cache write ($25.15)
  Prompt cache (main):    184 requests · 99% of input tokens from cache · no misses · warm (1h TTL, last activity 37s ago)
