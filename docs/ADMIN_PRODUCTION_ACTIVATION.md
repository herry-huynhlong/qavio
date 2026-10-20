# Kích hoạt Admin production — kiểm tra trước thay đổi

Ngày 20/10/2026 (Asia/Bangkok). **Bước chuẩn bị proxy + backup đã hoàn thành theo phê duyệt riêng của chủ dự án. Chưa bootstrap hoặc bật Admin/CMS**, đang chờ duyệt bước tiếp theo và credential qua CLI an toàn. Không build, migration, thay thiết kế/D6 hoặc publish dữ liệu QA.

## Cập nhật bước chuẩn bị đã duyệt — khoảng 19:28–19:32 Asia/Bangkok

- Chủ dự án chọn “Duyệt bước chuẩn bị proxy và backup”; phạm vi này không bao gồm bootstrap, bật Admin/CMS hoặc publish.
- Tạo backup mới đúng schema bốn migration, đã copy off-host và restore thật vào DB loopback mới cô lập; hash/counts, bốn migration và AdminUser/ContentEntry/MediaAsset=0 đều PASS. SHA-256 archive **c89eff86216fa433484af2e7378402b78973eb9bcaff0bc244c7994abaa30142**. Bản C cũ giữ nguyên; không restore production.
- Archive VPS `.runtime/admin-prepare-20261020/archive/pre-admin.qvb`, local `.runtime/admin-prepare-backups/pre-admin.qvb`; private key vẫn chỉ ở local, ACL LONG_IT. Không có credential admin trong archive vì chưa bootstrap.
- Dừng/chạy lại web và worker QAVIO cho quiesced backup; sau đó chỉ recreate web để nhận proxy secret. Không restart DB hoặc container khác, không build/pull image.
- Cài Nginx site riêng QAVIO, include real-IP private, HTTP-context geo/map/log format riêng, secret include600 và env runtime private600. nginx -t PASS, graceful reload; image web/worker vẫn c205bbd.
- Nguồn IP xác minh qua [API Cloudflare chính thức](https://api.cloudflare.com/client/v4/ips): 15 IPv4 + 7 IPv6, khớp cấu hình. Endpoint text trả403 cho Python trên VPS; API chính thức trảsuccess=true, không bỏ qua kiểm TLS hoặc tự đoán CIDR.
- TLS ingress chỉ Cloudflare/loopback, kiểm peer gốc `$realip_remote_addr`; nguồn không tin cậy không được lợi từ header CF giả. Thử trực tiếp origin từ local với CF/header IP/secret giả: **403**. Public domain và origin TLS loopback đều ready200.
- Nginx ghi đè header IP/secret, secret khớp app theo kiểm tra boolean, không in giá trị. Body2MB đi qua proxy và app trả ADMIN_NOT_ENABLED503; body7MB bị proxy413. Chưa có nghĩa upload media đã thành công khi admin còn tắt.
- Access log mới chỉ timestamp/status/method/route group/duration, đã kiểm mẫu toàn bộ file; không raw URI/query/header/cookie. Error log riêng warn, không debug; không tuyên bố mọi loại thông báo critical đều đã được kiểm bằng dữ liệu thật.
- Sau recreate, enforce media/ops root UID1000/mode700; kiểm lại PASS. Chưa thử ảnh production. Có thể cần enforce lại nếu recreate volume media còn rỗng vì Docker copy-up metadata từ image.
- 14 public pages/HTTPS/assets/logo/404/noindex/forms status đều PASS. Python urllib bị Cloudflare trả403 ở một probe; curl từ VPS và Node từ máy local xác minh domain200, không coi trang chặn bot là kết quả application readiness.
- So sánh Restaurant app/worker/DB và portfolio: **ID, StartedAt, RestartCount giữ nguyên** trong bước chuẩn bị này. Không phát sinh sự kiện restart mới như lần build trước.
- Host sau chuẩn bị: khoảng552MiB available RAM, swap còn1,4GiB, disk vẫn2,3GiB/91%. Builder không chạy. Web/worker healthy, DB readiness=true; all approval/forms/indexing flags giữ false, provider disabled, AdminUser=0.
- Cấu hình trước thay đổi lưu riêng tại `.runtime/admin-prepare-20261020/` trên VPS; không Git secrets/backups. Log và verification JSON có lọc tại cùng thư mục.

Các mục1–14 phía dưới giữ bằng chứng **audit ban đầu**; những chỗ “BLOCKED/thiếu proxy/chưa thay đổi” là lịch sử trước phê duyệt, được cập nhật bởi phần này. Auth/UI production vẫn chưa nghiệm thu. Bước tiếp theo: [CLI bootstrap và phạm vi kích hoạt cần duyệt](ADMIN_BOOTSTRAP_HANDOFF.md).

## 1. Phiên bản production

- Checkout VPS `/opt/websites/qavio`: `eca4c34eeba1baf90618a06ee8784817e1534c34` (commit báo cáo); code ứng dụng đang chạy source `c205bbd92c1c13e696c6d807332a2c5de0c9facc`.
- Web image `qavio-web:c205bbd`, digest `sha256:7b85fb929af30f2d33d0d834b64e429b81d5da9763b94f143c98f8b3090bedd0`.
- Worker `qavio-operations:c205bbd`, digest `sha256:bf455cf861a440999217c8034ac42b14e1cd2cfa171aa764575282e0d416645c`.
- Không cần build hoặc migration mới để bật Admin/CMS. Giữ đủ ba Compose file đang triển khai.

## 2. Kiểm tra trước kích hoạt

| Hạng mục | Bằng chứng read-only | Kết quả |
|---|---|---|
| Phiên bản / dịch vụ | Đúng images c205bbd, web/worker healthy, DB running; RestartCount cả ba = 0 | PASS |
| Migration | Đủ `202610200001_initial`, `202610200002_timezone_safe`, `202610200003_data_constraints`, `202610200004_admin_cms` | PASS |
| Runtime DB | production / qavio_prod / qavio-postgres / qavio_app; qavio_app không SUPERUSER/CREATEDB | PASS |
| HTTPS/origin | Public HTTPS, origin TLS xác minh hostname, APP_ORIGIN=https://qavio.longh.org | PASS |
| Reverse proxy | Loopback 3100, X-Forwarded-Proto=$scheme trong TLS server; thiếu X-Qavio-Client-IP, X-Qavio-Proxy-Secret và trusted proxy secret ở app | **BLOCKED** |
| Upload qua proxy | client_max_body_size=1m, trong khi API nhận file tối đa 5 MB | **Cần sửa thành 6m** |
| Logging | QAVIO virtual host chưa đặt log format che query/URI; có thể kế thừa access log chung | Cần định dạng riêng trước dùng CRM/Admin |
| Cookie/session/CSRF | Source có __Host- cookie Secure/HttpOnly/SameSite=Strict, origin check, pre-login và session CSRF. Production auth chưa bật nên **chưa nghiệm thu live** | PENDING |
| Media | Root trong container web UID 1000, mode **755**, không group/world writable; ops root UID1000/mode700; volume riêng ngoài public | Chưa test upload production; cần kiểm tra/enforce mode sau recreate |
| Readiness | Public/origin `/api/ready` 200; ops databaseReady=true | PASS |

Không ghi mode media 700 như thể đã xác minh hiện tại: lần audit này đọc được 755. File upload được code ghi mode600; directory cần được đối chiếu lại sau recreate vì volume rỗng có thể được Docker copy metadata từ image.

## 3. Backup readiness

- Archive pre-D/E trên VPS và local cùng SHA-256 `fcbb78a2c23accc73596a26d2b6234cca585a1905d96c1805fcde1ef27ba7b2d`.
- Đã khôi phục thử thật trong lần phát hành trước; đối chiếu lịch sử **ba migration C**. Archive này được tạo trước khi áp dụng migration D, không mô tả đầy đủ schema bốn migration đang chạy.
- Lần kiểm tra hiện tại xác nhận private key off-host còn đọc/parse được dưới tài khoản LONG_IT và encrypt/decrypt challenge khớp cặp public key. Không ghi key vào log/report/Git.
- Ops đánh dấu backup FRESH, nhưng freshness không thay thế việc đúng phiên bản schema.
- **Đề xuất tạo backup QAVIO mới trước bootstrap**, dùng quy trình quiesced/mã hóa đã duyệt, giữ nguyên archive cũ, copy off-host và restore vào database mới cô lập. Chưa tạo backup mới hoặc restore production trong công việc này.

## 4. Trạng thái bootstrap

AdminUser=0, AuditLog=0, ContentEntry=0, MediaAsset=0. Chưa nhận email, tên hiển thị và password cho SUPER_ADMIN. Không suy đoán thông tin, dùng mật khẩu SSH hoặc tạo tài khoản mặc định.

CLI hiện có kiểm production/qavio_prod/qavio-postgres/qavio_app, flag chấp thuận theo invocation, target confirmation, mật khẩu nhập ẩn hoặc JSON stdin, kiểm chưa có AdminUser dưới transaction lock và audit ADMIN_BOOTSTRAPPED. **Chưa chạy bootstrap production**.

## 5. Flags

Admin=false, CMS=false, forms=false, policy=false, indexing=false, provider=disabled, legal/data-request approval=false, lead receipt=false. Giữ các giá trị này khi chờ duyệt.

Lưu ý: overlay `compose.release-candidate.yaml` đang hardcode Admin/CMS=false, nên chỉ sửa `.env.production` sẽ không bật được hai flag. Phương án là đổi riêng hai dòng sang interpolation mặc định false, đặt giá trị đã duyệt trong `.env` và `.env.production`, kiểm merged config bằng whitelist không in secret; chưa áp dụng.

## 6. Đăng nhập

`/admin/login` trả 200, noindex và Cache-Control private/no-store. `/api/admin/auth/csrf` trả ADMIN_NOT_ENABLED như thiết kế. Login/logout, cookie thực tế, session revoke và CSRF production: **NOT_RUN**, không dùng kết quả staging để ghi PASS production.

## 7. Các trang Admin

Code có dashboard, leads, subscribers, email queue, posts, categories, products, brand content, company/legal settings, accounts, audit, security, private preview. Chưa có phiên SUPER_ADMIN production để nghiệm thu từng trang. Quản lý media nằm trong form nội dung (upload/chọn ảnh), không có trang thư viện media độc lập.

## 8. Phạm vi chỉnh sửa UI — đối chiếu source, chưa nghiệm thu live

| Nội dung | Khả năng hiện có |
|---|---|
| Giới thiệu, sứ mệnh, tầm nhìn, giá trị | COMPANY/about, MISSION/mission, VISION/vision, VALUES/values; chủ yếu hiển thị tại `/about` |
| QuánPilot | PRODUCT/quanpilot: title, summary, body và danh sách tính năng trên `/products/quanpilot` |
| FAQ | FAQ/faq: danh sách hỏi/đáp trên `/faq` và nơi dùng FaqList |
| CTA | CTA/consultation: title, summary, nhãn/link từ danh sách route được phép tại các trang dùng ConsultationCta |
| Thông tin công ty | CONTACT/company: email, hotline, địa chỉ, liên kết xã hội ở `/contact` và footer; chỉ dùng dữ liệu đã xác minh |
| Bài viết | Tạo/sửa draft, preview, publish/unpublish, category, featured media, SEO; chưa thử public production |
| Ảnh | PNG/JPEG/WebP ≤5 MB, re-encode và chọn featured media; hiện renderer dùng ảnh ở bài viết/trang sản phẩm động và preview, không thay mọi ảnh trên website |

Test publish sẽ dùng bản nội dung được chủ dự án duyệt riêng, không tự công khai bài QA, thông tin công ty giả hoặc sửa logo.

## 9. Giới hạn, đề xuất D6 riêng

- Đây là **CMS theo form**, không phải visual page builder.
- Phần lớn trang chủ vẫn lấy văn bản/FAQ/values/hero/product block trực tiếp từ code/content, chưa nối các section này tới bản ghi CMS. Footer dùng dữ liệu CONTACT. Không cam kết sửa nội dung trên `/about` sẽ đồng thời thay phần Giới thiệu trang chủ.
- Ẩn/hiện hay sắp xếp section, thay banner/hero/logo, đổi màu/font/layout, kéo thả trực quan: chưa có UI.
- Unpublish nội dung thương hiệu trả về fallback có sẵn; không có nghĩa ẩn section mặc định.
- Upload featured image không tự thay hero hoặc ảnh gốc QuánPilot; `/products/quanpilot` hiện không render featuredMediaId thành banner.
- Preview là trang nội dung nội bộ (body, ảnh, structured fields), không phải bản xem trước toàn bộ layout public giống hệt.
- Không có media gallery độc lập, chỉnh kích thước/crop ảnh hoặc chèn ảnh tùy ý vào body bằng visual editor.
- Không phát triển D6 hoặc thay thiết kế trong lần kích hoạt này.

## 10. Docker/container health

Web và worker healthy; database readiness=true. Worker EMAIL_DISABLED/healthy, pending/failed mail=0. Builder vẫn không được khởi động. Chưa restart bất kỳ container nào trong công việc kích hoạt.

## 11. Disk/RAM

Host 955 MiB RAM, khoảng 501 MiB available tại audit; swap còn khoảng 1,4 GiB. Disk khoảng 2,3 GiB trống, đã dùng 91%. Không đủ dư địa cho build lớn; đủ xem xét thay cấu hình/backup nhỏ hiện tại sau rà soát. Không prune hoặc xóa volume/backup.

## 12. Hệ thống khác

Chỉ truy vấn QAVIO và tài nguyên host trong audit này; không đọc/sửa source hoặc DB Restaurant, không restart dịch vụ khác, không reload Docker/Nginx. Chưa có thay đổi để so sánh trước/sau. Sau khi được duyệt sẽ lấy baseline trạng thái tối thiểu các container đồng trú và đối chiếu sau, không can thiệp vào chúng. Sự kiện worker Restaurant của lần build trước được lưu trong PHASE_DE_DEPLOYMENT.md, không gộp thành sự kiện mới.

## 13. Việc cần duyệt và xử lý

1. Duyệt sửa riêng proxy QAVIO: secret private giữa Nginx/app, IP tin cậy, upload 6m, safe logs, kiểm nginx -t rồi graceful reload. Không đổi site/DNS khác. Xem [phương án cụ thể](ADMIN_ACTIVATION_PLAN.md).
2. Duyệt backup bốn-migration hiện tại, copy off-host và restore cô lập; không xóa bản cũ hoặc restore production.
3. Chủ dự án nhập email, tên và password vào CLI an toàn; **không gửi password trong chat**. Chưa nhận credential thì không bootstrap.
4. Chỉ sau bootstrap và điều kiện đạt mới bật hai flag, recreate riêng web QAVIO bằng images hiện có/ba Compose file; không restart DB/worker nếu không cần.
5. Login/UI/upload/draft/preview/restart test; xin duyệt nội dung và thời gian trước bất kỳ publish public.

## 14. Hướng dẫn đăng nhập — chờ kích hoạt

Sau khi được thông báo kích hoạt thành công: mở https://qavio.longh.org/admin/login, đăng nhập bằng credential chủ dự án đã nhập qua CLI; vào Bài viết/Nội dung thương hiệu/Sản phẩm/Thông tin & chính sách. Lưu DRAFT và kiểm Preview trước; chỉ xuất bản nội dung thật đã rà soát. Legal approval vẫn đóng. Không có tài khoản hoặc password mặc định để đăng nhập lúc này.

Trạng thái nghiệm thu tổng thể: **PENDING USER APPROVAL + SECURE CREDENTIAL INPUT**, chưa báo hoàn thành.
