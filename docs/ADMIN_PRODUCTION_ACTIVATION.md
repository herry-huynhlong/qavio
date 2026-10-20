# QAVIO — Kích hoạt Admin production và nghiệm thu CMS

Ngày 20/10/2026, giờ Asia/Bangkok. **Đã bật Admin/CMS và nghiệm thu luồng SUPER_ADMIN/CMS hiện có trên production.** Không phát triển D6, thay thiết kế hoặc build image mới. Bài thử được chủ dự án duyệt đã gỡ về nháp; không còn nội dung thử công khai.

## 1. Phiên bản production

- Local: `D:\anh\qavio`; VPS: `/opt/websites/qavio`; website: https://qavio.longh.org.
- Source ứng dụng: `c205bbd92c1c13e696c6d807332a2c5de0c9facc`.
- Web `qavio-web:c205bbd`, image SHA-256 `7b85fb929af30f2d33d0d834b64e429b81d5da9763b94f143c98f8b3090bedd0`.
- Worker `qavio-operations:c205bbd`, image SHA-256 `bf455cf861a440999217c8034ac42b14e1cd2cfa171aa764575282e0d416645c`.
- Cấu hình activation commit `dc091df`; các commit báo cáo tiếp theo không thay source/image. Dùng đủ `compose.yaml`, `compose.production.yaml`, `compose.release-candidate.yaml`.

## 2. Kiểm tra trước kích hoạt và proxy

Audit ban đầu phát hiện thiếu trusted proxy secret/header và giới hạn upload1m, đã dừng để trình phương án. Chủ dự án duyệt riêng bước chuẩn bị proxy/backup rồi duyệt bootstrap và bật Admin/CMS. Bằng chứng audit ban đầu giữ trong lịch sử Git; phương án ở `docs/ADMIN_ACTIVATION_PLAN.md`.

- PostgreSQL `qavio_prod`, hostname `qavio-postgres`, role runtime `qavio_app`, đúng bốn migration. Không migration/reset/drop/restore production.
- Proxy QAVIO đã có private secret đồng bộ app, ghi đè trusted headers, real-IP theo 15 IPv4 +7 IPv6 Cloudflare, xác minh qua API chính thức `https://api.cloudflare.com/client/v4/ips`.
- TLS origin chỉ nhận Cloudflare/loopback theo peer gốc; thử trực tiếp origin với CF/header giả trả403. Public HTTPS và origin loopback ready200.
- Upload limit6m: body2MB qua proxy tới app, body7MB bị413. Upload PNG thật qua CMS đã đạt ở mục8.
- Access log QAVIO chỉ timestamp/status/method/route group/duration; không raw URL/query/cookie/secret. Error log warn riêng, không bật debug.
- Nginx syntax PASS và graceful reload ở bước chuẩn bị. Không restart Docker Engine hoặc đổi domain/site khác.

## 3. Backup readiness

- Backup mới trước bootstrap đã copy off-host và restore thật vào database local loopback cô lập `qavio_e_restore_c41110db0297`: bốn migration, integrity/counts/hash PASS. Không restore production.
- Archive SHA-256 `c89eff86216fa433484af2e7378402b78973eb9bcaff0bc244c7994abaa30142`.
- VPS: `.runtime/admin-prepare-20261020/archive/pre-admin.qvb`; local: `.runtime/admin-prepare-backups/pre-admin.qvb`. Private key chỉ local, ACL LONG_IT; đã kiểm quyền truy cập và khả năng giải mã/restore. Bản backup cũ giữ nguyên.
- Đây là snapshot **trước bootstrap**, không chứa tài khoản hoặc các draft/media tạo sau đó. Không dùng nó để rollback activation thông thường. Lịch backup vận hành tiếp tục theo cấu hình hiện có; lần nghiệm thu này không tạo thêm bản post-CMS.
- Snapshot cấu hình activation tại VPS `.runtime/admin-activation-20261020/` (directory700/env600), chứa cấu hình có proxy secret trước khi bật hai flag. Rollback chỉ flags/config và web, giữ account/data; không dùng snapshot trước proxy secret cho rollback riêng activation.

## 4. Bootstrap SUPER_ADMIN

Chủ dự án tự chạy CLI qua Termius, xác nhận `production qavio_prod qavio-postgres` và nhập email/tên/password ẩn. Agent không nhận password, không tạo credential mặc định hoặc đọc hash/token.

Đã xác minh đúng một active SUPER_ADMIN, khớp email do chủ dự án nhập, đúng một audit ADMIN_BOOTSTRAPPED. Không chạy lại bootstrap. Hướng dẫn lịch sử: `docs/ADMIN_BOOTSTRAP_HANDOFF.md`.

## 5. Flags

| Cấu hình | Trạng thái |
|---|---|
| QAVIO_ADMIN_ENABLED / QAVIO_CMS_ENABLED | true trên web |
| QAVIO_PUBLIC_FORMS_ENABLED / QAVIO_DATA_POLICY_APPROVED | false |
| SITE_INDEXING_ENABLED | false |
| QAVIO_ADMIN_DATA_REQUESTS_APPROVED / QAVIO_LEGAL_PUBLICATION_APPROVED | false |
| EMAIL_PROVIDER | disabled |

Hai flag Admin/CMS trong overlay dùng interpolation mặc định false; giá trị true nằm trong env Compose và runtime private. Đã kiểm merged config trong bộ nhớ, không in secrets. Worker không recreate ở activation nên vẫn giữ env cũ; email bị tắt và worker healthy. Không kết nối authentication/payment/database QuánPilot.

## 6. Đăng nhập, session và đăng xuất

- Chủ dự án đăng nhập thành công; agent thấy dashboard với vai trò SUPER_ADMIN và tiếp tục trong chính phiên đó.
- HTTPS `/admin/login`200; CSRF endpoint200. Cookie **login challenge** thực tế có __Host- prefix, Path=/, Secure/HttpOnly/SameSite=Strict, không Domain.
- POST login sai Origin:403 ORIGIN_REJECTED; đúng Origin thiếu CSRF:403 CSRF_REJECTED. Chưa đến kiểm password, không thử credential suy đoán.
- Anonymous API auth/me, dashboard, content trả401; `/admin` chuyển về login. Preview nội bộ cũng chuyển về login khi chưa đăng nhập.
- Session thật tồn tại qua restart riêng web; trang Security hiển thị phiên hiện tại và hạn tám giờ. Không đọc token/hash. Thuộc tính Set-Cookie của session đăng nhập được đối chiếu source; không thu lại response chứa session cookie từ lần chủ dự án đăng nhập.
- Đã bấm Đăng xuất qua UI; dashboard và preview cũ đều chuyển về login. Chủ dự án cần đăng nhập lại để tiếp tục sử dụng.

## 7. Các trang Admin hoạt động

Đã mở thực tế: dashboard, leads, subscribers, email queue, bài viết, danh mục, sản phẩm, nội dung thương hiệu, thông tin/chính sách, tài khoản, audit, bảo mật và private preview. Trang tài khoản hiển thị đúng một SUPER_ADMIN active; không tạo thêm tài khoản, đổi password hoặc quyền.

Menu mobile mở và điều hướng được. Biên tập mobile và preview desktop hoạt động. Leads/subscribers/email không có dữ liệu khách hàng thử; không gửi mail hoặc thử retry với mailbox thật. Media quản lý trong trình biên tập, không có trang gallery riêng.

## 8. Chức năng UI đã kiểm chứng

Chủ dự án duyệt bộ dữ liệu qua chat: bài “Kiểm thử CMS QAVIO”, slug `kiem-thu-cms-qavio-20261020`, câu “Đây là nội dung kiểm thử chức năng CMS, không phải thông báo chính thức của QAVIO.”, danh mục “Kiểm thử nội bộ”, ảnh PNG “QAVIO CMS TEST”, tám bản nháp thương hiệu/sản phẩm/liên hệ. Chỉ bài thử và ảnh được phép công khai tối đa5phút rồi gỡ.

| Thao tác | Kết quả production |
|---|---|
| Tạo danh mục | Lưu và đọc lại được |
| Tạo/sửa bài nháp | Lưu version1, sửa summary version2, mở lại đúng dữ liệu |
| Giới thiệu, Sứ mệnh, Tầm nhìn, Giá trị | Lưu nháp, lọc theo nhóm, mở lại editor và preview PASS |
| QuánPilot | PRODUCT/quanpilot nháp, một mục tính năng, mở lại/preview PASS |
| FAQ | Một câu hỏi/trả lời trong nháp, mở lại/preview PASS |
| CTA | Nhãn nút và route /contact trong nháp, mở lại/preview PASS |
| Liên hệ | Nháp CONTACT/company, trường địa chỉ dùng câu kiểm thử; email/hotline trống, không thêm thông tin doanh nghiệp giả; đọc lại/preview PASS |
| Upload ảnh | PNG640×360 được re-encode, chọn làm featured image; preview tải đủ kích thước |
| Ảnh chưa xuất bản | Anonymous401; phiên SUPER_ADMIN tải được |
| Publish bài thử | Version3, audit19:47:31; page/list/media200, canonical/structured data/noindex/sitemap PASS |
| Gỡ xuất bản | Version4, audit19:48:06, sau35giây; page404, list/sitemap bỏ bài, ảnh anonymous401 |
| Persistence | Restart duy nhất web; chín draft, audit và hash file ảnh giữ nguyên; preview/ảnh/phiên vẫn dùng được |
| Chính sách bảo mật | Mở editor để kiểm; lựa chọn Xuất bản disabled và cảnh báo chờ rà soát; không lưu thêm dữ liệu pháp lý |
| Audit | Xem list và chi tiết CONTENT_UPDATED với DRAFT/version4; có LOGIN_SUCCEEDED, CATEGORY_CREATED, MEDIA_UPLOADED và các thao tác nội dung |

Tám nội dung thương hiệu/sản phẩm/liên hệ **không publish**; chưa dùng chúng để chứng minh cập nhật trang public. Sau test, tổng9 ContentEntry đều DRAFT,1 category,1 media; không xóa dữ liệu thử. Các trang /, /about, /products/quanpilot, /faq, /contact không lộ câu QA.

Bằng chứng local (ignored): `.runtime/admin-cms-evidence/published-post.png`, `draft-after-restart.png`; VPS: `.runtime/admin-cms-restart-20261020/before.json`, `verification.json`. Các tệp này không chứa password/session token.

## 9. Giới hạn và phần việc D6

- CMS theo form, không phải visual page builder. Chưa có kéo thả, đổi layout/màu/font, sắp xếp/ẩn-hiện section hoặc thay banner/hero/logo qua UI.
- Phần lớn section trang chủ còn lấy văn bản/FAQ/values/hero/product block trực tiếp từ code/content. Footer nối CONTACT; chỉnh COMPANY/about không đồng nghĩa đổi phần giới thiệu trang chủ.
- COMPANY/MISSION/VISION/VALUES chủ yếu nối /about; FAQ nối /faq và nơi dùng FaqList; CTA nối những trang dùng ConsultationCta; CONTACT nối /contact và footer.
- Featured image dùng cho bài viết, trang sản phẩm động và preview; /products/quanpilot chưa dùng featuredMediaId làm banner. Không có visual body image editor/crop hay gallery riêng.
- Preview là body/ảnh/structured fields nội bộ, không phải WYSIWYG toàn bộ trang public. Unpublish nội dung thương hiệu trả về fallback; không ẩn section mặc định.
- Chỉ SUPER_ADMIN được nghiệm thu bằng tài khoản production thật; không tuyên bố đã kiểm toàn bộ EDITOR/ADMIN RBAC production. Các role khác giữ kết quả staging/source riêng.
- Không tự phát triển D6 hoặc mở thêm các flag khác.

## 10. Docker/container health và kiểm thử

- Sau activation: chỉ recreate web bằng image hiện có. Sau upload: một lần restart riêng web theo bài nghiệm thu persistence, không recreate image/volume.
- Web, worker, PostgreSQL healthy; readiness=true. Worker EMAIL_DISABLED/healthy, pending/failed email0, login failures0. Media có1file3670bytes; UID1000, root700/file600, hash trước/sau restart bằng nhau.
- Kiểm HTTP cuối PASS:14 trang public, HTTPS/health/ready, CSS/logo,404/noindex, admin anonymous denial, login cookie/Origin/CSRF, forms closed, bài thử đã gỡ và ảnh lại riêng tư.
- Không chạy lại lint/TypeScript/production build ở tác vụ vận hành này vì source ứng dụng/image không đổi và yêu cầu không build. Compose merged config và runtime/HTTP/UI đã được kiểm. Kết quả build D/E trước đó là lịch sử, không trình bày như vừa chạy mới.

## 11. Disk/RAM sau thay đổi

Host955MiB RAM; lần đo cuối khoảng492MiB available, swap còn1445MiB. Disk còn khoảng2,43tỷbytes (xấp xỉ2,26GiB), vẫn chật như audit. Không build/pull image, prune, xóa cache/volume/backup. Builder vẫn dừng.

## 12. Hệ thống khác

Đối chiếu baseline các container Restaurant app/maintenance worker/database và portfolio: ID, StartedAt, RestartCount không đổi ở cả bước chuẩn bị, activation và restart test. QAVIO worker/database cũng không restart trong activation hoặc test media. Không sửa source/DB Restaurant, DNS/site khác hoặc Docker Engine.

Sự kiện worker Restaurant tự restart của lần build D/E trước đó giữ trong báo cáo triển khai cũ; không phát sinh restart mới trong tác vụ này.

## 13. Những vấn đề còn lại

- Cần nội dung doanh nghiệp thật đã rà soát trước khi thay các draft thử và xuất bản chính thức. Những draft QA tại vị trí about/mission/vision/values/faq/consultation/company/quanpilot không được xuất bản hàng loạt.
- SMTP chưa có provider/mailbox test nên chưa kiểm gửi thật. Form/policy/indexing/legal/data-request vẫn đóng theo yêu cầu.
- Thiếu các khả năng D6 nêu ở mục9; không nằm trong lần kích hoạt này.
- Backup đã restore là snapshot trước bootstrap; cần duy trì lịch backup và kiểm chứng snapshot có dữ liệu mới theo quy trình vận hành. Không reset/restore production để dọn test.

## 14. Hướng dẫn sử dụng và kết luận nghiệm thu

1. Đăng nhập tại https://qavio.longh.org/admin/login bằng tài khoản chủ dự án đã nhập qua CLI. Không có password mặc định. Phiên test đã đăng xuất.
2. Vào Nội dung thương hiệu, chọn đúng nhóm rồi bấm **Áp dụng** để lọc danh sách; **Tạo mới** dùng nhóm đang chọn. Sản phẩm và Thông tin & chính sách nằm ở menu riêng.
3. Mở bản nháp, thay câu QA bằng nội dung thật được duyệt, lưu **Bản nháp**, kiểm **Xem trước bản đã lưu**. FAQ/Giá trị/tính năng dùng **Thêm mục**; CTA chọn route được phép. Không đổi các thông tin công ty chưa xác minh.
4. Ảnh upload trong form; chọn ảnh đại diện, lưu, kiểm preview. Không dùng thao tác này để thay logo/hero toàn website.
5. Chỉ chọn **Xuất bản** khi nội dung sẵn sàng. Muốn gỡ, đổi về **Bản nháp** rồi lưu; bài viết sẽ bị bỏ khỏi public/sitemap, brand content dùng fallback.
6. Audit ở **Nhật ký kiểm toán**; session ở **Bảo mật tài khoản**. Không đưa password/token vào chat, Git hoặc báo cáo.

**Đạt nghiệm thu activation và luồng CMS hiện có bằng SUPER_ADMIN**: login/dashboard, lưu-đọc/sửa/preview, publish-unpublish bài được duyệt, upload/private media/persistence, logout và health. Những giới hạn của CMS, phạm vi role và thông tin chưa kiểm chứng được ghi rõ ở trên; không coi việc này là hoàn thành D6 hoặc mở tiếp nhận khách hàng.