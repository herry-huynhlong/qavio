# Ảnh giao diện thật QuánPilot — 21/10/2026

Đã push và deploy năm ảnh thật từ quán Thiên Đảo lên https://qavio.site/products/quanpilot và ảnh mặc định của CMS QAVIO. Source image hiện tại `qavio-web:d590b1c` (`d590b1c917cf30969948df8bcb1921f46fb6bcbe`).

## Ảnh đã hoàn thành

| Vị trí | Kích thước | Nội dung |
| --- | --- | --- |
| dashboard-screen | 953×760 | Tổng quan TRAIN/BASIC, số liệu hiện có |
| tables-screen | 953×620 | Sơ đồ khu vực A và trạng thái bàn |
| reports-screen | 968×520 | Báo cáo hiện chưa có hóa đơn, giữ nguyên số0 |
| menu-admin-screen | 953×730 | Ảnh món, tên món, giá và trạng thái bán |
| service-screen | 1233×600 | Các tab phục vụ, tìm/lọc bàn và trạng thái bàn |

Năm WebP tổng153.030byte (~149KiB). Chỉ cắt khung/nén screenshot thật, không vẽ lại UI. Phần tài khoản và thông tin cá nhân đã loại khỏi ảnh công khai. Metadata origin=SCREENSHOT, alt/caption tiếng Việt, giữ tỷ lệ và có nút phóng lớn/đóng ảnh. Các ảnh desktop không đặt trong khung điện thoại.

CMS có18slot, thêm riêng `menu-admin-screen` để không nhầm quản lý thực đơn với menu khách. Các ảnh này là mặc định trong code, không ghi đè dữ liệu CMS production; ảnh CMS đã publish vẫn ưu tiên. Có thể quản lý tại https://qavio.site/admin/visuals bằng tài khoản CMS QAVIO. Không dùng credential QuánPilot để đăng nhập CMS QAVIO.

## Nguồn và phạm vi

Chủ dự án cho phép đăng nhập quán Thiên Đảo và chụp dữ liệu có sẵn. Đã đăng nhập/đăng xuất bình thường; không lưu credential vào Git/tài liệu. Route phục vụ cho phép OWNER hiện có truy cập; không tạo vai trò, cấp thêm quyền/gói hoặc giả mạo phiên.

Không tạo/sửa món, bàn, đơn, phiên khách hoặc thanh toán. Không sửa source/DB/container Restaurant. Bốn slot còn thiếu giữ ẩn: menu QR/giỏ hàng cần phiên khách riêng; bếp/thu ngân riêng thuộc PRO trong khi quán đang TRAIN/BASIC. Không tạo phiên khách production hoặc nâng gói chỉ để chụp.

## Kiểm thử

- ESLint, TypeScript và production build PASS.
- CMS integration13ca PASS trên qavio_test:18slot, phân quyền, CSRF/origin, nguồn screenshot, draft/publish, concurrency, revision/audit.
- Public smoke14trang/379liên kết, SEO/sitemap/404/logo PASS.
- CI Linux [39608397020](https://github.com/herry-huynhlong/qavio/actions/runs/39608397020) success; build ngoài VPS. Bản bốn ảnh ban đầu898451b qua CI39606849452 cũng đã được kiểm chứng trước khi bổ sung phục vụ.
- Production năm WebP trả200 và hash khớp file nguồn; trang sản phẩm chứa đủ năm ảnh. API CMS chặn khách401.
- Browser production: ảnh phóng lớn/đóng hoạt động; tab phục vụ có ảnh; mobile375 không overflow, năm screenshot rộng320px; không warn/error. Bằng chứng tại `docs/real-product-screenshots/`.
- Production HTTPS/14trang/login entry/cookie/guard/Contact/DEMO/trial PASS. Không gửi yêu cầu khách QA vào production.

## Phát hành và vận hành

- Archive SHA256, revision và OCI config/layers được kiểm trước deploy. Chỉ recreate qavio-web-1, web healthy.
- Runtime env giữ nguyên hoàn toàn: Contact/DEMO và trial mở, quota100; email/newsletter/QUOTE/indexing giữ đóng. Worker, hai PostgreSQL, QuánPilot và Portfolio giữ nguyên ID/start/restart count.
- Không migration, đủ5/27migration. Backup mã hóa mới trong lượt phát hành này, tải off-host và restore cô lập5/27 PASS; bản plaintext và DB restore đã dọn. Bản bổ sung phục vụ dùng lại backup đã kiểm của cùng lượt vì chỉ thêm ảnh, không thay schema/dữ liệu.
- Disk trước khoảng2.1GiB trống/91%; sau cùng1.845.936.128byte (~1.72GiB). Chỉ xóa archive của chính release sau load/xác minh. Không build trên VPS, prune hoặc xóa volume/image rollback.
- Rollback riêng web về `qavio-web:898451b` bằng cấu hình image cũ trong `/opt/websites/qavio/.runtime/screenshots-service-release-20261021/snapshot`; recreate web với ba Compose hiện tại, `--no-build --no-deps`, kiểm `/api/ready`. Không đổi env khác hoặc restore DB. Image7ebeb22 trước toàn bộ lượt cập nhật cũng còn được giữ.
