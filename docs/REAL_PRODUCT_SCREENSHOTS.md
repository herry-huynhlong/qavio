# Ảnh giao diện thật QuánPilot — 21/10/2026

Nguồn: chủ dự án cho phép đăng nhập quán Thiên Đảo trên production và chụp giao diện có sẵn. Phiên đã đăng xuất. Không ghi thông tin đăng nhập vào tài liệu/Git; không tạo/sửa món, bàn, đơn, phiên khách hoặc thanh toán.

## Ảnh đã bổ sung

- Dashboard: thay ảnh Long Phụng cũ bằng tổng quan quán Thiên Đảo, TRAIN/BASIC.
- Sơ đồ bàn: khu vực A, trạng thái bàn đang phục vụ/trống.
- Báo cáo: giao diện hiện tại chưa có hóa đơn; giữ nguyên số liệu thật bằng 0.
- Quản lý thực đơn: ảnh món, giá và trạng thái có sẵn; slot CMS mới `menu-admin-screen`, riêng với `menu-screen` cho khách.

Bốn WebP tổng khoảng 122 KiB. Chỉ cắt khung và nén ảnh thật, không vẽ lại UI. Loại phần tài khoản, sidebar tên người dùng và header khỏi ảnh công khai. Metadata origin=SCREENSHOT, alt/caption tiếng Việt. CMS mặc định có 18 slot; nội dung CMS đã publish tiếp tục ưu tiên hơn ảnh mặc định.

## Phần còn thiếu

Menu QR, giỏ hàng cần phiên khách; không tạo phiên production để chụp. Phục vụ chưa có ảnh riêng. Bếp/thu ngân riêng thuộc PRO, tài khoản đang TRAIN/BASIC; không nâng gói hoặc vượt quyền. Năm slot này tiếp tục ẩn khi chưa có ảnh thật. Ảnh quản lý thực đơn không thay thế ảnh menu khách.

## Kiểm tra

- ESLint, TypeScript, production build PASS.
- CMS integration: 13 ca PASS trên qavio_test, bao gồm 18 slot, phân quyền, CSRF, provenance, publish/concurrency/audit.
- Public smoke: 14 trang, 379 liên kết, SEO/sitemap/404/logo PASS.
- Browser desktop: bốn ảnh đúng vị trí, phóng lớn/đóng ảnh hoạt động; mobile375 không tràn ngang, ảnh desktop không đặt vào khung điện thoại.
- Không migration; không sửa Restaurant. Tiếp nhận Contact/DEMO, trial/OAuth và các flag giữ nguyên.

## Phát hành

Đang chuẩn bị CI Linux và triển khai riêng web QAVIO. Chỉ đánh dấu production sau kiểm tra domain, assets, health và container. Rollback về qavio-web:7ebeb22 bằng cấu hình image cũ; không restore dữ liệu.

## Production đã hoàn tất

- Source image `qavio-web:898451b` (`898451b3153e83b16b75d5442b340bd9cba74316`), CI [39606849452](https://github.com/herry-huynhlong/qavio/actions/runs/39606849452) success.
- Đã kiểm archive digest, source revision và OCI config/layers trước deploy. Chỉ recreate `qavio-web-1`; web healthy. Toàn bộ runtime env giữ nguyên. Worker, hai PostgreSQL, QuánPilot và Portfolio giữ nguyên container/start/restart count.
- Backup mới mã hóa, tải off-host và restore cô lập đủ 5/27 migration PASS; đã dọn bản plaintext/DB restore. Không migration hoặc sửa dữ liệu production. Chỉ đăng nhập/đăng xuất tài khoản được cấp để đọc/chụp.
- Production HTTPS: 14 trang, session guard/cookie, Contact/DEMO/trial và các flag PASS. Bốn WebP trả200, hash khớp hoàn toàn file nguồn; API CMS không cho truy cập ẩn danh. Browser375 không overflow, dialog ảnh hoạt động, không warn/error trên trang sản phẩm.
- Disk trước: khoảng2.1GiB trống/91%; sau: 2,047,995,904 byte (~1.91GiB). Đã xóa đúng archive phát hành sau xác minh/load; không prune image/cache/volume. Giữ image `7ebeb22` để rollback.
- Cấu hình rollback riêng web: khôi phục `QAVIO_IMAGE_TAG=7ebeb22` từ snapshot tại `/opt/websites/qavio/.runtime/screenshots-release-20261021/snapshot`, recreate service web với ba Compose hiện tại (`--no-build --no-deps`), kiểm `/api/ready`. Không đổi các env khác hoặc restore DB.
- Ảnh mặc định đã hiện trong CMS QAVIO mục Ảnh giới thiệu sản phẩm; không upload/ghi đè nội dung CMS production. Kiểm thử thao tác CMS có xác thực thực hiện trên DB cô lập, không dùng credential QuánPilot cho CMS QAVIO.
- Bằng chứng: `docs/real-product-screenshots/` gồm hash ảnh, kiểm HTTP, deploy, responsive và ảnh chụp website thật.
