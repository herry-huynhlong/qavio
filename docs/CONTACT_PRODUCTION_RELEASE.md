# QAVIO — Liên hệ production và thông báo Admin

Yêu cầu ngày21/10/2026, attachment7b5e7d61. Chủ dự án phê duyệt commit/push/deploy sau kiểm tra, cho phép phát hành code ở trạng thái đóng nếu policy chưa duyệt. Chưa hoàn tất tiêu chí gửi form production khi thiếu quyết định về dữ liệu; không coi phát hành code là mở tiếp nhận.

## Chức năng và trạng thái

- CONTACT `/contact` và DEMO `/request-demo` dùng Lead service hiện có, PostgreSQL `Lead`/`LeadActivity`, ba trường họ tên/điện thoại/lời nhắn và consent. Email nullable; không outbox hoặc phụ thuộc SMTP. Thông báo thành công đúng yêu cầu: “QAVIO đã nhận được yêu cầu của bạn. Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã cung cấp.” Lỗi giữ input, idempotency/rate limit/honeypot giữ nguyên.
- `formsEnabled()` yêu cầu public forms flag, production thêm data policy flag; frontend lấy `/api/forms/status`, backend guard xác minh độc lập. SMTP, Zalo và thông tin liên hệ không nằm trong gate CONTACT/DEMO. Policy vẫn chưa duyệt nên production giữ hai flag false; email disabled, newsletter/legal/data-request/indexing không mở.
- Chuông góc phải Admin cho SUPER_ADMIN/ADMIN: GET `/api/admin/leads/notifications`, đếm toàn bộ Lead trạng thái NEW (không phải trạng thái đã đọc riêng từng người), lấy10yêu cầu mới nhất với tên/số/nguồn/thời gian/lời nhắn tối đa160ký tự. Count và danh sách cùng snapshot PostgreSQL RepeatableRead. Mở chuông không xóa số; chuyển khỏi NEW mới giảm. Link “Xem tất cả” lọc NEW; link từng hàng tới `/admin/leads/[id]` được bảo vệ quyền CRM.
- Polling20giây, không chồng request; tab ẩn hoặc unmount/logout hủy request/timer, tab hiện lại đọc ngay. Mất quyền401/403 dừng và bỏ snapshot. Lưu xử lý Lead cập nhật chuông ngay trong phiên đang thao tác; phiên quản trị khác cập nhật lần poll kế tiếp. Không Redis, email, localStorage hoặc bảng thông báo thứ hai. Dashboard các số liệu cũ vẫn cập nhật khi tải/làm mới như trước; chuông tự cập nhật độc lập.
- CRM giữ tìm tên/số, mới nhất trước; bổ sung cột nguồn hiển thị dễ hiểu, giữ tel/copy/đã liên hệ/ghi chú/phân công/lịch sử và optimistic version.
- `/admin/settings` có form **Thông tin liên hệ QAVIO** trực tiếp, luôn hiện với SUPER_ADMIN khi trống. Trang `/admin/settings/contact` vẫn dùng chung component/API, Lưu thay đổi cập nhật CMS public/audit ngay. Trạng thái **Chưa cấu hình Zalo** rõ ràng, validation không nhận URL giả.
- Widget public đóng/mở có tooltip và nhãn. Khi có Zalo hợp lệ và bật, nút thu gọn hiển thị icon Zalo chính thức, thêm biểu tượng phone nếu có; khi chỉ có số thì dùng phone, không còn biểu tượng chat gây hiểu nhầm. Panel có tel và Zalo thật; không tạo chat giả. Production số0935269851 không đổi; chưa nhận URL Zalo chính thức nên không bật Zalo bằng dữ liệu suy đoán. Không bấm gọi hoặc mở Zalo thật trong QA.
- `/privacy` cập nhật dự thảo đúng ba trường, mục đích liên hệ, PostgreSQL/Admin, không email/newsletter tự động, quyền CRM, nhật ký/HMAC/backup và quy trình cần xác nhận. Không bịa tên pháp nhân, địa chỉ, quốc gia hoặc thời hạn lưu; chưa gắn nhãn đã duyệt.

## Kiểm thử

- Local lint, TypeScript, production build PASS. Không schema/migration mới; vẫn5migration.
- C29checks, Admin31checks, Contact13checks PASS: không email/outbox, idempotency/rate limit, tương thích dữ liệu cũ, quyền settings, audit/version/concurrency, notification count/newest10/preview/RBAC, hai phiên thấy count giảm khi đổi trạng thái. EDITOR/anonymous bị chặn; public không có API đọc Lead.
- Polling lifecycle test PASS:20s, hide dừng/hủy in-flight, visible đọc ngay, dispose/logout không tiếp tục, auth loss dừng, completion cũ không tự tạo timer lại. CI chạy thêm test này.
- Compiled HTTP API PASS; Admin HTTP14checks PASS, gồm bell API/no-store, deep link chi tiết, role matrix, settings/public update và CMS/auth hồi quy. NotFound sau layout streaming có thể trả HTTP200 kèm nội dung404; test xác minh nội dung không tồn tại, không nhận nhầm thành dữ liệu Lead.
- Public14trang/371internal links, metadata/sitemap/404/logo PASS.
- Browser với qavio_test: CONTACT mobile tênQA chuông CONTACT, DEMO tênQA chuông DEMO, số tổng hợp +12025550184/+12025550185, lời nhắn QA. Cả hai thành công đúng câu, DB đúng1Lead mỗi form/email null/0outbox; chuông24→25, mở thấy tên/số/nguồn/lời nhắn, vào đúng deep link, đánh dấu CONTACTED rồi25→24; CONTACT có ghi chú. Chuyển về Admin từ tab public làm poll tiếp tục đúng trạng thái visibility. Chỉ QA local, không đưa dữ liệu giả vào production.
- Browser `/admin/settings` từ trống vẫn hiện đầy đủ; lưu số/Zalo tổng hợp + toggles, widget dùng icon chính thức và đúng URL. Mobile304px không tràn ngang, nút nổi thu gọn không che gửi. Ảnh bằng chứng `.runtime/contact-production-evidence/` (ignored).
- Kiểm thêm Admin mobile304px: header không tràn ngang, popup nằm trong viewport; đăng xuất về login và không còn chuông. Test lifecycle xác minh request/timer dừng khi dispose. Fixture/tài khoản QA của lượt này đã dọn và server/PG test riêng đã dừng.

## Điều kiện chưa được xác nhận

Đã hỏi cụ thể trong chat ngày21/10, chưa nhận trả lời:

1. Tên đơn vị/cá nhân vận hành, người phụ trách dữ liệu, kênh nhận sửa/xóa/rút đồng ý; xác nhận có dùng0935269851 cho mục đích này không.
2. Thời hạn giữ Lead/consent/log/backup, người có quyền truy cập/phạm vi chia sẻ, nhà cung cấp và quốc gia lưu VPS/backup; quy trình xử lý và xóa thực tế, ngày hiệu lực/bản policy cuối cùng. Không tự cam kết cơ chế xóa chưa được triển khai.
3. URL Zalo chính thức để bật kênh Zalo. Thiếu URL Zalo không phải điều kiện khóa form.

Phê duyệt deploy không tự phê duyệt policy. Sau khi có quyết định cần cập nhật bản chính thức/consent version và kiểm tra phạm vi trước khi mở flag: public intake hiện cũng áp dụng QUOTE, nên không mở thu thập ngoài ba trường khi policy chỉ duyệt tư vấn. Chưa tự sửa flags hoặc dữ liệu production.

## Phát hành và bằng chứng

Backup production mới, mã hóa và copy off-host; SHA256 `83194abbafc571c17a056c136e6a2a8769f4b5f9d3baebc9371e782ca6b928aa`. Restore cô lập PASS ngày21/10, đủ5migration, row counts/1media khớp. Quiesce ngắn riêng web/worker QAVIO khi backup rồi khởi động lại; không restore production hoặc chạm Restaurant/portfolio.

Đã commit/push/deploy source `e299485f01960404af15ecb01f9b4777a857e59c` ngày21/10/2026. [CI39535637852](https://github.com/herry-huynhlong/qavio/actions/runs/39535637852) success; artifact12316359965, ZIP SHA256 `0802bc1454a717adea03b75b8d5a210ee156fd43ac883c4c67a47e802280296f` khớp GitHub. Archive SHA và chuỗi OCI/config/toàn bộ layer/platform/revision được xác minh trước khi cập nhật. Không build trên VPS.

- Web image `qavio-web:e299485`; config digest `sha256:8696750932bd3f2ee9ffc23563662af14b4fe8754ccdad62ae6caf9ae5bceacf`, runtime OCI manifest digest `sha256:73d17f9ab8edbb552aa78bc0c3d82315021a673f78b9ad3a4db4a4206c901a17`. Hai digest thuộc hai đối tượng khác nhau trong chuỗi đã xác minh.
- Chỉ recreate web với đủ3Compose hiện có. Web/worker c205bbd/PostgreSQL healthy và ready; vẫn5migration, không áp dụng DDL. Row counts ứng dụng không đổi. Container worker/DB/Restaurant/portfolio giữ ID/StartedAt/RestartCount so với baseline ngay trước deploy; quiesce backup trước đó có stop/start riêng web/worker QAVIO như đã ghi.
- HTTP14public pages, HTTPS/readiness/assets, cookie login, Origin/CSRF, anonymous denial/no-store PASS. API bell401 khi chưa đăng nhập, deep link chuyển login, không public đọc Lead. `/privacy` đã có nội dung dự thảo mới; form3trường, số0935269851, phone icon/tooltip đúng, Zalo không cấu hình nên ẩn, noindex giữ nguyên. Không gửi QA vào production.
- Browser domain thật: mobile304px không tràn ngang, tooltip “Liên hệ qua điện thoại”, không Zalo giả; /admin yêu cầu login. Chưa dùng mật khẩu production để nghiệm thu UI có quyền; chuông/CRUD đã kiểm trọn luồng trên qavio_test và phát hành đúng image đã test.
- Intake/policy vẫn false, Admin/CMS true; email disabled, newsletter/legal/data-request/indexing không mở. Không thay thông tin liên hệ hoặc dữ liệu CMS production. Vì chưa có phê duyệt cụ thể về policy và URL Zalo, **chưa hoàn tất tiêu chí gửi form production và mở kênh Zalo thật**. SMTP không phải blocker của CONTACT/DEMO.
- VPS còn khoảng11GiB disk (56% used), RAM available542MiB tại health check; không prune/xóa volume/restart Docker Engine. Giữ web68ba267 để rollback, không đảo DB. Bằng chứng private `.runtime/contact-production-release/deployed.json`; snapshot env không đưa vào Git. Các commit tài liệu saue299485 không yêu cầu rebuild image.
