# AGENTS.md
- Logic game ở src/logic, KHÔNG import thư viện đồ họa ở đây.
- Hiển thị 3D ở src/render.
- Output headless phải đúng Test Contract.
- Game phải chạy được trên macOS/Linux: dùng pathlib, không dùng đường dẫn Windows.
- Không sửa test để cho xanh; nếu test sai, báo lại kèm lý do.
- Commit nhỏ, mỗi commit một việc.
- Không commit .env, API key, token.
- KHÔNG dùng Math.random trong src/logic; chỉ dùng mulberry32(seed) ở src/logic/rng.js (output phải tất định).

## Phạm vi hiện tại: Phase 3 (TICKET-03 "Đèn cạn dầu", Contract v1.2)
- Nguồn yêu cầu: `docs/requirements/TICKET-03.md` là chuẩn và **thay thế** một số luật của TICKET-02 (mục đánh dấu [THAY THẾ]). `docs/notes/phase-3-spec.md` ghi ưu tiên, giả định và AC P3-01…P3-13.
- Quyết định thiết kế: `docs/adr/0001-den-can-dau.md`. Thay đổi phá tương thích: `CHANGELOG.md`. Đổi luật cốt lõi thì viết ADR mới (`docs/adr/NNNN-*.md`) và cập nhật CHANGELOG.
- **Nhiên liệu** lưu số nguyên đơn vị 1/60 (`fuel_max_u` = 6000). Không dùng số thực cho dầu; chỉ đổi ra số thực (1 chữ số thập phân) ở snapshot/event (`fuelOut`).
- **Trạng thái đèn:** unlit → lit(fuel) → out (`lit: false`, `ever_lit: true`). Thắp mới tốn 10, thắp lại 5. Châm dầu ở đèn sáng chưa đầy.
- **Vùng an toàn** chỉ có khi `lit && fuel ≥ 30` (dùng `hasSafeZone`, không kiểm `lit` trực tiếp).
- **Thứ tự tick:** như TICKET-02. Bước 2 trừ dầu (hao + bị hút); ngay sau bước 2 đèn `fuel ≤ 0` tắt.
- **Thắng/thua** chỉ xét ở bình minh: hết lửa → `no_flames` trước; hết giờ và đèn đang sáng ≥ `ceil(win_ratio × tổng)` → `dawn_survived`, ngược lại `dawn`. Không còn `all_lit`, không thắng sớm.
- Trạng thái Bóng Mực: `spawning`, `wander`, `chase`, `recoil`, `stunned`, `drain`.
- Test cũ bị luật mới thay thế: sửa kỳ vọng hoặc xóa, kèm comment `[v1.2]` (P3-12 kiểm). Không dùng `test.skip`/`todo`.

## Phạm vi Phase 2 (TICKET-02, Contract v1.1) – vẫn áp dụng nếu không bị TICKET-03 thay thế
- Nguồn yêu cầu: `docs/requirements/TICKET-02.md`. `docs/notes/phase-2-spec.md` ghi ưu tiên P0/P1/P2, giả định và AC P2-01…P2-20.
- **Số chuẩn** của ticket (Phần 1) thay mọi số Phase 1. Không tự đổi số trong `game.contract.json`: tuning phải khớp phase-2-spec mục 2.
- **Thứ tự tick bắt buộc** (11 bước, pause xử lý trước) được cài trong `src/logic/sim.js` `step()`. Thêm tính năng thì chèn vào đúng bước, không đổi thứ tự.
- **Bản đồ chuẩn** nằm trong `src/logic/levels.js` (góc đo từ +X: x = r·cosθ, z = r·sinθ). Đêm 2/3 (P1) thêm vào `NIGHTS`; tới khi đó `--night 2|3` trả exit 1.
- Trạng thái Bóng Mực (v1.1): `spawning`, `wander`, `chase`, `recoil`, `stunned` (v1.2 thêm `drain`).
- Phần sáng tạo thêm không được làm đổi output headless (tắt khi chạy headless).
- Chạy headless một Đêm đầy đủ (≤ 21.600 tick) phải xong trong ≤ 30 s (test P2-16).

## Test
- Test Phase 1: `tests/acNN-*.test.js`. Phase 2: `tests/p2-NN-*.test.js`. Phase 3: `tests/p3-NN-*.test.js`. Scenario/inputs tương ứng ở `scenarios/`.
- Test Phase 1 phải đổi kỳ vọng vì số chuẩn thì ghi comment `[v1.1]` kèm lý do ngay trong test (P2-02 kiểm điều này). Không xóa test âm thầm.
- Mỗi tính năng mới cần ít nhất 1 scenario headless + 1 test.
- Kiểm chứng và lưu bằng chứng: dùng skill `.claude/skills/verify/SKILL.md`.

## Lệnh
- Cài đặt: `npm install`
- Chạy game: `npm start` (server tĩnh `tools/serve.js`, in ra URL)
- Test (node:test): `npm test`
- Headless: `node src/headless.js --seed 42 --night 1 --ticks 3000 --out out.jsonl [--scenario scenarios/<file>.scenario.json] [--inputs scenarios/<file>.inputs.json] [--snapshot-every 10]`
- Mã thoát headless: 0 xong · 1 tham số sai / không đọc được file / tính năng chưa cài · 2 file inputs/scenario sai định dạng.
