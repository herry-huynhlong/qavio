# QAVIO — runbook ứng viên D/E

Chưa phải lệnh được phép chạy trên production. Phải có xác nhận phát hành riêng, image SHA cụ thể, staging đạt và backup đã kiểm tra. Không dùng lệnh của runbook trong thư mục Restaurant hoặc project Docker khác. Không `compose down -v`, prune, migrate reset, drop/truncate dữ liệu thật hoặc tự rollback DDL.

## Ranh giới và cấu hình

- Production hiện tại: `qavio`, `/opt/websites/qavio`, `qavio_prod`, service DB `qavio-postgres`, loopback 3100. Không sửa trong E.
- Staging chuẩn bị: file **compose.staging.yaml riêng**, project `qavio-staging`, DB `qavio_staging`, volume `qavio-staging_qavio_staging_*`, loopback 3102. Không dùng chung network/volume/database với production hoặc Restaurant. Chưa khởi chạy.
- `.env.staging.example` là mẫu không có credential. Tạo `.env.staging`, `.env.staging.database`, `.env.staging.migration` ở nơi riêng permission 600; không commit. SITE_URL/APP_ORIGIN cần staging origin HTTPS đã được duyệt, không tự tạo DNS. `DATABASE_URL` runtime dùng qavio_app, migration dùng qavio_owner; URL-encode mật khẩu.
- Database env: POSTGRES_DB=qavio_staging, POSTGRES_USER=qavio_owner, POSTGRES_PASSWORD và QAVIO_APP_DB_PASSWORD sinh riêng qua secret manager. Migration env: QAVIO_DEPLOYMENT_ENV=staging, DATABASE_URL owner cùng DB; flag QAVIO_STAGING_MIGRATION_APPROVED chỉ bật cho lần chạy được phép. Không dùng credential production cho staging.
- Runtime URL đề xuất `?connection_limit=3&connect_timeout=3`. Root media `/var/lib/qavio/media`, ops `/var/lib/qavio/ops`, owner UID 1000, thư mục không group/world writable, file 600. Không mount media vào public hoặc Nginx alias.
- Production candidate overlay `compose.release-candidate.yaml` mặc định **tắt admin/CMS/forms/policy/indexing/email**. Mở admin/CMS cần xác nhận riêng sau bootstrap và kiểm tra HTTPS/proxy. Không sửa flags pháp lý để vượt guard.
- Memory candidate web 512 MiB/swap tổng 768 MiB chỉ là mức thử dự phòng, chưa được duyệt trên VPS. Đo Linux thực tế và ngân sách cả host trước áp dụng. Builder nên chạy trên máy build riêng nếu VPS không đủ RAM/đĩa.

## Linux/staging rehearsal — chỉ khi có môi trường được phép

1. Ghi Git SHA ứng viên 40 ký tự, trạng thái sạch, digest base images và manifest image đã build. D/E hiện chưa commit nên SHA ứng viên **TBD**, không dùng HEAD C như thể bao gồm D/E.
2. Kiểm tra tài nguyên host, cổng 3102, namespace/volume/network; dừng nếu không đủ. Không khởi động Docker Engine chung để làm thử nếu có thể tự khởi động lại dịch vụ khác.
3. Chuẩn bị env files, private proxy-secret include, staging HTTPS và nguồn IP tin cậy. Không in `docker compose config` đầy đủ có env/secret; dùng `config --quiet`.
4. Build hai target `runner` và `operations` với compose.staging.yaml, `QAVIO_STAGING_SITE_URL` là origin được duyệt. Docker builder không nhận env/private media/backup/keyfiles. Operations dùng PostgreSQL 16 bookworm cùng node binary từ builder để có pg_dump/pg_restore 16; phần này **cần kiểm chứng Linux runtime**.
5. Khởi động riêng qavio-postgres staging. Chạy migration staging sau xác nhận; runtime app/worker chưa mở tiếp nhận. Không áp dụng migration qua role runtime.

```bash
# Ví dụ thủ tục sau khi staging được duyệt; không phải yêu cầu thực thi ngay.
docker compose -f compose.staging.yaml config --quiet
docker compose -f compose.staging.yaml build web worker
docker compose -f compose.staging.yaml up -d qavio-postgres
docker compose -f compose.staging.yaml run --rm -e QAVIO_STAGING_MIGRATION_APPROVED=true migration
docker compose -f compose.staging.yaml up -d --no-build web worker
docker compose -f compose.staging.yaml run --rm --no-deps worker node scripts/check-linux-runtime.mjs
```

6. Linux smoke kiểm tra UID, OpenSSL/CA, pg_dump16, Prisma/role/schema, sharp thật, volume owner, app health/readiness, forms đóng và không env/runtime bí mật trong image. Kết quả smoke không thay thế đăng nhập/CMS/upload/restart/restore.
7. Tạo admin **QA staging** qua bootstrap sau duyệt staging, mật khẩu ngẫu nhiên qua TTY hoặc stdin an toàn; không seed/default. Kiểm tra SUPER_ADMIN/ADMIN/EDITOR, CSRF/origin, session/last SUPER, CRM, consent/retry, published/draft/XSS và preview noindex với dữ liệu tổng hợp. Không đưa thông tin khách hàng thật vào test.
8. Upload ảnh bằng API/UI, ghi hash và ID fixture; xác minh anonymous không xem được draft. Restart **chỉ web staging** `restart web`, đăng nhập/phiên còn hạn và ảnh vẫn đọc đúng hash. Kiểm tra owner/mode/quota và 413/422/507. Không restart database/Restaurant.
9. Kiểm tra worker heartbeat HEALTHY ở EMAIL_DISABLED, không SENT/giả xác nhận. Kiểm tra SIGTERM khi worker idle và đang xử lý adapter staging; chờ in-flight xong trong grace period; đối chiếu lease recovery. Không dùng kết quả shutdown Windows thay Linux.
10. Backup mã hóa staging, restore vào PostgreSQL cô lập khác, kiểm hash/media/counts/migrations và giá trị mẫu. Không restore vào staging đang dùng hoặc production.
11. Đo Lighthouse, bounded concurrency, cgroup memory/RSS/CPU/disk và readiness khi DB staging mất kết nối rồi phục hồi. Không stress test production. Xác nhận container/service khác không thay đổi ID/StartedAt nếu được duyệt kiểm tra host chung.
12. Lưu bằng chứng, image digests và GO/NO-GO. Chỉ lập xác nhận phát hành sau tất cả điều kiện bắt buộc đạt.

## Backup mã hóa và restore

`scripts/ops-backup.mjs` dùng pg_dump **custom format**, AES-256-GCM với khóa dữ liệu ngẫu nhiên, RSA-OAEP-SHA256 bọc khóa dữ liệu; mỗi file có SHA-256. Database + media tham chiếu được gói chung. Dùng RSA ít nhất 3072 bit; script test dùng khóa QA trong `.runtime`, không phải khóa vận hành.

- Public key đặt trên host backup; **private key giữ riêng/off-host** cùng người có thẩm quyền khôi phục. Không để private key cùng archive hoặc trong image/Git. Quyền 700 cho nơi backup/temp, 600 cho file; Windows local kiểm thử không thay thế kiểm tra ACL Linux.
- Tool hiện yêu cầu **quiesced backup**: người vận hành đóng ghi và dừng worker QAVIO theo maintenance đã duyệt trước dump; đặt QAVIO_BACKUP_QUIESCED=true chỉ sau khi thực sự ổn định dữ liệu. Không giả định flag tự đóng ghi. Chưa tự động pause website hoặc tạo lịch chạy gây downtime.
- Env: DATABASE_URL role backup/owner có quyền đọc toàn bộ schema, QAVIO_PG_BIN nếu tools không trong PATH, QAVIO_MEDIA_ROOT, QAVIO_BACKUP_PUBLIC_KEY_FILE, QAVIO_BACKUP_FILE tên mới, QAVIO_OPS_TEMP_ROOT ở filesystem private, QAVIO_OPS_ROOT cho marker backup. Backup production còn yêu cầu QAVIO_PRODUCTION_BACKUP_APPROVED=true cho lần được phép.
- Nạp env riêng qua secret manager/Docker env_file hoặc Node --env-file; không in nội dung. `node scripts/ops-backup.mjs` không nhận password/URL có secret qua arguments. Thư mục temp do tool tự tạo, được kiểm tra ranh giới trước dọn; không dọn đường dẫn người dùng tùy ý. Archive lỗi không được coi là backup thành công. Marker backup chỉ cập nhật sau khi gói mã hóa hoàn tất; nó chưa chứng minh offsite/restore mới nhất.
- Kiểm SHA archive, GCM authentication, restore cô lập và đối chiếu schema/counts/giá trị mẫu/media. Gzip test hoặc Compose syntax không đủ bằng chứng backup phục hồi được.
- Tool restore **chỉ** chấp nhận tên `qavio_e_restore_<12 hex>` trên loopback, explicit QAVIO_E_TEST_SANDBOX=true, DB và media folder rỗng. Từ chối production, Restaurant, target remote hoặc target đã có bảng. Không có --clean/--create/reset/drop.
- Restore env: QAVIO_RESTORE_DATABASE_URL, QAVIO_RESTORE_MEDIA_ROOT, QAVIO_BACKUP_FILE, QAVIO_BACKUP_PRIVATE_KEY_FILE, QAVIO_OPS_TEMP_ROOT. Lệnh: `node scripts/ops-backup.mjs --restore-isolated`. Sau kiểm tra tag/hash toàn bộ mới gọi pg_restore single transaction. Target lỗi giữ lại để điều tra, không tự xóa dữ liệu.
- Trên Linux có thể dùng một PostgreSQL 16 container restore **network none** riêng, rồi operations container share namespace của đúng container restore để loopback tới DB mới; không publish cổng hoặc join network ứng dụng. Tạo DB tên prefix quy định bằng role riêng, mount archive/key read-only và private media volume trống. Cần duyệt tài nguyên và kiểm chứng quy trình này; chưa thực hiện Docker restore.
- Restore production là thủ tục DR **khác**, chưa được tool cho phép: xác nhận sự cố/phạm vi mất dữ liệu, lưu trạng thái hiện tại và các ghi mới, thử restore đầy đủ trên DB cô lập, kiểm quyền/secret/owner, rồi mới duyệt cutover và mọi thao tác phá hủy. Không đổi tên/ghi đè volume production trong runbook tự động.

Lịch **đề xuất chờ duyệt**: trước mỗi deploy/migration và một lần/ngày lúc 02:00 Asia/Bangkok trong maintenance được thống nhất; hoặc thiết kế online snapshot nếu không chấp nhận maintenance hàng ngày. RPO/RTO cần chủ dự án chốt; chưa cam kết 24h/bao nhiêu phút. Retention, số bản ngày/tuần/tháng, vị trí offsite, ngân sách và người giữ private key **chưa duyệt**; không tự xóa backup hay cài timer. Cần offsite copy, checksum sau copy, cảnh báo >36h không có backup mới và restore drill định kỳ. Ngưỡng 36h hiện chỉ là cảnh báo kỹ thuật đề xuất.

## Bootstrap production và recovery

CLI hỗ trợ `--production` nhưng không được chạy cho đến khi được duyệt riêng. Điều kiện: tier production, DB qavio_prod, host qavio-postgres, role qavio_app, QAVIO_PRODUCTION_BOOTSTRAP_APPROVED=true **cho đúng invocation**. TTY yêu cầu gõ môi trường/database/host; password nhập ẩn. Với secret-manager stdin phải có email/name/password và confirmEnvironment/confirmDatabase/confirmHost khớp; input tối đa 2 KiB, không truyền password qua argv hoặc echo vào terminal/log. Không lưu approval flag lâu dài trong runtime env.

Bootstrap chạy khóa `admin-security`, yêu cầu chưa có bất kỳ AdminUser nào, scrypt hash, ghi ADMIN_BOOTSTRAPPED audit trong cùng transaction. Chỉ sau đó mới duyệt mở admin/CMS và kiểm HTTPS/cookie Secure/HttpOnly/Strict. Production bootstrap chưa được thực thi/kiểm chứng end-to-end; local CLI và guard từ chối đã được thử.

Nếu mất quyền: ưu tiên SUPER_ADMIN thứ hai đã xác minh dùng UI reset password/quyền, thu hồi phiên, ghi audit. Nếu không còn SUPER_ADMIN sử dụng được: giữ admin đóng, xác minh người yêu cầu với chủ dự án qua kênh độc lập, backup trước thao tác, duyệt một thủ tục recovery offline có người giám sát, cập nhật hash bằng cùng thư viện scrypt trong transaction + thu hồi sessions + audit. **Chưa có CLI recovery đã duyệt**, không dùng bootstrap để bỏ qua count guard, không sửa DB bằng plaintext/default password. Không restore toàn DB chỉ để đổi mật khẩu.

MFA chưa triển khai. Đề xuất WebAuthn/passkey cho SUPER_ADMIN, hoặc TOTP có recovery codes mã hóa và quy trình mất thiết bị; cần threat model, quyết định sản phẩm, implementation/test riêng. Không coi IP allowlist thay MFA.

## SMTP và tiếp nhận thật

Provider hiện disabled; chủ dự án xác nhận chưa có provider/test mailbox. `pnpm test:smtp` hiện trả NOT_RUN (exit 2), không phải lỗi gửi hoặc PASS SMTP.

Khi được cung cấp: cấu hình SMTP 465/TLS hoặc 587/STARTTLS bắt buộc, SMTP_USER/PASSWORD, EMAIL_FROM, LEAD_NOTIFICATION_EMAIL qua env private. Thêm SPF/DKIM/DMARC qua quy trình DNS được duyệt, chốt selector, kiểm alignment và Authentication-Results trong mailbox thật. Không tự thêm DNS hoặc dùng email tưởng tượng làm email công ty.

Probe chỉ cho staging, QAVIO_SMTP_TEST_APPROVED=true và QAVIO_SMTP_TEST_TO là mailbox được duyệt, verify auth rồi gửi một thông báo tổng hợp. SMTP accepted không chứng minh inbox delivery. Sau đó kiểm confirmation/welcome/unsubscribe thực từ worker với chỉ QA mailbox, retry/backoff/failed queue và không gửi PENDING/UNSUBSCRIBED marketing. Không bật provider production hoặc chiến dịch từ test này.

Mở forms thật cần duyệt policy/đơn vị xử lý/kênh chính thức/người xử lý lead/quyền dữ liệu/backup/monitoring và xác nhận chủ dự án. SITE_INDEXING_ENABLED và legal publication/data-request flags là phê duyệt riêng. Không bật policy để test kỹ thuật; test loopback qavio_test có nhãn testing riêng.

## Proxy và monitoring

- Mẫu `deploy/nginx.release-candidate.conf.example` chỉ merge vào QAVIO virtual host sau review. Ghi đè cả X-Qavio-Client-IP và X-Qavio-Proxy-Secret; secret include 600, không Git/log. APP_ORIGIN phải đúng origin HTTPS duyệt.
- Nếu sau Cloudflare: chỉ trust real IP từ CIDR Cloudflare hiện hành đã kiểm tra và firewall origin phù hợp. Không tin CF headers từ mọi IP; nếu chưa xác minh, giữ bucket chung bảo thủ và admin/forms đóng. Cổng app chỉ loopback, DB chỉ network nội bộ.
- Nginx body limit 6m cho upload 5 MB + multipart overhead; app tự kiểm byte limit. Không mở CORS. Giữ nosniff/frame DENY/referrer/permissions headers và noindex; HSTS chỉ xem xét sau review toàn bộ HTTPS domain/subdomain, không bật includeSubDomains tự ý.
- Liveness `/api/health`: process sống, không hỏi DB. Readiness `/api/ready`: environment, schema C+D runtime privileges và media filesystem/free space, trả 200/503 chung, không lộ config. Cache/single-flight 5 giây để hạn chế tải probe. Readiness không cam kết SMTP hoặc worker sẵn sàng.
- Worker heartbeat private `worker.json`, cập nhật 15 giây, stale sau 90 giây; ERROR/STOPPED unhealthy. EMAIL_DISABLED có nghĩa process loop sống nhưng chưa gửi email, không phải provider đạt. `pnpm ops:status` chỉ chạy trong shell vận hành có quyền, không public API.
- Theo dõi failed/pending outbox, login failures giờ gần nhất, media bytes/count, disk available, backup freshness và DB readiness. CLI RSS là **tiến trình CLI**, không RAM app; đo app/container riêng.
- App logs chỉ signal cố định api_unavailable/upload_failure/rate_limited, không request body/header/token/PII. Proxy log dùng route group/status/duration, không query/URI khách hàng/cookie/credential. Cần collector + alert routing được duyệt để tính API error rate, upload failure rate và bất thường rate limiting; chưa cài collector hoặc gửi notification tự động.
- Ngưỡng đề xuất: readiness lỗi liên tiếp >2 phút, worker stale >90 giây, FAILED>0 tăng mới, disk <20% hoặc <1 GiB, backup >36h, error rate >1%/5 phút (chỉ đánh giá khi đủ lượng request), login failures tăng bất thường. Cần baseline/cảnh báo ít nhiễu và người trực chịu trách nhiệm.
- App lỗi: giữ forms/admin đóng, xem log redacted, kiểm env/storage/readiness, dùng image rollback đã duyệt. Worker lỗi: kiểm heartbeat/DB/provider, chỉ restart worker QAVIO sau xác nhận, tôn trọng lease và khả năng SMTP gửi lặp. DB lỗi: không reset/init lại volume; kiểm storage/connection/health và escalates DR.

## Release/rollback gate

Candidate SHA/tag/digest: **TBD sau duyệt commit**; branch làm việc hiện main có D/E chưa commit. Không push hoặc deploy từ working tree chưa định danh.

Trước release: staging checklist đạt, owner chốt candidate SHA/tag, snapshot image/config hiện tại không chứa secret trong báo cáo, backup DB+media đã restore thử/offsite, kiểm tài nguyên/proxy/TLS/env, migration list C1–C3 đã có + D `202610200004_admin_cms`. E không thêm migration schema. Kiểm source migration checksum, migrations status và role trên host sau khi được duyệt.

Migration production entrypoint hiện mặc định approval false. Cần QAVIO_PRODUCTION_MIGRATION_APPROVED=true, QAVIO_PREDEPLOY_BACKUP_VERIFIED=true và QAVIO_APPROVED_RELEASE_SHA 40 hex cho lần vận hành; các flag không tự chứng minh approval/backup mà là guard thực thi sau khi người chịu trách nhiệm đã xác minh. Không tự đánh dấu verified. Chạy migrate deploy bằng owner, runtime giữ qavio_app, revoke quyền trên _prisma_migrations. Nếu migration lỗi: dừng rollout, giữ worker/admin/forms đóng, xem migration logs đã lọc; kiểm `migrate status`, chỉ resolve theo trạng thái transaction và review cụ thể. Không blindly rerun/resolve hoặc sửa migration đã áp dụng.

Smoke trước/ sau cutover: health/readiness, HTTPS/assets/logo, 14 public routes/SEO/noindex/404, forms closed, auth cookie/CSRF/RBAC, draft private/public published, upload đọc lại, worker heartbeat/email disabled, database/migration status và ứng dụng khác không đổi. Dừng nếu target/version sai, thiếu backup, migration/health/permission lỗi, DB/media mismatch, host thiếu tài nguyên hoặc cần thay hệ thống khác ngoài phạm vi.

Rollback app: dùng image C đã xác nhận `qavio-web:570f8f7` và operations C tương ứng (hoặc image trước release được ghi manifest), cấu hình C private đã lưu, chỉ cập nhật service QAVIO liên quan. Giữ DB/media volume. Migration D là additive nhưng phải kiểm C client hoạt động với schema D trên staging; rollback code **không rollback schema hoặc dữ liệu CMS**. Nếu có ghi mới, restore backup có thể mất các ghi đó: phải thu thập/reconcile, duyệt RPO/cutover riêng. Không tự rollback database hay xóa D tables.

Người xác nhận release: chủ dự án hoặc người được chỉ định rõ. Hiện chưa có xác nhận phát hành D/E; trạng thái **NO-GO** đến khi đóng các blocker trong PHASE_E.md.
