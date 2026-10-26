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

CI, source/image digest, health/readiness, disk và kiểm tra giao diện production sẽ được ghi sau khi thực hiện. Chưa coi deploy hoàn tất ở thời điểm tạo bản báo cáo này.
Rollback: giữ image web đang chạy `cc06d0f` và cấu hình runtime trước deploy; chạy riêng service web bằng image ID cũ, `--no-build --pull never --no-deps`. Không restore đè DB.
