# Retro – Đảo Đèn Lồng (Phase 1–4)

Nguồn: [`ai-log.md`](ai-log.md), lịch sử git (khoảng 50 commit từ 14:53 tới 17:20 ngày 2026-11-20), bằng chứng trong `docs/proof/phase-1…4/`.

## 1. Tổng hợp đánh giá 4 phase

| Phase | Contract | Kết quả chính | Test (tích lũy) | Chưa đạt |
|---|---|---|---|---|
| 1 – Đêm 1 | v1.0 | Logic + headless + game 3D. AC1–AC14 đạt | 14/14 | AC15 một phần: ảnh chỉ cho thấy ván thua |
| 2 – Ba hòn đảo | v1.1 | P0 xong: số chuẩn, thứ tự tick, lướt/rơi/recoil/drop, contract v1.1. 10/20 AC đạt | 27/27 | P1 dừng giữa chừng (đã stash); P2 giao diện chưa làm |
| 3 – Đèn cạn dầu | v1.2 | P0 xong: dầu, châm/tắt/thắp lại, drain, luật `dawn_survived`, ADR, CHANGELOG | 47/47 | P3-13 (thanh dầu, mù màu) chưa làm |
| 4 – Phát hành | v1.3 | Soak, bench (148 fps), địa hình Đêm 2/3, bảng xếp hạng, dist, README | 70/70 | Accessibility, GitHub Release, video |

Phần logic và headless (thứ được chấm tự động) luôn được ưu tiên và có test. Phần giao diện tụt lại phía sau qua từng phase: giao diện vẫn chỉ chơi được Đêm 1, chưa có thanh dầu, chưa có âm thanh.

## 2. Điều hiệu quả khi làm với AI

- **Spec + bảng AC trước, code sau.** Mỗi phase bắt đầu bằng spec có bảng AC. AI tính tay kỳ vọng trước khi viết test (ví dụ điểm bình minh P3-11 = 497, P2-09 = 1046), nên 20 test Phase 3 và phần lớn test Phase 4 xanh ngay lần chạy đầu.
- **Plan mode cho việc lớn** (Phase 1 bước 1, Phase 4). Kế hoạch lộ ra chỗ chặn trước khi code. Ví dụ soak cần Đêm 2/3 nhưng Đêm 2/3 chưa có, nên AI hỏi trước thay vì tự quyết.
- **AI hỏi lại khi yêu cầu mâu thuẫn:** phím E bị giao hai việc; soak thiếu Đêm 2/3; cảnh bench có cho Bóng Mực chuyển chase không. Mỗi câu hỏi đều có phương án đề xuất, nên trả lời nhanh.
- **Test tự giám sát test:** P2-02 và P3-12 bắt buộc test cũ bị đổi phải có comment `[v1.1]`/`[v1.2]`. Chính P2-02 đã bắt lỗi AI xóa mất comment cũ khi viết lại AC13.
- **Commit nhỏ, mỗi commit một việc**, và mọi thứ đều kèm bằng chứng (test output, determinism, soak/bench thật, clone sạch).

## 3. Điều chưa hiệu quả

- **Phạm vi phình nhanh hơn thời gian.** Phase 2 P1 bị dừng giữa chừng, phần dở phải stash; đến Phase 4 mới lấy lại một phần (địa hình) để soak chạy được.
- **Giao diện không theo kịp logic.** Mỗi lần đổi luật chỉ sửa render ở mức tối thiểu để không hỏng.
- **Có commit đỏ:** commit logic v1.1 (`18ad927`) và v1.2 (`46170e1`) đứng một mình thì test cũ còn đỏ, vì test được sửa ở commit kế tiếp.
- **Shell và chuỗi dài:** heredoc dài nhiều lần không chạy được trong Git Bash, phải chuyển sang tạo file bằng công cụ Write.

## 4. Những lần AI sai và cách phát hiện

| # | Sai gì | Phát hiện bằng | Xử lý |
|---|---|---|---|
| 1 | Test AC8 đọc nhầm snapshot tick 0 (chạy 5 tick, snapshot mặc định mỗi 10 tick) | Test đỏ | Sửa cách lấy snapshot, giữ nguyên kỳ vọng |
| 2 | Scenario P2-09 không thể xảy ra theo luật: Bóng Mực trong vùng an toàn bị đẩy ra nên không đánh được | Test đỏ + suy luận lại luật | Dựng lại tình huống, ghi lý do trong test |
| 3 | P2-16 tưởng đo 21.600 tick nhưng chỉ chạy 18.000 (Đêm 1 hết giờ) | Đọc dòng thời gian đo trong output test | Thêm scenario `time_left_s: 360` và assert số tick |
| 4 | Viết lại AC13 làm mất comment `[v1.1]` | Meta-test P2-02 đỏ | Khôi phục lịch sử lý do |
| 5 | Đặt nội dung có backtick trong chuỗi bash nháy kép: bash chạy chúng như lệnh, khởi động 2 server treo | Output lạ + lệnh treo | Dừng tác vụ, dừng 3 tiến trình node, kiểm tra không file nào bị đổi, viết lại bằng Write |
| 6 | Ảnh `latern.pnj.png` (Phase 1) không có đèn nào sáng như tên gợi ý | AI mở xem từng ảnh trước khi ghi bằng chứng | Ghi AC15 là "một phần" |
| 7 | **Tag `phase-3` bị quên ở bước chốt Phase 3**: chuyển thẳng sang Phase 4 mà không tag và không lưu bằng chứng riêng | `git ls-remote --tags origin` lúc chốt Phase 4 chỉ thấy phase-1, 2, 4 | Tag tại commit cuối Phase 3 (`c32391d`), **push muộn lúc 17:26**. Bằng chứng Phase 3 được tạo sau, trong Phase 4, bằng cách chạy `npm test` trên worktree checkout tag `phase-3` (`docs/proof/phase-3/`) |

Ngoài ra AI chủ động báo các chỗ spec có vấn đề, thay vì im lặng làm theo:
- luật "đèn đầy dầu không được chọn" không xảy ra được qua headless, vì hao dầu chạy trước bước tương tác;
- điểm xuất phát (0,0,0) của Đêm 3 nằm trong tháp chuông;
- kiểu dữ liệu của `player.invuln` không được ticket nói rõ;
- game chưa có âm thanh, nên CREDITS không ghi "âm thanh WebAudio tự tạo".

## 5. Harness giúp nhiều nhất

1. **AGENTS.md** (`CLAUDE.md` trỏ tới). Các quy tắc "logic không đồ họa", "cấm Math.random trong src/logic", "không sửa test để cho xanh" giữ logic tất định suốt 4 phase. Quy tắc cuối dẫn tới thói quen ghi `[vX]` khi phải đổi kỳ vọng. File được cập nhật mỗi phase.
2. **Meta-test** P2-02 và P3-12: biến quy tắc "không xóa/skip test âm thầm" thành thứ được kiểm tự động.
3. **Skill `verify`:** quy trình cố định để lưu test output, kiểm tra tất định và bảng bằng chứng trung thực.
4. **Plan mode và câu hỏi lựa chọn có phương án đề xuất.**
5. Chưa dùng **hook**. Một hook chạy `npm test` trước khi commit đã có thể tránh được các commit đỏ ở mục 3.

## 6. Token và chi phí

Số liệu do tác giả lấy từ `/cost` và `/usage`, ghi trong `ai-log.md`:

| | Giá trị |
|---|---|
| Chi phí ước tính | **$25.15** (gói Claude Pro, không phát sinh tiền thật). Mốc sau Phase 1–3: $14.92 |
| Claude Opus 5.5 | 4.7k input · 404.4k output · 62.2M cache read · 575.6k cache write |
| Claude Haiku 5.5 | 3.6k input · 398 output (≈ $0.0006) |
| Prompt cache | 99% input lấy từ cache, không miss |
| Thời gian | API 59 phút 49 giây · thực tế 2 giờ 0 phút 55 giây |
| Thay đổi code | 6.516 dòng thêm · 410 dòng xóa |

`ai-log.md` không ghi lúc chụp số `/cost` này. Phần việc làm sau thời điểm đó (nếu có) chưa được tính.

**Đã tiết kiệm token bằng cách:**
- spec và AC viết trước khi code để giảm vòng sửa;
- plan mode cho bước lớn;
- gom nhiều việc nhỏ vào một prompt có tiêu chí rõ;
- tạo scenario bằng script thay vì từng file;
- tính tay kỳ vọng để test xanh từ lần đầu;
- `/clear` trước Phase 4.

Nhờ cache ổn định, 99% input không phải tính lại.

## 7. Nếu làm lại

- **Làm giao diện song song với logic** ở mỗi phase (ít nhất HUD cho luật mới), để không dồn nợ giao diện tới cuối.
- **Mỗi commit đều xanh:** gộp "đổi logic" và "sửa test cũ" vào cùng một commit khi luật thay đổi, và thêm hook pre-commit chạy `npm test`.
- **Không bắt đầu P1 khi thời gian không đủ:** chốt P0 sạch rồi mới mở phần mới, thay vì phải stash phần dở.
- **Viết file bằng công cụ sửa file, không qua chuỗi shell**, để tránh lỗi quoting như mục 4 #5.
- **Luôn chạy `git ls-remote --tags origin` ngay sau khi tag**, và có checklist chốt phase cố định (bằng chứng → commit → tag → push tag → kiểm tra remote). Mục 4 #7: tag `phase-3` bị quên và chỉ được phát hiện khi chốt phase sau. Nên thêm bước này vào skill `verify`.
- **Lên kế hoạch accessibility và âm thanh từ Phase 1:** chữ ≥ 18 px và đổi phím rẻ hơn nhiều nếu làm ngay từ đầu.
