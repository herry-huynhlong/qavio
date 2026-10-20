# Giai đoạn D — QAVIO Admin/CMS

Ngày thực hiện: 20/10/2026. Phạm vi: **local, D1–D5** tại `D:\anh\qavio`.

Không commit, push, deploy hoặc SSH/chỉnh VPS trong D. HEAD giữ `aa77a53`; origin hiện có `herry-huynhlong/qavio`. Production vẫn là bản C đã ghi trong PHASE_C_DEPLOYMENT.md, không có admin D. Kiểm tra HTTP đọc ngày 20/10: trang chủ trả 200, `X-Robots-Tag: noindex, nofollow`. Không suy diễn kết quả HTTP thành kiểm tra container/database production mới.

## 1. Chức năng thực tế

### D1 — Xác thực

- `/admin/login`: email/mật khẩu, trạng thái đang xác thực, lỗi chung không tiết lộ tài khoản tồn tại.
- Password scrypt N=65536/r=8/p=2, salt ngẫu nhiên 16 byte, key 64 byte; so sánh constant time. Giới hạn một phép scrypt đang chạy và tối đa tám phép chờ mỗi process.
- Session token 32 byte ngẫu nhiên chỉ trong cookie; DB lưu SHA-256. Thời hạn tuyệt đối 8 giờ, không hoạt động 30 phút, thu hồi bằng revokedAt/sessionVersion. Đổi mật khẩu, thay quyền, vô hiệu hóa tài khoản thu hồi toàn bộ phiên.
- Production cookie `__Host-qavio_admin`, Secure/HttpOnly/SameSite=Strict/Path=/; local dùng tên `qavio_admin`, không Secure để kiểm thử loopback HTTP. Không lưu token/password trong localStorage.
- Pre-auth CSRF nonce có chữ ký và cookie HttpOnly, hạn 10 phút. Mutation sau đăng nhập yêu cầu Origin chính xác, Fetch-Site hợp lệ và CSRF HMAC gắn với session. Login tạo token mới, thu hồi token cũ nếu có cookie, chống fixation.
- PostgreSQL rate limit: 15 lần/IP/phút và 5 lần/email/15 phút. Dùng trust boundary reverse proxy đã có ở C; không tin X-Forwarded-For tùy ý.
- Bootstrap CLI `pnpm admin:bootstrap`: prompt email/tên, mật khẩu nhập ẩn; hoặc JSON qua stdin từ secret manager. Không đưa password vào tham số dòng lệnh. Chỉ tạo SUPER_ADMIN đầu tiên trên qavio_dev hoặc `--test` trên qavio_test; không seed/default credential. CLI hiện **chặn production**; cần quy trình bootstrap riêng được duyệt ở E.
- `/admin/security`: đổi mật khẩu của mình, xem/thu hồi phiên của mình, đăng xuất. Server kiểm tra quyền lại ở mọi request/action.
- Khóa PostgreSQL `admin-security` cho mutation và bảo vệ SUPER_ADMIN cuối cùng, kể cả hai thao tác đồng thời. Không cung cấp DELETE tài khoản.

### D2 — CRM

- `/admin/leads`: phân trang server, tìm tên/email/điện thoại; lọc loại/trạng thái/từ–đến ngày. UI tìm qua POST để tránh từ khóa cá nhân trong URL mạng.
- Chi tiết CONTACT/DEMO/QUOTE/PRODUCT_INQUIRY; yêu cầu gốc chỉ đọc. Chuyển trạng thái, ghi chú tối đa 3.000 ký tự, phân công ADMIN/SUPER_ADMIN đang hoạt động.
- LeadActivity và audit được ghi cùng transaction. Version CAS trả 409 khi sửa bản cũ. Xem 100 hoạt động gần nhất.
- CSV chỉ SUPER_ADMIN, tối đa 1.000 bản ghi theo bộ lọc, xác nhận trước tải, audit số lượng/filter HMAC. Quote và tiền tố apostrophe cho mọi ô dữ liệu để chặn công thức, không lưu tệp chứa PII trên server.

### D3 — Newsletter/email

- `/admin/subscribers`: phân trang/tìm/lọc, consent events gần nhất, không trả token hoặc payload. Không API/UI tùy ý chuyển CONFIRMED.
- Ghi nhận yêu cầu hủy/truy cập/chỉnh sửa/xóa, bằng chứng và trạng thái RECORDED → REVIEWED. SUPER_ADMIN rà soát; chỉ UNSUBSCRIBE có bước thực thi khi `QAVIO_ADMIN_DATA_REQUESTS_APPROVED=true`. Mặc định tắt. Khi được duyệt, ghi consent event và tăng subscriber version để vô hiệu hóa hàng đợi cũ.
- Các quyền ACCESS/CORRECT/DELETE hiện ghi nhận/rà soát, cần quy trình thủ công được duyệt; chưa tự xóa hoặc xuất toàn bộ dữ liệu cá nhân.
- `/admin/email`: trạng thái đúng schema (gồm SENDING), số lần thử và lỗi đã lọc. Không payload/token/SMTP credentials.
- Retry riêng từng FAILED chỉ SUPER_ADMIN, dialog xác nhận, khóa hàng/version, tối đa ba lần retry thủ công. Tái sử dụng đúng kiểm tra recipient/consent/version/token/expiry của worker C; không tạo công cụ marketing hàng loạt. Provider vẫn disabled, đưa về hàng đợi không đồng nghĩa đã gửi.

### D4 — CMS

- `/admin/posts`, `/admin/categories`, `/admin/products`, `/admin/content`, `/admin/settings`.
- Bài viết/sản phẩm/danh mục, slug unique, draft/published, tóm tắt, trình biên tập cơ bản, ảnh đại diện, SEO title/description, lưu revisions theo version và xem 20 phiên bản gần nhất.
- Nhóm nội dung: COMPANY, MISSION, VISION, VALUES, FAQ, CTA, CONTACT, PRIVACY, TERMS. Trường dữ liệu có schema riêng, không page builder/JSON tùy ý trong form. CTA giới hạn route nội bộ; social chỉ HTTPS không credential.
- Quy ước vị trí: COMPANY/about, MISSION/mission, VISION/vision, VALUES/values, FAQ/faq, CTA/consultation, CONTACT/company, PRIVACY/privacy, TERMS/terms. Sản phẩm QuánPilot: PRODUCT/quanpilot.
- EDITOR biên tập nháp, không sửa bài đang published hoặc tự xuất bản. ADMIN/SUPER_ADMIN xuất bản. CONTACT/PRIVACY/TERMS chỉ SUPER_ADMIN; legal publish bị chặn trừ khi có approval flag riêng. Chính sách hiện giữ bản nháp/noindex.
- HTML được sanitize khi ghi và khi render; whitelist tag/attribute, không script/style/iframe/svg/event handler/data/javascript URL. Paste rich text chỉ nhận văn bản thuần; ảnh tải qua luồng riêng.
- Upload tối đa 5 MB, PNG/JPEG/WebP thật, kiểm MIME/magic/giải mã, chặn ảnh lỗi/animation/kích thước trên 4096 và 16 triệu pixel. Re-encode WebP tối đa 2048px, bỏ metadata, tên UUID ngoài public, một phép xử lý ảnh/process. Draft media yêu cầu auth; chỉ media tham chiếu từ nội dung published mới public.
- `/admin/preview/[id]` kiểm tra auth/quyền ở server, noindex/private; không phải link chia sẻ công khai. Preview bản đã lưu, không giả vờ xem trước bản chưa lưu.
- Public routes chuyển vào route group `(public)` để giữ header/footer riêng, URL cũ không đổi. News/sản phẩm đọc published DB; draft hoặc unpublish trả 404. About/QuánPilot/FAQ/CTA/footer/contact dùng nội dung đã publish, giữ nội dung A/B khi chưa có bản CMS. Metadata theo CMS ở bài viết/sản phẩm và các trang thương hiệu chính; sitemap thêm URL published, loại admin/legal drafts.
- Không seed hay xuất bản tin giả. Dữ liệu QA dùng riêng qavio_test và được dọn sau kiểm thử. URL QuánPilot tiếp tục qua cấu hình tập trung cũ, không nối DB/auth/payment.

### D5 — Dashboard/tài khoản/audit

- `/admin`: số liệu PostgreSQL thực tế (lead tổng/mới/theo loại/trạng thái, demo/quote, subscriber confirmed, email failed, bài published/draft). EDITOR chỉ nhận số liệu nội dung.
- `/admin/accounts`: SUPER_ADMIN tạo tài khoản, thay tên/quyền, vô hiệu hóa/kích hoạt, đặt lại mật khẩu; audit không chứa password/hash. Dialog/bước xác nhận thao tác nhạy cảm, không xóa tài khoản.
- `/admin/audit`: phân trang/tìm action/đối tượng/người thực hiện, lọc ngày/actorId/targetType, xem changes có chủ đích; không ghi toàn bộ request/PII/token.
- Navy/vàng kim, sidebar/header, bảng cuộn trong vùng riêng, loading/empty/error/disabled states. Native dialog, nhãn input, heading, skip link, focus rõ, menu mobile hỗ trợ Escape/focus trap và ẩn khỏi bàn phím khi đóng.

## 2. Permission matrix

| Khả năng | SUPER_ADMIN | ADMIN | EDITOR |
|---|---|---|---|
| Dashboard | Đầy đủ | Đầy đủ | Chỉ nội dung |
| CRM xem/xử lý/phân công | Có | Có | Không |
| Xuất CSV lead | Có | Không | Không |
| Subscriber/consent/ghi nhận yêu cầu | Có | Có | Không |
| Rà soát/thực thi quyền dữ liệu | Có, theo approval | Không | Không |
| Xem email outbox | Có | Có | Không |
| Retry email FAILED | Có | Không | Không |
| CMS/danh mục/media/bản nháp/preview | Có | Có | Có |
| Publish/sửa bài published | Có | Có | Không |
| CONTACT/pháp lý/settings nhạy cảm | Có | Không | Không |
| Tài khoản/audit toàn hệ thống | Có | Không | Không |
| Phiên/mật khẩu của mình/logout | Có | Có | Có |

## 3. Admin API

Prefix `/api/admin`. Response riêng tư `no-store`; mọi mutation/search POST có CSRF. Các listing GET vẫn có quyền và giới hạn page/size (tối đa 50).

| Method/path | Chức năng |
|---|---|
| GET auth/csrf; POST auth/login | Pre-auth CSRF; đăng nhập |
| GET auth/me; POST auth/logout | Identity an toàn/CSRF/permissions; thu hồi phiên |
| GET auth/sessions; POST auth/revoke; POST auth/password | Phiên và mật khẩu của mình |
| GET dashboard | Số liệu theo quyền |
| GET leads; GET leads/:id; PATCH leads/:id | CRM |
| GET leads/assignees; POST leads/export | Người phụ trách; CSV có giới hạn |
| GET subscribers; GET subscribers/:id | Danh sách/consent |
| POST subscribers/:id/requests; PATCH data-requests/:id | Ghi nhận/rà soát theo quy trình |
| GET email; POST email/:id/retry | Outbox an toàn; retry một email |
| GET/POST content; GET/PATCH content/:id | CMS có quyền/validation/version |
| GET/POST categories; PATCH categories/:id | Danh mục |
| GET/POST media | Thư viện metadata an toàn/upload multipart |
| GET/POST accounts; PATCH accounts/:id | Tài khoản, SUPER_ADMIN |
| GET audit | Nhật ký có bộ lọc |
| POST :resource/search | Tìm/phân trang leads/subscribers/email/content/categories/accounts/audit/media, cùng quyền listing |
| GET /media/:id (ngoài prefix) | Ảnh chuẩn hóa; draft cần auth |

Không có DELETE hoặc API bulk email. Không có endpoint liệt kê khách hàng công khai. Lỗi validation 422, không quyền 403, chưa auth/phiên hết hạn 401, conflict 409; lỗi nội bộ trả chung, không lộ stack/secret. Next có thể dùng HTML streaming redirect cho trang admin; API vẫn trả status xác thực rõ ràng và nội dung bị chặn trước khi đọc dữ liệu hạn chế.

## 4. Database/migration

`prisma/migrations/202610200004_admin_cms/migration.sql` là migration bổ sung, đã apply trên **qavio_dev và qavio_test local**, không production.

- Lead thêm assignedToId/version; EmailOutbox thêm version/manualRetries.
- Thêm AdminUser, AdminSession, AuditLog, Category, ContentEntry, ContentRevision, MediaAsset, DataRequest và enum/unique/index/FK/check email chuẩn hóa.
- ContentRevision unique entryId/version; giữ nguyên yêu cầu gốc Lead. AdminUser không xóa qua API; audit actor nullable để bảo toàn log nếu có quy trình lưu trữ tương lai.
- DataRequest dùng subscriber UUID tham chiếu nghiệp vụ để giữ hồ sơ yêu cầu khi có quy trình xóa dữ liệu sau này; server xác minh subscriber khi ghi/thực thi.
- Trước migration đã tạo sentinel C ở qavio_test; sau apply kiểm tra nguyên message lead, subscriber CONFIRMED và email FAILED, rồi dọn đúng sentinel. **PASS bảo toàn dữ liệu đã kiểm tra.** Không reset/drop/truncate database.
- Dùng cùng Prisma/service/PostgreSQL của C; không backend hoặc DB production thứ hai. qavio_test chỉ dành test và đã có từ C.

## 5. Kiểm thử đã chạy

| Kiểm tra | Kết quả |
|---|---|
| PostgreSQL D (`pnpm test:admin`) | PASS 31 nhóm: auth/logout/expiry/revoke/fixation, CSRF, RBAC read/mutation, account/last SUPER, filter/page, activity/audit/CSV, consent/gated data process, retry/limit, CMS/revisions/XSS/upload/concurrency |
| CLI thực (`tsx scripts/check-admin-bootstrap.ts`) | PASS stdin bootstrap, không echo credential, chặn bootstrap lần hai và production |
| Hồi quy C (`pnpm test:integration`) | PASS 29 nhóm, adapter email in-process; không email thật |
| Compiled admin HTTP (`pnpm test:admin:http`, sau tạo QA fixtures) | PASS 10 nhóm, route guard cả ba role, private APIs, draft 404/preview/auth, publish/SEO/sitemap/unpublish, nội dung công ty/sứ mệnh/tầm nhìn/giá trị/FAQ/CTA/liên hệ/sản phẩm public, logout |
| Public (`pnpm test:public`) | PASS 14 trang, 371 liên kết nội bộ, SEO/sitemap/404/logo gốc |
| Compiled public HTTP (`tsx scripts/check-api.ts`) | PASS private response, chặn GET mutation, newsletter pending/confirm/unsubscribe |
| Lint / TypeScript / production build | PASS trên Windows local |
| Đóng gói standalone | PASS không .runtime/.env.local/.env.production/.git; thêm tracing DLL sharp để upload/API chạy trong standalone Windows |
| Trình duyệt | PASS login/dashboard/logout; CRM trang 2/lưu trạng thái/phân công/ghi chú; CMS tạo/đọc lại nháp; menu/dialog mobile; không console warning/error hoặc hydration trong luồng đã kiểm tra |
| Responsive/a11y cơ bản | Desktop 1440/1280, mobile 390; mobile client/scroll đều 375px, bảng cuộn nội bộ; input có label, native modal, focus/menu Escape. Không thay thế kiểm toán accessibility toàn diện |

Tất cả integration/HTTP dùng loopback + qavio_test, SMTP disabled. Test fixture có email `example.invalid`, mật khẩu ngẫu nhiên không đưa vào Git/log, không phải tài khoản mặc định. Sau test dọn đúng bản ghi/tệp/credential QA, không để admin kiểm thử hoạt động. Không báo đã kiểm thử Linux Docker, SMTP thật, staging, restore backup hoặc pentest; các mục đó chưa chạy trong D.

Kiểm tra dọn cuối: qavio_dev và qavio_test đều không có AdminUser/ContentEntry/MediaAsset QA, mỗi DB có đủ bốn migration đã apply; tệp credential QA không còn. Đã dừng server HTTP kiểm thử và PostgreSQL portable được khởi động cho lần làm D; cần khởi động lại PostgreSQL QAVIO theo hướng dẫn C trước khi chạy local.

Ảnh nghiệm thu local (số liệu là fixture kiểm thử, không phải khách hàng): `phased-admin-desktop.png`, `phased-admin-mobile.png`, `phased-cms-mobile.png` trong thư mục artifact của chat.

## 6. Chạy lại local

1. Dùng PostgreSQL QAVIO riêng đã hướng dẫn ở C; giữ `.env.local` ngoài Git. `DATABASE_URL` là qavio_dev, `QAVIO_TEST_DATABASE_URL` là qavio_test.
2. `pnpm db:migrate`, `pnpm db:migrate:test`. Không dùng migrate reset. Test script tự guard database.
3. Bật `QAVIO_ADMIN_ENABLED=true`, `QAVIO_CMS_ENABLED=true` **local**. Giữ hai flag legal/data-request approval false nếu chưa có phê duyệt. Không đổi flags production/forms/indexing.
4. `pnpm admin:bootstrap` nếu muốn tạo tài khoản thật local bằng credential của chủ dự án; CLI từ chối khi đã có admin. `pnpm dev` để mở local. Không tạo sẵn tài khoản cho người dùng trong D.
5. Integration: `pnpm test:admin`, `pnpm test:integration`, `pnpm exec tsx scripts/check-admin-bootstrap.ts` (cần không có admin test khác).
6. Compiled HTTP/UI: `pnpm build`; `pnpm test:admin:fixtures`; `node scripts/start-test-server.mjs`; chạy các HTTP/public checks ở terminal khác. Kết thúc `pnpm test:admin:fixtures --cleanup`. Script này chỉ guard qavio_test và dọn fixture riêng. Dừng server trước build lại trên Windows vì native DLL bị khóa khi server đang chạy.
7. Standalone local đặt absolute media root trước khi Next đổi cwd, dữ liệu nằm ở `.runtime/media` ngoài artifact. Production D sau này cần `QAVIO_MEDIA_ROOT` và volume private bền vững được duyệt; chưa sửa Compose/VPS để bật D.

## 7. Các file thay đổi

- Prisma schema + migration bổ sung nêu trên.
- `src/server/admin/{auth,password,permissions,validation,audit,accounts,crm,newsletter,cms,media,api,page-auth}.ts`.
- `src/server/{public-content,cms-seo,outbox-eligibility}.ts`; worker C tách eligibility dùng chung, `http.ts` nhận giới hạn body tùy API, mặc định C giữ 16 KiB.
- `/api/admin/[[...path]]`, `/media/[id]`, admin layout/login/forbidden/protected dashboard và 11 trang quản trị + preview/loading/error/CSS.
- `src/components/admin/*`, `cms-body.tsx`, `cms-structured.tsx`; footer/public shared sections nối CMS.
- Public pages chuyển vào `(public)`, bổ sung news/product dynamic detail; metadata/sitemap và typography/ảnh CMS responsive trong globals.css; bỏ root loading boundary để missing/draft public trả HTTP 404 trước khi stream. Admin vẫn có loading boundary riêng.
- Scripts bootstrap, D integration, CLI check, admin HTTP và QA fixture; `start-local.mjs` media root.
- `.env.example`, AGENTS, package/lock/workspace, next.config, ARCHITECTURE và báo cáo này. Dependencies sanitize-html/types và sharp; không runtime/auth SaaS mới.
- Logo gốc `Qavio.png` root của chủ dự án giữ nguyên; public/brand/Qavio.png không đổi. Không sửa Restaurant hoặc repository khác.

## 8. Giới hạn và Giai đoạn E

- Chưa release D: cần chủ dự án duyệt commit/push/deploy riêng. Không bắt đầu E tự động.
- Chưa có tài khoản admin thật; cần credential của chủ dự án qua CLI. Cần quy trình bootstrap production, recovery/MFA nếu yêu cầu, retention session/audit/media và rà soát quyền vận hành.
- Quyền ACCESS/CORRECT/DELETE còn bước thực hiện thủ công, cần phê duyệt chính sách xác minh danh tính, đầu mối chịu trách nhiệm, thời hạn/lưu trữ; không bật flag thay cho việc duyệt quy trình.
- Thông tin pháp lý doanh nghiệp, email/hotline/địa chỉ/social chính thức, nội dung pháp lý/ngày hiệu lực vẫn cần xác nhận; không tự điền. Legal CMS hiện nháp/preview, public vẫn bản dự thảo. Mở tiếp nhận thật và indexing là quyết định riêng.
- Chưa cấu hình SMTP/DNS email, chưa thử gửi end-to-end thật; không marketing. Chưa password reset qua email, bulk import/export subscriber, khôi phục revision một nút hoặc xóa media; không hiển thị nút giả cho các chức năng này.
- E cần staging/Linux Docker build + HTTP upload, storage volume/ownership/backup media cùng DB, thử restore, kiểm tra migration bằng runtime role hiện có, tài nguyên VPS cho scrypt/sharp, giới hạn proxy request size, monitoring và review bảo mật/accessibility/performance trước release.
- Quy trình D giữ Compose/VPS hiện tại, không chạy migration D production, không bật admin, không đổi role DB/quyền/cổng/container khác, không truy cập QuánPilot/payment.
