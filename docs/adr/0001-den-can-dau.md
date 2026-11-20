# ADR 0001 – Đèn cạn dầu: mô hình trạng thái đèn và luật thắng `dawn_survived`

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-11-20
- **Liên quan:** `docs/requirements/TICKET-03.md` (Change Request, Contract v1.2), `docs/notes/phase-3-spec.md`

## Bối cảnh

Tới Phase 2 (Contract v1.1), đèn là một cờ một chiều: `lit: false → true`. Đèn đã sáng thì sáng mãi, không nhận thêm đom đóm và luôn có vùng an toàn 6 m. Đêm kết thúc **thắng ngay** khi mọi đèn đều sáng (`all_lit`), kèm thưởng theo số giây còn lại.

Playtest cho thấy người chơi giỏi thắp hết đèn trong khoảng 2 phút rồi game dừng, nên cuối Đêm thiếu căng thẳng. TICKET-03 đổi mục tiêu từ "thắp hết" sang "giữ đảo sáng tới bình minh":

- Đèn tốn dầu, có thể tắt và thắp lại.
- Bóng Mực hút dầu của đèn yếu.
- Chỉ phân thắng thua ở bình minh.

Với mô hình một cờ `lit` thì không biểu diễn được "đèn từng sáng nhưng đã tắt" (thắp lại rẻ hơn), cũng không biểu diễn được "đèn sáng nhưng yếu" (mất vùng an toàn).

## Quyết định

### 1. Mô hình trạng thái đèn

```
            nạp đủ lantern_cost (10)                 fuel ≤ 0 (ngay sau bước 2)
  unlit ─────────────────────────────▶ lit(fuel) ──────────────────────────────▶ out(ever_lit)
 ever_lit=false   +100 điểm, fuel=100   │   ▲  châm dầu: fuel += 10 × used         │ lantern_out, deposited=0
                                        │   └──── (refuel, +5 mỗi đom đóm) ────────┘
                                        │                                           │
                                        └─────────── thắp lại: nạp đủ relight_cost (5) ◀┘
                                                     +40 điểm, fuel=100, relit_count+1
```

- Dữ liệu mỗi đèn: `lit`, `fuel`, `ever_lit`, `relit_count`, `deposited`. Trạng thái "out" chính là `lit=false && ever_lit=true`. Không thêm một enum riêng, để snapshot giữ nguyên các trường cũ (`lit`, `deposited`) và chỉ **thêm** trường mới.
- Chi phí thắp chọn theo `ever_lit`: 10 cho đèn chưa từng sáng, 5 cho đèn thắp lại. Thắp lại phát `lantern_lit {relight: true}`.
- **Nhiên liệu là số nguyên đơn vị 1/60** (fuel 100 = 6000 đơn vị). Hao 1 đơn vị/tick; mỗi Bóng Mực `drain` hút thêm 5 đơn vị/tick. Mọi phép so sánh (`fuel ≥ 30` → 1800 đơn vị) đều trên số nguyên, nên kết quả tất định và không lệch do số thực. Chỉ đổi ra số thực (1 chữ số thập phân) khi ghi snapshot/event.
- **Đèn yếu** (`lit && fuel < 30`) mất vùng an toàn; đúng 30 vẫn còn. Vùng an toàn trở thành một hàm `hasSafeZone(lantern)` thay cho kiểm tra `lit` trước đây.
- **Thứ tự tick** (bổ sung vào 11 bước của TICKET-02): bước 2 trừ dầu (hao + bị hút) và ghi `fuel_drain` mỗi 60 tick hút; ngay sau bước 2, đèn có `fuel ≤ 0` tắt (`lantern_out`). Tương tác (bước 5) chỉ chọn đèn "nhận được": chưa sáng, hoặc sáng nhưng chưa đầy dầu.

### 2. Bóng Mực: trạng thái `drain`

- `wander` → đi tới đèn yếu gần nhất; tới trong 2 m thì chuyển sang `drain`: đứng yên và hút dầu.
- `drain` → `chase` khi Mây vào trong 6 m; → `stunned` khi trúng Tỏa Sáng (+15 điểm thay vì +5); → `wander` khi đèn tắt, khi được châm lên ≥ 30, hoặc khi cách đèn > 2 m.
- Đèn được châm/thắp lên ≥ 30 mà có Bóng Mực trong vùng 6 m: các con đó bị đẩy ra trong ≤ 30 tick và không gây hit. Đây là cùng một cơ chế "đẩy ra" đã có từ TICKET-02.

### 3. Luật thắng `dawn_survived`

- Bỏ thắng sớm (`all_lit` không còn dùng). Bước 11 chỉ phân thắng thua ở bình minh, và vẫn chạy sau mọi cập nhật khác của tick:
  1. hết Ngọn Lửa → `lost / no_flames` (luôn xét trước, kể cả ở tick cuối);
  2. hết giờ và số đèn **đang sáng** ≥ `ceil(win_ratio × tổng đèn)` (Đêm 1: 3/5) → `won / dawn_survived`;
  3. hết giờ mà dưới ngưỡng → `lost / dawn`.
- Điểm bình minh (chỉ khi thắng): mỗi đèn đang sáng `+50 + floor(fuel)`, mỗi lửa `+50`. Bỏ thưởng thời gian. Đom đóm nạp vào đèn (thắp, thắp lại, châm dầu) được `+5` mỗi con.
- Sức chứa tăng theo số lần thắp thành công trong Đêm: `min(20, 10 + 2 × successful_lights)`.

## Hệ quả

**Tích cực**
- Cuối Đêm có việc phải làm: giữ dầu, đuổi Bóng Mực đang hút, thắp lại đèn tắt.
- Nhiên liệu nguyên đơn vị 1/60 giữ headless tất định (cùng seed → output giống hệt) và cho kết quả đúng tới từng tick (ví dụ fuel 1 tắt đúng tick 60).
- Snapshot chỉ thêm trường, không đổi nghĩa trường cũ, nên công cụ đọc v1.1 vẫn đọc được phần chung.

**Phá vỡ tương thích** (chi tiết trong `CHANGELOG.md`)
- `contract_version` 1.2; thời lượng Đêm 240/270/300 s; bảng điểm mới.
- `game_over.reason` không còn `all_lit`, thêm `dawn_survived`; thắp đủ đèn không kết thúc Đêm.
- `lantern_lit` có thêm `relight`; thêm các sự kiện `refuel`, `lantern_out`, `fuel_drain`.
- Hết choáng thì Bóng Mực về `wander` (trước đó: `chase` nếu Mây trong 12 m).
- 6 test cũ phải sửa kỳ vọng, có comment `[v1.2]` (test P3-12 kiểm điều này). Không test nào bị skip.

**Rủi ro / điều cần biết**
- Luật "đèn đầy dầu không được chọn khi tương tác" gần như không xảy ra qua headless: bước 2 (hao dầu) luôn chạy trước bước 5 (tương tác), nên lúc bấm E đèn sáng có fuel ≤ 99.983 và vẫn nhận 1 đom đóm. Luật được cài đúng và được kiểm trực tiếp trên hàm `pickInteractLantern` (test P3-05).
- `wander` khi không có đèn yếu: TICKET-03 ghi "đi về đèn tắt gần nhất như trước". TICKET-02 không mô tả hành vi này (bản Phase 2 cho Bóng Mực lượn quanh điểm sinh). Bản này hiểu là đi tới cách đèn tắt gần nhất 2 m; không còn đèn tắt nào thì lượn quanh điểm sinh như cũ.
