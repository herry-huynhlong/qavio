# QAVIO — bộ demo sản phẩm QuánPilot

Ngày thực hiện: 27/10/2026. Trạng thái: **đã phát hành QAVIO production, kiểm tra sau deploy PASS**. Bộ ảnh đạt phạm vi TRAIN/BASIC; không giả lập quyền PRO.

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

Bản production đã được xác minh như dưới đây. Rollback ứng dụng dùng image-only snapshot + environment cũ, chỉ recreate web `--no-build --pull never --no-deps`; không restore DB để đảo thay đổi ảnh/UI.

## Kết quả production

- Source phát hành: **bb03cb3e9217b42b13f7ed8dc3244e48ebb25c84**, gồm bộ ảnh/source 7feeb49 và bản giữ ảnh lossless. CI đầu 40454816651 được hủy trước deploy để dùng bản chốt.
- [CI Linux 40455096816](https://github.com/herry-huynhlong/qavio/actions/runs/40455096816): **success**, gồm kiểm thử, Docker build trên GitHub, TypeScript và package artifact.
- [Release review 40455335375](https://github.com/herry-huynhlong/qavio/actions/runs/40455335375): **success**; SHA, checksum, platform và manifest đã được đối chiếu trước load.
- Image **qavio-web:bb03cb3**; ID chạy thực tế `sha256:9ee689e3ecc0333d2d963f25aa2a2e94c620ab2c89cdb77937c5244d99d97f50`.
- Config digest `sha256:75ce6bc1f589c736115f67de5aeca6b89fb9348fdae4ebebbdff2d862de62295`.
- Manifest SHA256 `6daf5bede3d477942e52d9d695b6a51d60b763b4c540552b5ef3889d99af8ac3`; archive SHA256 `e566ee396a776a1f59132ff84235beb9f6ad4158f725324a3b5700aabb9a1afb`.
- GitHub artifact digest `sha256:dcc050985a85ac10578fd34970b3a2ffaee41a5ab1a59ad2e69634aae5618583`. Archive135.679.149 bytes, layer disk upper bound377.920.000 bytes.
- Chỉ recreate **qavio-web-1**, pin image ID, không build/pull/migration. Application environment và mounts không đổi; Node version theo image CI được kiểm chứng. Sáu container còn lại giữ ID/start/image.
- Backup mới mã hóa, off-host/checksum/restore cô lập PASS, 5 migration. Giữ image rollback4f790772… và snapshot private tại `/opt/websites/qavio/.runtime/product-demo-release-20261027/snapshot/`.
- Disk free **6.020.034.560 bytes (~5,61GiB)** trước release, **5.816.762.368 bytes (~5,42GiB)** sau kiểm tra; giữ reserve và rollback. Không dọn backup/volume/image ứng dụng khác. MemAvailable sau smoke khoảng530MiB, không dùng mẫu nhàn rỗi này làm cam kết tải cao.
- Web healthy, restart0/OOM=false. Không có marker Error:/P2028/deadlock/FATAL ERROR trong log từ lần start mới đến mẫu kiểm tra; không thay thế giám sát dài hạn.
- HTTP200: Home, Products, QuánPilot, About, Solutions, Pricing, Contact, Trial, Admin login. HTML được kiểm tra không còn tham chiếu 5 screenshot Thiên Đảo cũ. **9 ảnh public mới đều SHA256 khớp**.
- QAVIO health/readiness PASS; QuánPilot login/public pricing PASS. Probe giả định `/api/ready` của QuánPilot ban đầu404; đã dùng endpoint thực tế, không sửa app để tạo route kiểm thử.
- Browser production: gallery mới, Dashboard2.084.000đ, ảnh lossless1425px, chọn Báo cáo, zoom/pan mobile390px, Escape/trả focus PASS; không tràn ngang hoặc console error trong lượt cuối. Bằng chứng local ở `.runtime/product-demo/qavio-production-gallery.png` và qavio-production-mobile.png, ngoài Git.
- CONTACT/DEMO tiếp tục mở; QUOTE/newsletter/email đóng; trial/OAuth/pricing/indexing không đổi. Không gửi Lead/trial/email/giao dịch QA vào production.

| Container | Sau deploy | Ảnh hưởng |
| --- | --- | --- |
| qavio-web-1 | Running / healthy | Image mới bb03cb3 |
| qavio-worker-1 | Running / healthy | Giữ nguyên |
| qavio-qavio-postgres-1 | Running / healthy | Giữ container/volume |
| restaurant-app-1 | Running, HTTP smoke PASS | Giữ image Phase0 |
| restaurant-maintenance-worker-1 | Running | Giữ nguyên |
| restaurant-postgres-1 | Running / healthy | Giữ container/volume |
| longh-portfolio | Running | Giữ nguyên |

Service không có Docker healthcheck không được ghi nhầm là healthy. Không sửa source QuánPilot hoặc dữ liệu production để chụp ảnh. Toàn bộ giao dịch minh họa chỉ nằm trong clone local.

**Kết luận:** bộ demo của chính QAVIO đã lên [trang QuánPilot](https://qavio.site/products/quanpilot), đúng phạm vi BASIC, có nguồn gốc từ nghiệp vụ thật. Chưa có ảnh bếp/thu ngân/quản lý PRO vì entitlement không cho phép; không tự nâng gói. Không tạo cửa hàng production mới hoặc doanh thu giả trong production.


## Mở rộng lịch sử và gallery — 27/10/2026

### Phạm vi và nguồn dữ liệu
- Dùng lại QAVIO `thien-dao`, ID `cmvhrl57d0000p90lghvax8if`, chỉ trên `127.0.0.1:55432/qavio_product_demo_test`.
- Không ghi Payment vào production. TRAIN/BASIC, OWNER + hai WAITER giữ nguyên; không cấp PRO.
- 13 bill trước tạo qua luồng QR/nghiệp vụ giữ nguyên. Thêm **408 bill lịch sử tổng hợp** bằng fixture riêng `Restaurant/scripts/demo/qavio-history.ts`; không mô tả chúng là giao dịch khách thật.
- Fixture chỉ chấp nhận URL test cố định và ACK riêng, IDs/idempotency/invoice prefix DEMO, nguồn Order/OrderItem, POS bill calculation và snapshot đầy đủ. Không UPDATE/DELETE bill đã tồn tại. Kiểm tra hash bảo vệ 13 bill gốc và dữ liệu fixture sau chạy lại; rerun không sinh trùng.
- Khoảng lịch sử 01/01–26/10/2026, cộng hoạt động demo 27/10. Có ngày đông/vắng/không giao dịch, ba phương thức CASH/CARD/OTHER, nhiều order/phiên. Không hóa đơn điện tử/gateway/thu tiền thật.

### Tổng hợp đã đối chiếu PostgreSQL
| Kỳ (Asia/Ho_Chi_Minh, mốc 27/10/2026) | Bill | Doanh thu VND |
|---|---:|---:|
| Hôm nay | 13 | 2.084.000 |
| Hôm qua | 2 | 465.000 |
| 7 ngày gần nhất | 28 | 7.129.000 |
| Tuần này | 15 | 2.549.000 |
| Tuần trước | 15 | 4.896.000 |
| Tháng này | 70 | 19.603.000 |
| Tháng trước | 38 | 11.890.000 |
| Quý IV đến thời điểm chụp | 70 | 19.603.000 |
| Năm | 421 | 128.144.000 |
| 01/02–31/03 | 75 | 23.379.000 |

Cả 10 kỳ: tổng Payment = chi tiết bill = tổng bucket = tổng phương thức. Tenant không tồn tại trả 0. 12 nhóm audit Phase0 không có cảnh báo trong clone. Đây không phải bằng chứng dữ liệu production sạch. Tổng năm CASH54.418.000, CARD43.331.000, OTHER30.395.000.

### Ảnh và chức năng thực tế
- 6 ảnh mới `history-dashboard/today/week/month/year/bills.webp`, ảnh thô lưu riêng trong `.runtime/product-demo-history`; chuyển WebP lossless, crop tập trung nội dung, không chỉnh số liệu. Giữ nguồn và crop manifest trong chứng cứ.
- Tái sử dụng ảnh bàn, đơn, QR/menu/giỏ và WAITER/team từ cùng clone/ca demo trước vì các màn hình này không đổi. Không tuyên bố đã chụp lại tất cả.
- Gallery 7 nhóm, chọn tuần/tháng và lịch sử bill; một khung lớn, lightbox vừa khung/kích thước gốc, cuộn và đóng bằng bàn phím. Gỡ cặp dashboard/report cạnh nhau ở câu chuyện chủ quán. Shared default ảnh dashboard áp dụng toàn website; CMS override vẫn được tôn trọng.
- Public chỉ dùng ảnh giao diện 4 kỳ hiện có trên production và xu hướng 7 ngày sẵn có ở Dashboard. Không quảng bá bộ lọc mới là đã phát hành.
- Chủ dự án chọn **bổ sung bộ lọc riêng, chưa deploy QuánPilot**. Mười bộ lọc được triển khai/test local riêng trong Restaurant, xem `docs/REPORT_PERIOD_FILTERS.md`; Dashboard giữ ý nghĩa hoạt động hôm nay, báo cáo là nơi chọn kỳ.

### Kiểm thử và phát hành
- QuánPilot: 65 fixed timezone ranges + bộ mở rộng/DST/custom/leap/quarter/previous; integration chỉ đọc 10 kỳ; 11 PostgreSQL concurrency/tenant/financial regression; paid-bill/invoice-print/customer-name; lint/typecheck/build có datasource test cô lập PASS.
- QAVIO: lint/typecheck/build PASS; CMS visuals14 ca PASS; public13 trang341 links/SEO/sitemap/404 PASS; browser320/375/390/768/1440 không tràn ngang; chọn gallery/lightbox/zoom mobile/console PASS.
- Không migration, không thay auth/payment/subscription/giá, không deploy Restaurant.
- Phát hành QAVIO: đang chuẩn bị CI image-only; chỉ đánh dấu deployed sau source/image/checksum và production smoke thực tế.


### Kết quả production cuối — GO, 27/10/2026
- Source `b8e2ae0d9b9eca49e851e5f8771c72fb48e1a84d`, build Linux [40470955451](https://github.com/herry-huynhlong/qavio/actions/runs/40470955451) và artifact review [40471260482](https://github.com/herry-huynhlong/qavio/actions/runs/40471260482) SUCCESS.
- Image `qavio-web:b8e2ae0`, Docker image ID `sha256:bf61986f77be8da0920397d47c666b56c7f7856828183e22f9e8ff2dd7ffd924`. Manifest SHA256 `93a42420836af2d14a4f615b02bfe6429d931b13d3a2b9b2921238bd733dac46`; GitHub artifact SHA256 `ad5964ef69b146a7c1c1ba4602b4f34a8d00bf5c20377666688395d8e334c69e`. Archive137.185.222bytes/image379.428.864bytes, source/config/rootfs verified.
- Chỉ QAVIO web recreate bằng image ID đã pin, `--no-build --pull never --no-deps web`. Không build/pull VPS, không migration hoặc ghi dữ liệu demo production. Env/flags/mounts giữ nguyên; sáu container khác nguyên ID/image/start state.
- Backup mới QAVIO DB+media mã hóa/off-host, restore cô lập5migrations PASS. Backup proof trong private release folder, không commit dữ liệu/credential. Source và fixture chỉ đọc cấu hình production trước đó, không chạy fixture trên VPS.
- Dung lượng trước5.807.869.952bytes, sau5.600.702.464bytes (~5,22GiB). MemoryAvailable536.367.104bytes sau smoke. Archive image đã gỡ đúng file sau load; không prune/image rollback/volume/log.
- HTTPS9trang200, health/readiness và QuánPilot login/pricing HTTP PASS; hash6ảnh public khớp local. Browser production desktop1440/mobile390, ảnh năm/tháng/lightbox tải đúng, không console error. Web healthy, restart0/OOMfalse/error markers0. Cả7container running;4container có healthcheck đều healthy,3container không cấu hình healthcheck được xác minh running/HTTP phù hợp.
- Rollback ứng dụng: dùng `/opt/websites/qavio/.runtime/product-history-release-20261027/snapshot/rollback.private.json`, phục hồi bản `.env` snapshot rồi `docker compose --project-directory /opt/websites/qavio -p qavio -f <rollback.private.json> up -d --no-build --pull never --no-deps web`. Image trước `sha256:9ee689e3ecc0333d2d963f25aa2a2e94c620ab2c89cdb77937c5244d99d97f50` giữ nguyên. Không restore database để rollback ảnh/giao diện.
- Bộ lọc10kỳ của QuánPilot và fixture vẫn **local, chưa commit/push/deploy** theo lựa chọn của chủ dự án. Không thay Restaurant production hoặc coi ảnh marketing là feature release.


## Nâng cấp toàn bộ ảnh PRO — yêu cầu 2f7fef61, 27/10/2026

### Nguồn dữ liệu và kiểm soát an toàn
- SELECT production trong transaction read-only xác nhận `thien-dao`, ID `cmvhrl57d0000p90lghvax8if`, ACTIVE, PRO/entitlement PRO. Không thay plan, tài khoản, giao dịch hoặc dữ liệu production QuánPilot.
- Bản sao cùng cửa hàng chỉ chạy trên `127.0.0.1:55432/qavio_product_demo_test`, ứng dụng loopback3400. Fixture và credential nằm ngoài Git; không làm nguồn kê khai thuế hoặc gửi thanh toán thật.
- OWNER, hai WAITER, MANAGER, KITCHEN, CASHIER: tài khoản mẫu tạo qua quản lý nhân viên hợp lệ. Tên hiển thị Chủ quán/Quản lý/Phục vụ/Bếp/Thu ngân QAVIO, không dùng liên hệ khách thật.
- Giữ 10 bàn, thực đơn có ảnh và giá; 5 bàn phục vụ,5 trống. Luồng QR → order → bếp (6 nhận/6 hoàn tất) → phục vụ (8 hoàn tất) → yêu cầu thanh toán → thu ngân xác nhận CASH330.000đ đã chạy qua nghiệp vụ trong clone.
- Tổng422 bill PAID/128.474.000đ; hôm nay14 bill/2.414.000đ,24 lượt gọi món; tuần2.879.000đ, tháng19.933.000đ. Hash421 bill trước kịch bản mới giữ nguyên. Audit12nhóm gồm amount/tenant/snapshot/idempotency/trùng PAID:0cảnh báo. Đây chỉ là kết quả clone, không kết luận production sạch.

### Bộ ảnh và giao diện
- 26 WebP lossless mới,27slot; chụp thật từ Browser, không AI hoặc chỉnh số liệu. Sáu nhóm khách/phục vụ/bếp/thu ngân/chủ quán/quản lý. Ảnh desktop khung1280×900 (tháng/quản lý1260), mobile375×812 thực tế, tablet khoảng805px. Không tuyên bố đã chụp1440 khi khung thực tế nhỏ hơn.
- Dashboard, bốn kỳ báo cáo, bàn, menu, nhân viên, đơn, cài đặt, quản lý; mobile menu/số lượng/đơn/hỗ trợ/thanh toán/đăng nhập/ca/nhận món/bàn; tablet bếp/chế biến/thu ngân/bill/lịch sử.
- Chỉ crop khung bill để đọc rõ và giới hạn chiều cao tablet; giữ tỷ lệ, không sửa dữ liệu, không toolbar. Hash/source/crop tại `.runtime/product-pro/images-proof.json` (chứng cứ local).
- Gallery có sáu nhóm, chức năng con, khung thiết bị, trước/tiếp, phím mũi tên, lightbox, zoom/kích thước gốc, Escape và handler swipe. Một ghi chú dữ liệu trình diễn. Không gắn nhãn package riêng cho từng ảnh; badge gốc trong app giữ nguyên.
- Đồng bộ defaults cho trang chủ/sản phẩm/giải pháp và CMS; vẫn tôn trọng ảnh CMS đã publish. Bỏ section lặp vai trò trên trang sản phẩm, thay ảnh hero và thêm screenshot vào giải pháp. Không thay giá/quyền BASIC/PRO.

### Kiểm chứng và giới hạn
- Lint/TypeScript/production build local đạt; CMS14checks; public13trang340links/SEO/sitemap/404 đạt. Browser sáu nhóm tải ảnh, lightbox next/previous, ArrowRight, zoom, Escape đạt. 320/375/390/768/1280: body không tràn ngang. Handler swipe được review, chưa kiểm thử bằng thiết bị cảm ứng vật lý.
- HTTP16kiểm tra vai trò: WAITER/KITCHEN/CASHIER bị chặn báo cáo/subscription và vai trò khác; MANAGER có admin/report/kitchen/cashier, subscription bị chặn. Bếp/thu ngân yêu cầu device-session như luồng hiện có.
- `/cart` hiện là placeholder; app thật chọn số lượng rồi gọi món trực tiếp trên menu. Vì vậy ảnh/caption dùng “Chọn số lượng và gọi món”, không quảng bá một giỏ hàng độc lập chưa hoạt động.
- Bộ lọc mở rộng10kỳ vẫn local, chưa phát hành QuánPilot. Đã khôi phục nguyên file mở rộng sau khi chụp bốn kỳ production.
- Phát hiện riêng: submit login trước hydration có thể dùng GET do form thiếu method. Một lần chỉ credential QA cô lập đi vào URL; đã rotate credential clone và chụp lại, không credential thật/production. Chưa sửa/deploy auth trong task marketing, cần xử lý riêng.
- Không migration, không đổi auth, payment, subscription, giá, timezone hoặc dữ liệu lịch sử. Không deploy Restaurant.

### Phát hành
Chưa phát hành bản PRO mới; sẽ bổ sung source SHA, CI, checksum, backup/restore, capacity và production smoke sau khi xác minh thực tế.
