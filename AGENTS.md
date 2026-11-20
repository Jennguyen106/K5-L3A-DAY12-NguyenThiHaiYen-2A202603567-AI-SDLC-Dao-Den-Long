# AGENTS.md
- Logic game ở src/logic, KHÔNG import thư viện đồ họa ở đây.
- Hiển thị 3D ở src/render.
- Output headless phải đúng Test Contract.
- Game phải chạy được trên macOS/Linux: dùng pathlib, không dùng đường dẫn Windows.
- Không sửa test để cho xanh; nếu test sai, báo lại kèm lý do.
- Commit nhỏ, mỗi commit một việc.
- Không commit .env, API key, token.
- KHÔNG dùng Math.random trong src/logic; chỉ dùng mulberry32(seed) ở src/logic/rng.js (output phải tất định).

## Lệnh
- Cài đặt: `npm install`
- Test (node:test, AC1–AC14): `npm test`
- Headless: `node src/headless.js --seed 42 --night 1 --ticks 3000 --out out.jsonl [--scenario scenarios/<file>.scenario.json] [--inputs scenarios/<file>.inputs.json] [--snapshot-every 10]`
