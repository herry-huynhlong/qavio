# Phát hành QAVIO D/E — 20/10/2026

Website **https://qavio.longh.org** đã chuyển sang bản D/E lúc khoảng **18:56 Asia/Bangkok** sau yêu cầu “oke push lên sever bắt đầu chạy lên web” và “tiếp cho xong”. Đây là phát hành website với các chức năng tiếp nhận/admin còn đóng; không phải nghiệm thu SMTP, chính sách dữ liệu hay mở tài khoản quản trị.

## Phiên bản và cấu hình thực tế

- Source ứng dụng: `c205bbd92c1c13e696c6d807332a2c5de0c9facc`, đã push `origin/main` tại `herry-huynhlong/qavio`.
- Web `qavio-web:c205bbd`, image `sha256:7b85fb929af30f2d33d0d834b64e429b81d5da9763b94f143c98f8b3090bedd0`.
- Worker `qavio-operations:c205bbd`, image `sha256:bf455cf861a440999217c8034ac42b14e1cd2cfa171aa764575282e0d416645c`.
- Checkout `/opt/websites/qavio`, project `qavio`, loopback web `127.0.0.1:3100`, PostgreSQL `qavio_prod` vẫn là container/volume C riêng, không publish DB port.
- Dùng **cả ba** file `compose.yaml`, `compose.production.yaml`, `compose.release-candidate.yaml`. `.env` riêng trên VPS ghi COMPOSE_FILE và image tag; không chỉ chạy hai file C cho các cập nhật D/E.
- QAVIO_ADMIN_ENABLED=false, QAVIO_CMS_ENABLED=false, QAVIO_PUBLIC_FORMS_ENABLED=false, QAVIO_DATA_POLICY_APPROVED=false, SITE_INDEXING_ENABLED=false, EMAIL_PROVIDER=disabled. Các flag legal/data-request vẫn false. AdminUser production: **0**, không có tài khoản mặc định.
- Volume media `qavio_qavio_media`, ops `qavio_qavio_ops`, owner UID 1000, thư mục 700. Hai volume được tạo riêng trước backup; Compose báo đã tồn tại ngoài Compose nhưng mount đúng volume. Không xóa/recreate volume để sửa nhãn quản lý.
- Migration D `202610200004_admin_cms` đã áp dụng thành công; cả bốn migration đều có trong production. Các flag chấp thuận migration/backup/SHA chỉ truyền cho lần chạy, không đưa vào runtime env lâu dài.

## Build và lỗi đã xử lý

- Lint, TypeScript và production build Linux: PASS. Dependency download concurrency 4, child concurrency 1; heap build 512 MiB, Next build 1 worker. Máy 1 GB build rất chậm, TypeScript lần cuối khoảng 13,6 phút; không lấy thời gian này làm benchmark runtime.
- Phát hiện và tái hiện lỗi build không có env: nội dung fallback và sitemap có thể bị prerender cố định trước khi kiểm tra flag CMS. Đã đưa `connection()` lên trước các flag; thêm kiểm tra manifest build cho `/`, `/about`, `/faq`, `/contact`, `/sitemap.xml`. Baseline thất bại, image cuối PASS; HTTP CMS thực tế cũng PASS.
- Một lần export image gặp lỗi session/deadline sau build; chạy lại từ cache đã nạp image thành công. Không coi lần lỗi đó là build/deploy thành công.
- Operations image chỉ chứa dependencies, source, scripts, Prisma và cấu hình cần thiết; bỏ các web build outputs khỏi image worker.
- Builder riêng từng được nâng RAM từ 512 lên 768 MiB, tổng RAM+swap vẫn 1536 MiB và CPU 0,5. Sau cùng đã đưa về 512/1536 MiB và **dừng builder**. Không restart Docker Engine hoặc prune cache chung.

## Rehearsal Linux cô lập

Project `qavio-staging`, DB `qavio_staging`, volumes riêng, web chỉ loopback 3102; không tạo DNS hoặc public staging HTTPS. APP_ORIGIN dùng origin đã xác nhận của QAVIO, các HTTP test gọi service nội bộ. Không coi đây là kiểm chứng một reverse proxy HTTPS staging riêng.

- UID 1000, OpenSSL/CA, pg_dump 16, Prisma, runtime role không CREATE/ghi lịch sử migration, sharp re-encode, volume ownership, image không chứa env/runtime riêng: PASS.
- Auth, origin/CSRF, upload thật, draft private, publish/unpublish, sanitize HTML, CMS công ty và sitemap cập nhật theo runtime: PASS.
- Ảnh giữ nguyên hash qua thay image/restart; session còn hạn vẫn dùng được sau restart thực tế: PASS. Fixture QA cũ được đưa lại DRAFT và làm mới phiên trước lần restart cuối; không dùng dữ liệu/tài khoản production.
- 14 trang / 371 liên kết, metadata, sitemap, 404, logo gốc: PASS.
- Dừng riêng DB staging: liveness 200, readiness 503; khởi động DB lại readiness 200: PASS.
- Worker SIGTERM thoát 0 và ghi STOPPED: PASS; provider disabled, không gửi mail.
- Prisma client image C đọc Lead/NewsletterSubscriber/EmailOutbox trên schema D staging: PASS, hỗ trợ phương án rollback ứng dụng.
- Backup staging mã hóa AES-GCM/RSA, gồm 1 media và dữ liệu QA C/D; restore vào DB PostgreSQL 16 mới với network none, đối chiếu hash/count/schema/media: PASS. Không restore production.
- Quan sát stage web khoảng 108 MiB, worker 22 MiB; đây là mẫu nhỏ, không phải SLO hoặc tải production. Staging và container restore đã dừng, giữ dữ liệu cô lập để đối chiếu.

## Backup trước migration production

- Đã thực sự dừng riêng web/worker QAVIO khi backup; C tự chạy lại sau backup trong lúc kiểm tra bản sao. Không dừng DB hay dịch vụ khác.
- Archive `pre-de.qvb` dùng AES-256-GCM + RSA-OAEP-SHA256, SHA-256 **fcbb78a2c23accc73596a26d2b6234cca585a1905d96c1805fcde1ef27ba7b2d**.
- Bản production C lúc backup có 0 lead/subscriber/outbox/media; restore vẫn kiểm bảng và dữ liệu đếm cùng lịch sử ba migration C.
- Archive ở VPS `.runtime/release-e/archive/pre-de.qvb`, đã tải về máy local, checksum trùng và **khôi phục thử thật** vào database loopback mới `qavio_e_restore_<random>`, không ghi đè dev/test/production. Lịch sử ba migration C: PASS.
- Private key chỉ ở máy local trong `.runtime/release-e-keys/production-backup.key.pem`, ACL chỉ LONG_IT; không gửi private key này lên VPS/Git. Archive local ở `.runtime/release-e-backups/pre-de.qvb`, thư mục ACL riêng. Đây là bản sao ngoài VPS trên máy chủ dự án, chưa phải dịch vụ lưu trữ backup độc lập/retention được duyệt.
- Chưa cấu hình lịch backup hoặc tự xóa bản cũ. Cần chốt người giữ khóa, bản sao dự phòng và retention/RPO/RTO trước mở tiếp nhận thật.

## Kiểm tra sau chuyển production

- Public HTTPS và origin TLS có xác minh hostname: health/readiness 200. Web, worker, DB healthy; web/worker release mới RestartCount=0.
- 14 public route HTTP 200; CSS/logo 200, favicon tạm 204, trang không tồn tại 404. Noindex giữ nguyên.
- Forms status `{enabled:false,emailConfigured:false,testing:false}`; admin API trả ADMIN_NOT_ENABLED, không báo gửi thành công giả.
- Ops: databaseReady=true, worker EMAIL_DISABLED/healthy, backup FRESH, pending/failed mail 0, media 0, login failures 0.
- Browser domain thật: menu mobile mở/đóng và điều hướng Liên hệ hoạt động; form hiển thị chưa kích hoạt/nút gửi disabled. Logo tải được, không tràn ngang ở viewport 375; console không có warning/error trong lần kiểm tra. Không dùng kết quả Lighthouse local trước release như benchmark production.
- Ảnh bằng chứng ở thư mục visualizations local: `qavio-production-deployed.png`.

## Host chung và sự kiện cần ghi nhận

Không sửa repository, source, database hoặc cấu hình Restaurant/portfolio; không ra lệnh restart chúng. IDs các container khác giữ nguyên. Restaurant app/DB và portfolio giữ nguyên StartedAt, RestartCount=0; HTTP Restaurant 307 và portfolio 200 như baseline.

**Worker bảo trì Restaurant có một lần tự restart**, cùng container ID, StartedAt đổi từ 19/10 sang **20/10 17:02:39 Asia/Bangkok**, RestartCount=1; hiện running. Không được ghi nhận là “mọi dịch vụ khác không restart”. Đọc thông tin chẩn đoán tối thiểu không thấy OOM/heap fatal/SIGTERM; Docker event cho thời điểm đó không còn trong kết quả truy vấn, kernel journal không cung cấp bằng chứng nguyên nhân. State.OOMKilled=false hiện tại không chứng minh nguyên nhân lần thoát trước. **Chưa xác định nguyên nhân hoặc mối liên hệ với build**; không sửa Restaurant để suy đoán khắc phục.

Sau rollout host khoảng 537 MiB available RAM, swap còn khoảng 1,4 GiB; disk còn **2,3 GiB (91% đã dùng)**. Đây là hạn chế vận hành cần xử lý trước lần build tiếp. Không tiếp tục build lớn trên VPS chung 1 GB; chuẩn bị Linux build host/CI riêng và phương án dọn cache chỉ QAVIO được rà soát. Chưa tạo CI/CD hoặc tự prune để giải phóng dung lượng.

## Rollback và phần chưa mở

- Giữ images `qavio-web:570f8f7`, `qavio-operations:570f8f7` và các image rollback A/B trước đó.
- Cấu hình C riêng được giữ ở `.env.production.before-e-c205bbd`, `.env.before-e-c205bbd` (không Git). Rollback code dùng tag 570f8f7, hai Compose file C, khôi phục đúng cấu hình C và chỉ cập nhật web/worker QAVIO. Giữ DB/media/ops volumes, không rollback DDL hoặc restore DB tự động. Client C với schema D đã rehearsal.
- Đã loại các image ứng viên abcb81d chưa từng chạy production sau khi dừng container QA sử dụng chúng; giữ nguyên volumes QA, image C và rollback A/B. Không xóa image/volume ứng dụng khác.
- Admin/CMS production chưa mở và chưa bootstrap chủ tài khoản; cần credential riêng, kiểm proxy/HTTPS rồi thực hiện quy trình bootstrap đã duyệt.
- SMTP/provider/mailbox chưa có: gửi thật, SPF/DKIM/DMARC/inbox **NOT_RUN**. Forms/chính sách pháp lý/indexing/marketing/payment và tích hợp QuánPilot chưa được mở.
- Collector/alert routing, backup schedule/retention và staging HTTPS riêng chưa hoàn thiện. **GO cho website đang đóng tiếp nhận; không tuyên bố GO cho nhận dữ liệu/email/admin production.**

Log vận hành có lọc nằm trong `.runtime/release-e/` trên VPS; secrets/env, archive/key và fixtures không nằm trong Git.
