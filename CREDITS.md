# Credits

## Thư viện và công cụ

| Tên | Phiên bản | Giấy phép | Dùng để |
|---|---|---|---|
| [three.js](https://threejs.org/) | r187 (`three@0.187.0`) | MIT, © 2010-2026 three.js authors | Hiển thị 3D trong trình duyệt. File `three.module.js`/`three.core.js` được kèm trong bản phát hành cùng file `LICENSE` của three.js. |
| [Playwright](https://playwright.dev/) | 1.65.1 (devDependency) | Apache-2.0, © Microsoft Corporation | Chạy benchmark (`tools/bench.js`) và chụp ảnh giao diện cho README. Chromium do Playwright tải về (`npx playwright install chromium`); không kèm trong bản phát hành. |
| [Node.js](https://nodejs.org/) | ≥ 18 (đã thử 26.13.1) | MIT | Server tĩnh, headless, soak, test (`node:test`), đóng gói zip (`zlib`). |

## Đồ họa, âm thanh, phông chữ

- **Đồ họa:** toàn bộ mô hình (đảo, Mây, nón lá, đèn lồng, Bóng Mực, đom đóm, biển mây, sao) dựng bằng hình khối có sẵn của three.js trong code (`src/render/scene.js`). Không dùng file ảnh, texture hay mô hình 3D bên ngoài.
- **Âm thanh:** bản hiện tại **chưa có âm thanh**. Khi thêm, âm thanh sẽ được tự tạo bằng Web Audio API trong code, không dùng file âm thanh bên ngoài.
- **Phông chữ:** dùng phông hệ thống (`system-ui`), không nhúng phông.
- **Ảnh chụp** trong `docs/screenshots/` và `docs/proof/`: chụp từ chính game. Ảnh `docs/screenshots/` chụp tự động bằng Playwright; ảnh bảng xếp hạng dùng dữ liệu thử.

## Công cụ AI

- **Claude Code** (Anthropic), mô hình Claude: hỗ trợ viết code (logic, headless, render, test, bench, soak, đóng gói), tài liệu (spec, ADR, CHANGELOG, README) và chụp ảnh giao diện, theo yêu cầu và dưới sự kiểm tra của tác giả. Cách dùng và các lần AI làm sai được ghi trong [`docs/notes/ai-log.md`](docs/notes/ai-log.md).
- Không có nội dung nghệ thuật (hình ảnh, âm thanh, nhạc) nào do AI tạo sinh dưới dạng file. Mọi hình khối đều là code.

## Yêu cầu và nội dung game

- Ý tưởng, cốt truyện, bản đồ chuẩn, số liệu chuẩn và Test Contract: từ PRD-0 và TICKET-02/03/04 của Day 12 · AI SDLC Lab (`docs/requirements/`).
