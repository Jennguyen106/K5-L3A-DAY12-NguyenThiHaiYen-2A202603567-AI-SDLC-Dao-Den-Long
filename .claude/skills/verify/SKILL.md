---
name: verify
description: Kiểm chứng Đảo Đèn Lồng trước khi báo xong hoặc trước khi gắn tag: chạy npm test, kiểm tra headless tất định (cùng seed → file giống hệt), đo thời gian một Đêm, rồi lưu bằng chứng vào docs/proof/phase-N/. Dùng khi được nhờ "verify", "kiểm chứng", "lưu bằng chứng", hoặc trước khi tạo tag phase-N.
---

# Verify – kiểm chứng và lưu bằng chứng

Mục tiêu: có **bằng chứng ghi ra file**, không chỉ nói "đã chạy". Ghi trung thực: test đỏ thì lưu đúng output đỏ và báo lại, không sửa kỳ vọng để cho xanh (xem AGENTS.md).

Chạy mọi lệnh từ thư mục gốc repo. `N` là số phase hiện tại (ví dụ `2`). Cần Node ≥ 18 và đã `npm install`.

## 1. Chuẩn bị thư mục

```bash
mkdir -p docs/proof/phase-N
```

## 2. Toàn bộ test

```bash
npm test > docs/proof/phase-N/test-output.txt 2>&1; echo "exit $?"
```

- Lưu **nguyên** output (cả khi có test đỏ). Đọc các dòng `ℹ tests / pass / fail` ở cuối file.
- Dòng `ℹ Đêm 1, seed 42, --ticks 21600: …` là thời gian đo của P2-16 (giới hạn 30 s).

## 3. Tính tất định (cùng seed → output giống hệt)

Chạy 2 lần cùng seed và tham số, ghi đầu ra ra thư mục tạm (không commit file `.jsonl` lớn), so sánh, rồi lưu lệnh + kết quả:

```bash
OUT=$(mktemp -d)
{
  echo "# Tất định: seed 42, Đêm 1, 3000 tick, chạy 2 lần"
  echo "# Ngày: $(date -u +%Y-%m-%dT%H:%M:%SZ)  Node: $(node --version)  Commit: $(git rev-parse --short HEAD)"
  for i in 1 2; do
    echo "\$ node src/headless.js --seed 42 --night 1 --ticks 3000 --out run$i.jsonl"
    node src/headless.js --seed 42 --night 1 --ticks 3000 --out "$OUT/run$i.jsonl"; echo "exit code: $?"
  done
  echo "\$ sha256sum run1.jsonl run2.jsonl"; (cd "$OUT" && sha256sum run1.jsonl run2.jsonl)
  echo "\$ cmp run1.jsonl run2.jsonl"; cmp "$OUT/run1.jsonl" "$OUT/run2.jsonl" && echo IDENTICAL || echo DIFFERENT
  echo "\$ tail -1 run1.jsonl"; tail -1 "$OUT/run1.jsonl"
} > docs/proof/phase-N/determinism.txt 2>&1
cat docs/proof/phase-N/determinism.txt
```

Kết quả phải là `IDENTICAL` và hai SHA-256 trùng nhau. Nếu `DIFFERENT`: tìm chỗ dùng nguồn ngẫu nhiên ngoài `mulberry32` hoặc thứ tự duyệt không cố định trong `src/logic`.

Ghi chú: headless dừng sớm khi game kết thúc (thắng/thua). Khi đó dòng `end` có `ticks` < số yêu cầu; đây là hành vi đúng của contract, hãy ghi rõ trong bảng bằng chứng.

## 4. Kiểm tra nhanh luật cấm

```bash
grep -rnE "Math\.random|from 'three'|document\.|window\." src/logic || echo "src/logic sạch"
```

## 5. Bảng bằng chứng

Tạo hoặc cập nhật `docs/proof/phase-N/README.md`: một bảng `| AC | Cách kiểm chứng | File bằng chứng | Kết quả |` cho mọi AC của phase (lấy từ `docs/notes/phase-N-spec.md`).

- Kết quả ghi **trung thực**: ✅ Pass / ❌ Fail (kèm lý do) / ⚠️ Một phần / ⏳ Chưa kiểm chứng.
- AC giao diện (UI) cần ảnh chụp `.png` trong `docs/proof/phase-N/`. Chưa có ảnh thì ghi ⏳, không ghi ✅.
- Mở xem từng ảnh trước khi mô tả; mô tả đúng những gì ảnh cho thấy.

## 6. Commit

```bash
git add docs/proof/phase-N
git commit -m "docs: bang chung phase N"
```

Không tạo hoặc dời tag khi chưa được yêu cầu. Dời tag đã push là thao tác ghi đè trên remote, phải hỏi trước.
