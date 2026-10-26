# About QAVIO — thiết kế lại, 26/10/2026

## Phạm vi
Chỉ đổi hero và năm giá trị tại `/about`, cộng responsive header dùng chung. Giữ nội dung giới thiệu/sứ mệnh/tầm nhìn và CMS đang có. Không sửa Restaurant, authentication, trial, OAuth, giá, payment hoặc schema/database.

## Thiết kế và ảnh
- Hero mới: người cộng tác bằng laptop/tablet, tông navy/trung tính/vàng, khung 4:3, bo góc, `Technology with Purpose`.
- Ảnh minh họa AI, không phải nhân sự QAVIO thật; không có dashboard giả. Alt và metadata AI được giữ. File `public/images/qavio/about-business-v2.webp`, 1600×1200, 134476 byte; Next Image responsive/lazy ngoài hero, kích thước nội tại tránh layout shift.
- Giữ nguyên `technology.webp` và logo. Thêm slot CMS `about` / `Hero Giới thiệu QAVIO`, có draft/publish/version/audit theo quyền hiện hành; không cập nhật dữ liệu CMS production. Slot cũ technology không đổi.
- Năm card: số 01–05, icon nét mảnh, nhãn Anh/tiêu đề Việt và nội dung được yêu cầu; CMS VALUES hiện có vẫn được ưu tiên. Desktop 3+2 căn giữa, tablet 2+2+1 căn giữa, mobile một cột. Navy sáng, viền mảnh, hover nhẹ, hỗ trợ reduced-motion.
- Header chuyển sang menu ở ≤1200px; các mục desktop không wrap. Không thay breakpoint của các phần website khác.

## Kiểm thử local
- ESLint, TypeScript và Next production build: PASS.
- Public regression: 13 trang, 340 liên kết, canonical/SEO/sitemap/404/logo/retired newsletter PASS.
- CMS visuals: 14 ca trên `qavio_test` loopback55432, gồm About độc lập, CSRF, permission, draft/publish, version conflict, audit và media visibility; fixture dọn sau test. Không ghi dữ liệu production.
- Browser:1440/1280/1024/768/390/375/320, không page/card overflow, ảnh tải thành công, đúng hàng card 3–2/2–2–1/1. Menu320 mở/đóng và Escape PASS; console không warn/error/hydration.
- `docs/about-redesign/local-responsive.json` lưu geometry; ảnh before-* lấy production trước thay đổi, local-* là build local. Ảnh mẫu đính kèm riêng không có ở tin nhắn này; đã đối chiếu giao diện production cũ và yêu cầu chữ, không tuyên bố đã xem hai ảnh mẫu chưa truy cập được.

## Nguồn ảnh và prompt
Dùng built-in imagegen (không CLI), xuất WebP bằng sharp. Bản PNG gốc giữ ở Codex generated_images, không đưa file gốc nặng vào production.
Prompt: “Premium photorealistic editorial 4:3 photograph of two Vietnamese business professionals collaborating with a navy laptop and tablet in a bright modern workspace; warm daylight, neutral surfaces, navy and subtle brass; natural faces and hands, screens viewed from side/back with no readable UI, no text/logos/watermark; central safe framing; diverse business context, not limited to restaurants; illustrative AI photo, not a real QAVIO team portrait.”

## Phát hành
Đã được chủ dự án cho phép commit/push/deploy sau kiểm thử. Build Linux trên GitHub-hosted runner, không build VPS. Chỉ recreate QAVIO web bằng image CI đã xác minh, giữ env/flags/mounts/worker/PG và các dự án khác. Không migration. Backup QAVIO mới mã hóa, tải off-host và restore cô lập5migration PASS trước phát hành.

Đã push/deploy source **808c9444215e01b13e30ae551b64c8aabfdaf371**, image `qavio-web:808c944`.
- [CI build40334454252](https://github.com/herry-huynhlong/qavio/actions/runs/40334454252) và [review40334885752](https://github.com/herry-huynhlong/qavio/actions/runs/40334885752): SUCCESS. Linux build trên GitHub-hosted runner; offline deployment safety, lint, integration, TypeScript và full build đạt.
- Manifest SHA256 `c2a93d31a4e4fcc4720cb5847823fed8293a61bfb6e3919afff6e757312781fe`. GitHub artifact digest `sha256:2572e1ea88aa96893ee79c90ceb202db98ce5481f78075827da1f9188763236e`; VPS xác minh cùng digest/source/config/rootfs/layer expansion trước load.
- Container image ID `sha256:4f790772367544dd8d2a5fde349bcb31a0d6ad11958ade07cdd9eeb5069936e2`; config `sha256:c129e4574e865512065be97f53694c1ffbc0b497139d1d04f24114a7a63f38c6`.
- Runtime model chỉ đổi image web, frozen thành image-only, `--no-build --pull never --no-deps web`. Không áp logging/RAM/worker hardening đang ngoài phạm vi. Env/flags/mounts giữ nguyên, sáu container khác giữ ID/start/restarts.
- Web/worker/hai PostgreSQL Docker healthy; các container còn lại running. Restaurant app chưa cấu hình Docker healthcheck, HTTP login/pricing đạt; không ghi/query sửa DB Restaurant.
- Production HTTP:16 endpoint gồm12 trang, health/ready/sitemap/robots đều200; ảnh gốc cùng SHA256 local, Admin visuals anonymous307, QuánPilot login/pricing200. Không gửi PII hoặc tạo dữ liệu QA production.
- Production browser kiểm lại đủ1440/1280/1024/768/390/375/320 với assert viewport thực tế; không tràn trang/card, ảnh tải, desktop3+2, tablet2+2+1, mobile1 cột, menu375 mở/đóng/Escape đạt; console/hydration không warn/error. JSON `production-responsive.json` là kết quả cuối sau khi tái kiểm tra viewport đúng tab.
- CMS HTTP local bổ sung: publish ảnh About trên DB qavio_test, `/about` thật trả ảnh `/media/<id>`; quyền Editor bị chặn publish, cleanup fixture và ảnh sau test. Không cần đăng nhập hoặc thay CMS production để phát hành ảnh mặc định.
- Disk trước khoảng7,3GiB trống/69%, sau7,1GiB/70%; preflight actual free7806472192bytes, cuối7615250432bytes. Giữ image trướccc06d0f và rollback5f10868. Chỉ bỏ ZIP/tar image của đúng release sau xác minh/load; không prune, xóa log, backup, volume hoặc dữ liệu khách hàng.
- Báo cáo/bằng chứng JSON và ảnh production-* trong docs/about-redesign. Ảnh before-* là trước thay đổi; production-hero-1280.jpg / production-values-1280.jpg / production-mobile-375.jpg là kết quả cuối. Các ảnh local là kiểm tra trung gian; IAB không hỗ trợ full-page capture trong phiên này.
- Prompt chính xác lưu `docs/about-redesign/image-prompt.txt`. Ảnh WebP trong repo là bản tối ưu; PNG gốc được giữ tại Codex generated_images.
Rollback: giữ image web đang chạy `cc06d0f` và cấu hình runtime trước deploy; chạy riêng service web bằng image ID cũ, `--no-build --pull never --no-deps`. Không restore đè DB.

## File ứng dụng đã sửa
- `src/app/(public)/about/page.tsx`: hero và nội dung/card About.
- `src/app/about.css`: layout About riêng, không đổi CSS các trang sản phẩm.
- `src/app/globals.css`, `src/components/site-header.tsx`: nowrap/breakpoint menu đồng bộ1200px.
- `src/lib/visuals.ts`: slot/default About mới, giữ slot cũ.
- `public/images/qavio/about-business-v2.webp`: ảnh minh họa mới.
- `scripts/integration-visuals.ts`: regression slot About và quyền publish.
- `AGENTS.md`, báo cáo này và `docs/about-redesign/*`: tài liệu và bằng chứng.

Không có thay đổi schema, migration, Dockerfile/Compose/CI, logo, pricing, authentication hoặc code Restaurant. Các commit báo cáo sau808c944 không yêu cầu rebuild/recreate lại.
