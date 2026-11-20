# AGENTS.md
- Logic game ở src/logic, KHÔNG import thư viện đồ họa ở đây.
- Hiển thị 3D ở src/render.
- Output headless phải đúng Test Contract.
- Game phải chạy được trên macOS/Linux: dùng pathlib, không dùng đường dẫn Windows.
- Không sửa test để cho xanh; nếu test sai, báo lại kèm lý do.
- Commit nhỏ, mỗi commit một việc.
- Không commit .env, API key, token.
- KHÔNG dùng Math.random trong src/logic; chỉ dùng mulberry32(seed) ở src/logic/rng.js (output phải tất định).

## Phạm vi hiện tại: Phase 2 (TICKET-02, Contract v1.1)
- Nguồn yêu cầu: `docs/requirements/TICKET-02.md` là chuẩn. `docs/notes/phase-2-spec.md` ghi ưu tiên P0/P1/P2, giả định và AC P2-01…P2-20.
- **Số chuẩn** của ticket (Phần 1) thay mọi số Phase 1. Không tự đổi số trong `game.contract.json`: tuning phải khớp phase-2-spec mục 2.
- **Thứ tự tick bắt buộc** (11 bước, pause xử lý trước) được cài trong `src/logic/sim.js` `step()`. Thêm tính năng thì chèn vào đúng bước, không đổi thứ tự.
- **Bản đồ chuẩn** nằm trong `src/logic/levels.js` (góc đo từ +X: x = r·cosθ, z = r·sinθ). Đêm 2/3 (P1) thêm vào `NIGHTS`; tới khi đó `--night 2|3` trả exit 1.
- Trạng thái Bóng Mực chỉ dùng: `spawning`, `wander`, `chase`, `recoil`, `stunned`.
- Phần sáng tạo thêm không được làm đổi output headless (tắt khi chạy headless).
- Chạy headless một Đêm đầy đủ (≤ 21.600 tick) phải xong trong ≤ 30 s (test P2-16).

## Test
- Test Phase 1: `tests/acNN-*.test.js`. Test Phase 2: `tests/p2-NN-*.test.js`. Scenario/inputs tương ứng ở `scenarios/`.
- Test Phase 1 phải đổi kỳ vọng vì số chuẩn thì ghi comment `[v1.1]` kèm lý do ngay trong test (P2-02 kiểm điều này). Không xóa test âm thầm.
- Mỗi tính năng mới cần ít nhất 1 scenario headless + 1 test.
- Kiểm chứng và lưu bằng chứng: dùng skill `.claude/skills/verify/SKILL.md`.

## Lệnh
- Cài đặt: `npm install`
- Chạy game: `npm start` (server tĩnh `tools/serve.js`, in ra URL)
- Test (node:test): `npm test`
- Headless: `node src/headless.js --seed 42 --night 1 --ticks 3000 --out out.jsonl [--scenario scenarios/<file>.scenario.json] [--inputs scenarios/<file>.inputs.json] [--snapshot-every 10]`
- Mã thoát headless: 0 xong · 1 tham số sai / không đọc được file / tính năng chưa cài · 2 file inputs/scenario sai định dạng.
