# QAVIO — bộ demo sản phẩm QuánPilot

Ngày thực hiện: 27/10/2026. Trạng thái: kiểm thử local đạt, đang chuẩn bị phát hành QAVIO; chưa ghi hoàn thành production.

## Cửa hàng và ranh giới dữ liệu

- Đúng cửa hàng hiện có: **QAVIO**, slug **thien-dao**, Restaurant ID `cmvhrl57d0000p90lghvax8if`. Một OWNER gốc; không công bố danh tính/email thật trong ảnh hoặc báo cáo.
- Kiểm kê trên bản restore production ngày 27/10: TRAIN/quyền BASIC, ACTIVE, timezone `Asia/Ho_Chi_Minh`; 10 bàn, 3 khu vực, 9 món, 3 danh mục; 1 phiên, 1 order, 1 payment và chưa có nhân viên khác OWNER.
- Không chứng minh được payment gốc là demo; schema chưa có ranh giới demo/tax chắc chắn. **Không tạo, sửa hay xóa bất kỳ giao dịch demo nào trên production QuánPilot.** Không đánh dấu payment gốc thành demo hoặc loại khỏi doanh thu.
- Đã tạo database local riêng `qavio_product_demo_test`, giữ Restaurant ID/slug/cấu hình/quyền của chính QAVIO. Không tạo restaurant khác và không sao chép lịch sử Order/Payment/DiningSession.
- Sao chép duy nhất cấu hình và ảnh món/logo thuộc QAVIO; đổi danh tính OWNER thành dữ liệu tổng hợp, mật khẩu hash bcrypt12 mới, QR mới. Không dùng tài khoản hay QR production để mô phỏng.
- App demo chỉ bind loopback `127.0.0.1:3400`, thông tin truy cập riêng ngoài Git, không công khai. Bỏ dữ liệu ngân hàng/contact/invoice định danh từ clone, tắt QR chuyển tiền/push/tích hợp dùng thử. Chỉ ghi nhận CASH/CARD/OTHER nội bộ, không gọi cổng thu tiền hoặc phát hành hóa đơn điện tử.
- Database demo không liên kết báo cáo/database production, không được dùng làm dữ liệu kê khai thuế. Đây là dataset chụp ảnh, không phải doanh thu thật. Không sửa timezone, backdate hoặc cập nhật số tiền của Payment đã PAID.

## Nhân viên và entitlement

| Vai trò | Thiết lập trong clone | Kết quả |
| --- | --- | --- |
| OWNER | Chủ quán QAVIO, định danh tổng hợp | Dashboard/báo cáo/menu/bàn/nhân viên và xác nhận thanh toán |
| WAITER | Phục vụ QAVIO, username phucvu-qavio | Tạo bằng form quản lý nhân viên hợp lệ; vào ca qua device setup |
| WAITER | Phục vụ QAVIO 02, username phucvu-qavio-2 | Tạo bằng server action của form; thiết bị/ca riêng |
| MANAGER/KITCHEN/CASHIER | Không tạo | Ngoài quyền BASIC; chưa nâng gói hay sửa chính sách thương mại |

Mật khẩu sinh riêng, chỉ lưu trong vùng private local, không nằm trong ảnh/Git/tài liệu. Không dùng email/số điện thoại khách thật. Chủ quán thực hiện xác nhận thanh toán theo quyền sẵn có; không giả mạo screenshot màn hình thu ngân PRO. Bếp/thu ngân/quản lý riêng cần quyết định thương mại khác trước khi có bộ ảnh PRO.

## Cấu hình quán

Giữ 10 bàn hiện có (Bàn 1–10), hai khu A/B có bàn và khu mặc định; không tạo thêm để làm đầy số lượng. Regenerate cả 10 QR bằng API QuánPilot trong clone.

Giữ 9 món có ảnh của chính QAVIO: Bào Ngư 150.000đ; Cá Trắm Kho 70.000đ; Canh Bò Hầm 45.000đ; Co Ca 15.000đ; Pepsi 15.000đ; Quẩy Chiên 7.000đ; Sò Điệp 65.000đ; Trà Tắc 15.000đ; Tôm Hấp 55.000đ. Có món chính, món thêm và nước, không sử dụng ảnh của tenant khác. Không cần tạo hàng trăm món hoặc thay phong cách quán bằng dữ liệu tùy ý.

## Luồng và dữ liệu minh họa

1. OWNER đăng nhập; tạo hai tài khoản phục vụ qua form hiện có, bcrypt/audit của ứng dụng.
2. Nhân viên đăng nhập, mở ca và thiết bị theo luồng hợp lệ.
3. Khách vào QR mới, nhập tên tổng hợp, xem menu và gửi order có idempotency key.
4. Đồ uống READY được phục vụ nhận bằng **Nhận đi món**, rồi **Đã phục vụ**. Đã hoàn tất 6 lượt bằng server action thật; thêm 1 món được nhận bằng giao diện để chụp màn hình đang vận hành.
5. Khách gọi thêm món, yêu cầu nước/hỗ trợ/thanh toán. OWNER xem tổng tiền server, xác nhận bằng API pay-session có expectedGrandTotal.
6. Bill PAID có snapshot/invoiceNumber/paidAt được ứng dụng tạo; phiên tương ứng CLOSED. Không ghi số hiển thị bằng tay, không SQL cập nhật tài chính.

**BASIC không có bước bếp riêng.** Không tuyên bố đã kiểm thử luồng bếp/thu ngân PRO. Món chính được hoàn tất theo luồng thanh toán OWNER hiện hành; đồ uống có luồng nhận/phục vụ được kiểm chứng riêng.

| Chỉ số cuối | Giá trị |
| --- | --- |
| Bill PAID | 13 |
| Doanh thu hôm nay / Báo cáo | 2.084.000đ |
| CASH | 5 bill / 644.000đ |
| CARD | 4 bill / 690.000đ |
| OTHER | 4 bill / 750.000đ |
| Order / lượt gọi | 20 |
| Bàn đang sử dụng / trống | 5 / 5 |
| Yêu cầu đang chờ Dashboard | 4 |
| Nhân viên phục vụ | 2 |

Các giao dịch phát sinh trong ngày chụp thật của môi trường demo. Những ngày trước không có doanh thu; biểu đồ không được backfill để giả lịch sử. Mọi PAID có paidAt, snapshot và invoiceNumber; subtotal + tax = grandTotal = amount; mỗi phiên chỉ một PAID và đã CLOSED. Đối chiếu read-only PostgreSQL khớp Dashboard/Báo cáo.

## Ảnh chụp và hiển thị website

9 ảnh WebP lossless mới tại `public/images/qavio/demo-*.webp`: dashboard, reports, tables, orders, staff-admin, menu-admin, menu, cart, service. Chụp từ UI QuánPilot thực tế; crop khung hình/whitespace và chuyển lossless, không vẽ lại số liệu. Ảnh không chứa toolbar, email thật, credential/token/session hay lỗi. QR production không xuất hiện.

Nguồn PNG gốc và journal nghiệp vụ giữ local ngoài Git. `docs/evidence/qavio-product-demo.json` ghi kích thước, crop, SHA256 PNG/WebP, kiểm chứng DB và phân quyền. Menu/cart là phần nhìn thấy của viewport điện thoại để thanh cố định không đè giữa một ảnh cuộn dài. Báo cáo giữ toàn bộ 13 bill; thực đơn giữ toàn bộ danh sách món.

- Shared visual defaults cập nhật đồng bộ Home / Products / QuánPilot / khám phá theo vai trò.
- Trang sản phẩm có khung preview lớn, chọn Tổng quan/Báo cáo/Bàn/Đơn hàng/Nhân viên/Thực đơn.
- Screenshot dùng trực tiếp WebP lossless, không qua nén lại Next Image hoặc dùng CPU/RAM sharp trên VPS. Lightbox gần toàn màn hình, xem kích thước gốc, cuộn ngang/dọc, Escape/đóng/trả focus; nút zoom có accessible name trên mobile.
- Chú thích: **Giao diện QuánPilot với dữ liệu minh họa.** Nhãn TRAIN/BASIC gọn; không đưa ảnh bếp/thu ngân không đúng quyền lên website.
- CMS vẫn chỉnh/sửa/xuất bản ảnh theo phân quyền hiện tại; thêm slot orders-screen và staff-screen, không đổi schema/migration. Kiểm tra production trước release không có visual COMPANY đã publish đè các defaults.

## Kiểm thử

- QR → welcome → order/idempotency → staff claim/served → payment request → OWNER confirm → Dashboard/Báo cáo: PASS trên clone PostgreSQL.
- Đối chiếu 13 PAID/2.084.000đ, snapshot/tổng tiền/phiên đóng/không trùng bill: PASS.
- WAITER truy cập admin, reports, kitchen, cashier đều bị chặn: PASS. Không nới quyền hay nâng PRO.
- QAVIO lint, TypeScript, production build: PASS. Lỗi Windows DLL bị khóa bởi server local cũ đã xử lý bằng dừng riêng server local rồi build lại.
- CMS visual integration: **14 PASS**, gồm CSRF/origin, role, draft/live concurrency, publication, media private/public và chặn ảnh AI trong slot screenshot.
- Public HTTP regression: **13 trang, 340 liên kết**, SEO/sitemap/404/logo: PASS.
- Browser: sáu nút chọn ảnh cập nhật đúng ảnh; zoom desktop/mobile, pan ảnh, Escape và trả focus: PASS. Không có console error trong lượt kiểm tra cuối.
- Responsive 320/375/390/768/1440: không tràn ngang. Không sửa QuánPilot UI chỉ để đạt bố cục ảnh.
- Kiểm tra ảnh bằng mắt và asset checksum: PASS; không có thông tin cá nhân thật trong bộ xuất bản.

## Phát hành và rollback

Chỉ phát hành QAVIO web sau CI Linux; không build trên VPS, không recreate QuánPilot/PostgreSQL/worker, không migration, không đổi flags/contact/trial/pricing/OAuth. Backup mới đã mã hóa, off-host, checksum và restore cô lập PASS (5 migration); database restore kiểm thử đã được drop, production không restore.

Image QAVIO trước phát hành: `sha256:4f790772367544dd8d2a5fde349bcb31a0d6ad11958ade07cdd9eeb5069936e2`, giữ để rollback. VPS đầu lượt: ~5,7GiB trống, sử dụng76%, MemAvailable466MiB. Gate sẽ đánh giá lại theo kích thước artifact thực; nếu không đủ thì dừng.

Commit/CI/image/deploy và smoke production sẽ được cập nhật sau khi thực sự phát hành. Rollback ứng dụng dùng image-only snapshot + environment cũ, chỉ recreate web `--no-build --pull never --no-deps`; không restore DB để đảo thay đổi ảnh/UI.
