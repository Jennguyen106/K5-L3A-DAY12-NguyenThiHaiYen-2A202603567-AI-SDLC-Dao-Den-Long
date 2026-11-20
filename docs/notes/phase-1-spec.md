# Phase 1 – Spec, giả định & tiêu chí nghiệm thu

Nguồn yêu cầu: `docs/requirements/PRD-0.md` (PRD-0 + Test Contract v1.0).
File này ghi các **giả định** cho chỗ PRD-0 mơ hồ. Code và test phải bám đúng file này.

## 1. Công nghệ (quyết định + lý do)

- **JavaScript (ES modules)**. Logic thuần ở `src/logic/` (không DOM, không three.js).
- **Headless:** Node ≥ 18, không thư viện ngoài: `node src/headless.js ...`
- **Hiển thị:** Three.js trong trình duyệt, dùng **chung** `src/logic/`.
- Lý do: một bộ logic cho cả game và headless nên kết quả khớp nhau; chạy được trên macOS/Linux/Windows; Release là thư mục web tĩnh (PRD-0 cho phép "bản web").
- Ngẫu nhiên: chỉ dùng PRNG `mulberry32(seed)` trong logic. **Cấm `Math.random`** trong `src/logic/`.

## 2. Màn Đêm 1 – Đảo Bến

- Đảo tròn tâm (0,0,0), **bán kính 40 m**. `fall_enabled = false`: người chơi bị chặn ở mép (vị trí XZ bị kẹp trong bán kính 40), không có sự kiện rơi.
- 5 đèn `L1..L5` ở bán kính 25 m: `pos = (25·sin φ, 0, 25·cos φ)` với φ = 0°, 72°, 144°, 216°, 288° → `L1 = (0,0,25)`. Tọa độ làm tròn 3 chữ số.
- Đom đóm (`random_motes = true`): ban đầu **60** con, id `M1, M2…`, vị trí ngẫu nhiên theo seed trong vành 3 m–38 m. Mỗi 120 tick, nếu số đom đóm trên đảo < 20 thì sinh thêm 1 con.
- Bóng Mực (`random_shades = true`): ban đầu **2** con `S1, S2` ở mép đảo (bán kính 38 m, góc theo seed). Cứ mỗi **1800 tick** (30 s) sinh thêm 1 con ở mép đảo, tối đa 6 con. Mỗi lần sinh thêm ghi event `shade_spawned`. Các con ban đầu **không** phát event.
- Bóng Mực bay ở độ cao y = 1.0 (chỉ là hiển thị; khoảng cách luôn đo theo XZ).
- Id tự sinh tăng dần, không dùng lại.

## 3. Tuning (điền đúng vào `game.contract.json`)

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| player_speed | 6 | m/s |
| carry_capacity | 10 | số đom đóm mang tối đa |
| lantern_cost | 10 | số đom đóm để thắp 1 đèn |
| lantern_count_night1 | 5 | |
| pickup_radius | 1.5 | m |
| interact_radius | 2.5 | m |
| pulse_cost | 2 | trừ vào đom đóm đang mang |
| pulse_radius | 6 | m |
| night1_duration_s | 300 | |
| flames | 3 | "máu" |
| invuln_s | 1.5 | bất tử sau khi bị chạm |
| hit_drop_ratio | 0.5 | |
| pulse_stun_s | 3 | |
| pulse_push_m | 4 | |
| pulse_cooldown_s | 2 | |
| safe_radius | 6 | quanh đèn **đã thắp** |
| shade_speed | 3.5 | m/s |
| shade_hit_radius | 1.0 | m |
| fall_enabled | false | |
| score.per_mote | 10 | |
| score.per_lantern | 100 | |
| score.per_stun | 20 | mỗi Bóng Mực bị choáng |
| score.per_second_left | 1 | |
| score.per_flame_left | 50 | |

`team`: `2A202603567-nguyen-thi-hai-yen`

## 4. Luật chơi chi tiết (giả định)

- **Di chuyển:** hướng thế giới theo công thức trong contract (chuẩn hóa nếu dài hơn 1) × `player_speed`; mỗi bước `pos += v / 60`.
- **Nhảy:** chỉ khi đang đứng trên mặt đất (y = 0). Vận tốc ban đầu 6 m/s lên trên, trọng lực 20 m/s². Nhảy không ảnh hưởng tới nhặt đồ hay bị chạm vì khoảng cách đo theo XZ.
- **Nhặt đom đóm:** mỗi bước, đom đóm trong `pickup_radius` được nhặt nếu `carried < carry_capacity`, theo thứ tự id tăng dần. Mỗi con: event `mote_picked`, cộng `per_mote`. Khi đã đầy thì không nhặt, đom đóm vẫn nằm đó.
- **Nạp đèn:** khi `interact` chuyển false → true, chọn đèn **chưa thắp** gần nhất trong `interact_radius` (nếu bằng nhau thì lấy id nhỏ hơn). `amount = min(carried, lantern_cost − deposited)`. Nếu `amount > 0`: event `deposit`. Nếu `deposited == lantern_cost`: đèn `lit = true`, event `lantern_lit`, cộng `per_lantern`.
- **Tỏa sáng (pulse):** khi `pulse` chuyển false → true, **và** cooldown đã hết, **và** `carried ≥ pulse_cost`, thì:
  - `carried −= pulse_cost`;
  - mọi Bóng Mực trong `pulse_radius` chuyển sang `stunned` trong `pulse_stun_s` và bị đẩy ra xa người chơi `pulse_push_m` theo hướng XZ (nếu trùng vị trí thì đẩy theo +X);
  - ghi event `pulse` với `stunned_ids` (vẫn ghi khi mảng rỗng);
  - cộng `per_stun` cho mỗi con bị choáng;
  - cooldown đặt lại bằng `pulse_cooldown_s`.

  Nếu không đủ điều kiện thì không có gì xảy ra.
- **Bóng Mực:** trạng thái `chase` thì bay thẳng về phía người chơi với `shade_speed`, không vào được vùng `safe_radius` quanh đèn **đã thắp** (nếu một bước đi đưa nó vào vùng thì đặt nó lại ở mép vùng). Trạng thái `stunned` thì đứng yên, hết thời gian thì quay lại `chase`.
- **Bị chạm:** nếu một Bóng Mực đang `chase` ở trong `shade_hit_radius` và người chơi không bất tử, thì:
  - `flames −= 1`;
  - `dropped = floor(carried × hit_drop_ratio)`, `carried −= dropped` (đom đóm rơi mất);
  - event `player_hit` `{by:"shade", flames, dropped}`;
  - người chơi bất tử trong `invuln_s`.

  Mỗi bước bị chạm tối đa 1 lần.
- **Kết thúc:**
  - Tất cả 5 đèn đã thắp → `won`, reason `all_lit`. Cộng thêm `per_second_left × floor(time_left_s)` và `per_flame_left × flames`.
  - `flames == 0` → `lost`, reason `no_flames`.
  - `time_left_s ≤ 0` → `lost`, reason `dawn` (trời sáng mà chưa thắp hết đèn).
  - Nếu xảy ra cùng một bước thì ưu tiên: all_lit > no_flames > dawn.
- **Thứ tự trong một bước** (k → k+1):
  1. đọc input tick k;
  2. giảm các bộ đếm (cooldown, bất tử, choáng);
  3. người chơi di chuyển/nhảy;
  4. nhặt;
  5. nạp đèn;
  6. tỏa sáng;
  7. sinh đom đóm/Bóng Mực;
  8. Bóng Mực di chuyển;
  9. kiểm tra bị chạm;
  10. trừ thời gian 1/60 s;
  11. kiểm tra kết thúc, ghi `game_over`.
- **Scenario:** dựng scenario không phát event và không cộng điểm.

## 5. Headless

- `node src/headless.js --seed <int> --night 1 [--scenario f] [--inputs f] --ticks N --out f.jsonl [--snapshot-every n]`
- Các dòng event của bước k → k+1 ghi **trước** snapshot của tick k+1 (nếu tick đó có snapshot).
- Snapshot có thêm mảng `motes` (`id`, `pos`); trường này được khuyến nghị.
- Dòng cuối luôn là `end`. Exit 0. Tham số sai → exit ≠ 0, lỗi ra stderr. File inputs/scenario sai định dạng (JSON hỏng, tick không tăng nghiêm ngặt, move ngoài [−1,1], kiểu sai) → **exit 2**.

## 6. Tiêu chí nghiệm thu (mỗi AC có scenario + test tự động)

| AC | Làm gì | Mong đợi |
|---|---|---|
| AC1 | đọc `game.contract.json` | JSON hợp lệ, tuning trùng với config game dùng |
| AC2 | chạy headless 100 tick | exit 0, dòng cuối `type:end`, có snapshot tick 0 |
| AC3 | chạy 2 lần, seed 42, 3000 tick | 2 file giống hệt nhau |
| AC4 | inputs có tick giảm dần | exit 2 |
| AC5 | move [0,1], yaw 0, 60 tick | player z = 6.000 tại tick 60 |
| AC6 | move [0,1], yaw 90, 60 tick | player x = 6.000, z = 0.000 |
| AC7 | mote tại (0,0,1) | `mote_picked` ở tick 1, score 10 |
| AC8 | carried 10, đứng cạnh L1, interact | `deposit` amount 10, `lantern_lit` L1, score 100 |
| AC9 | shade cách 5 m và 10 m, carried 4, pulse 2 lần liền | lần 1 chỉ choáng con 5 m; lần 2 bị cooldown chặn |
| AC10 | shade đứng sát, carried 4 | `player_hit` flames 2 dropped 2; trong 1.5 s không bị chạm lần nữa |
| AC11 | flames 1, shade đứng sát | `game_over` lost `no_flames` |
| AC12 | time_left_s 1 | `game_over` lost `dawn` ở tick 60 |
| AC13 | L1–L4 lit sẵn, carried 10 cạnh L5, interact | won `all_lit`; không cộng điểm cho đèn đặt sẵn |
| AC14 | L1 lit, shade đuổi người đứng cạnh L1 | shade không bao giờ vào trong 6 m quanh L1 |
| AC15 | chơi bằng giao diện | chơi được từ đầu tới thắng/thua, chơi lại được (ảnh chụp) |

## 7. Câu hỏi đã/nên hỏi trợ giảng

- `safe_radius` áp dụng cho mọi đèn hay chỉ đèn đã thắp? → Giả định hiện tại: **chỉ đèn đã thắp** (đảo "sáng dần lên", Bóng Mực "sợ đèn").
- Đom đóm rơi khi bị chạm thì mất hẳn hay nằm lại? → Giả định: **mất hẳn**.
