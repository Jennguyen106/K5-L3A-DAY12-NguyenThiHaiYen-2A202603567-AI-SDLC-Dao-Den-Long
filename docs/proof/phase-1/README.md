# Bằng chứng Phase 1

Tiêu chí lấy từ `docs/notes/phase-1-spec.md` mục 6. Mỗi AC1–AC14 có scenario trong `scenarios/` và một test node:test trong `tests/`. Test gọi `src/headless.js` như một tiến trình riêng, giống cách chấm tự động.

- Output đầy đủ của `npm test`: [`test-output.txt`](test-output.txt), kết quả **14/14 pass, 0 fail**.
- Kiểm tra tất định chạy tay (AC3): [`determinism.txt`](determinism.txt).

| AC | Cách kiểm chứng | File bằng chứng | Kết quả |
|---|---|---|---|
| AC1 | So `game.contract.json` với bảng tuning ở spec mục 3 và với config mà game dùng (`createConfig`) | `tests/ac01-contract.test.js`, `scenarios/ac01-contract.expected.json`, `test-output.txt` | ✅ Pass |
| AC2 | Chạy headless 100 tick: kiểm exit 0, dòng cuối `type:end`, snapshot tick 0 là dòng đầu | `tests/ac02-smoke.test.js`, `test-output.txt` | ✅ Pass |
| AC3 | Chạy 2 lần với seed 42, 3000 tick, so sánh nội dung 2 file | `tests/ac03-determinism.test.js`, `determinism.txt`, `test-output.txt` | ✅ Pass. Hai file giống hệt nhau (cùng SHA-256). Ghi chú: không có input nên người chơi đứng yên và thua `no_flames` ở tick 815; headless dừng ở đó đúng theo contract (dừng khi game kết thúc). |
| AC4 | Inputs có tick giảm dần (10 rồi 5) | `tests/ac04-bad-inputs.test.js`, `scenarios/ac04-bad-inputs.inputs.json` | ✅ Pass (exit 2, lỗi ra stderr) |
| AC5 | move [0,1], yaw 0, 60 tick → đọc snapshot tick 60 | `tests/ac05-move-forward.test.js`, `scenarios/ac05-*` | ✅ Pass (z = 6, x = 0) |
| AC6 | move [0,1], yaw 90, 60 tick | `tests/ac06-move-yaw90.test.js`, `scenarios/ac06-*` | ✅ Pass (x = 6, z = 0) |
| AC7 | Đom đóm tại (0,0,1) | `tests/ac07-pickup.test.js`, `scenarios/ac07-pickup.scenario.json` | ✅ Pass (`mote_picked` ở tick 1, score 10) |
| AC8 | carried 10, đứng cách L1 2 m, interact ở tick 0 | `tests/ac08-deposit.test.js`, `scenarios/ac08-*` | ✅ Pass (`deposit` amount 10, `lantern_lit` L1, score 100) |
| AC9 | Bóng Mực ở 5 m và 10 m, carried 4, pulse ở tick 0 và tick 2 | `tests/ac09-pulse-cooldown.test.js`, `scenarios/ac09-*` | ✅ Pass (lần 1 chỉ choáng S1; lần 2 bị cooldown chặn: không có event, carried giữ 2) |
| AC10 | Bóng Mực cách 0.5 m, carried 4 | `tests/ac10-hit-invuln.test.js`, `scenarios/ac10-hit-invuln.scenario.json` | ✅ Pass (`player_hit` flames 2 dropped 2 ở tick 1; không bị chạm lại trước tick 91) |
| AC11 | flames 1, Bóng Mực đứng sát | `tests/ac11-no-flames.test.js`, `scenarios/ac11-no-flames.scenario.json` | ✅ Pass (`game_over` lost `no_flames`, end state `lost`) |
| AC12 | time_left_s 1 | `tests/ac12-dawn.test.js`, `scenarios/ac12-dawn.scenario.json` | ✅ Pass (`game_over` lost `dawn` ở tick 60) |
| AC13 | L1–L4 thắp sẵn, carried 10 cạnh L5, interact | `tests/ac13-win.test.js`, `scenarios/ac13-*` | ✅ Pass (won `all_lit`; chỉ có `lantern_lit` L5; score 549 = 100 + 299 + 3×50, không cộng điểm đèn đặt sẵn) |
| AC14 | L1 thắp, người đứng cạnh L1, Bóng Mực đuổi 600 tick, đo khoảng cách ở mọi snapshot | `tests/ac14-safe-zone.test.js`, `scenarios/ac14-safe-zone.scenario.json` | ✅ Pass (luôn ≥ 6 m, sai số làm tròn 0.002 m; Bóng Mực có tới sát mép vùng) |
| AC15 | Chơi bằng giao diện từ đầu tới thắng/thua, rồi chơi lại | Ảnh chụp chơi thử: xem các file .png trong thư mục | ⏳ Chưa kiểm chứng: thư mục chưa có file .png nào. Cần chạy `npm start`, chơi thử rồi chụp màn hình. |
