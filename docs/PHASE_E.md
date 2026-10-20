# Giai đoạn E — nghiệm thu local và chuẩn bị production

Ngày: 20/10/2026, giờ làm việc Asia/Bangkok. Repository `D:\anh\qavio`.

**Cập nhật sau ủy quyền: D/E source c205bbd đã deploy ngày 20/10/2026. GO cho website đang đóng tiếp nhận; admin/CMS/forms/email/indexing vẫn tắt.** Linux rehearsal, backup/restore cô lập và production health/readiness đã được kiểm chứng. Xem [PHASE_DE_DEPLOYMENT.md](PHASE_DE_DEPLOYMENT.md) cho bằng chứng, giới hạn dung lượng và một lần worker Restaurant tự restart chưa rõ nguyên nhân. SMTP thật và các mục vận hành còn thiếu không được coi là PASS.

Các mục 1–17 bên dưới là **biên bản local trước khi chủ dự án cho phép SSH/push/deploy**, giữ lại để đối chiếu; các câu “chưa deploy/chưa xác minh VPS” mô tả thời điểm nghiệm thu local, không phải trạng thái phát hành mới nhất. Runbook: [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md).

## 1. Git và deployment

- Git root đúng QAVIO, branch main, HEAD `aa77a5320e166d4638dac4846ec67f73ca86f508`, origin `https://github.com/herry-huynhlong/qavio.git`.
- Working tree có D và E chưa commit; không reset/ghi đè thay đổi D. Chưa commit/push/tag hoặc deploy. SHA ứng viên D/E **chưa có**, cần được duyệt commit và định danh sau nghiệm thu; HEAD hiện tại không đại diện cho D/E.
- Đã đọc báo cáo A–D, architecture/README/env/schema/migrations/Docker/Compose, migration/deployment/worker/admin code. Quy định E mới ưu tiên hơn ủy quyền deploy C trước đây, ghi lại trong AGENTS.md.
- Theo PHASE_C_DEPLOYMENT.md: production ứng dụng C source `570f8f729ffbb0d7671c8c48ccfbfbf81ac0bfb5`, images `qavio-web:570f8f7`, `qavio-operations:570f8f7`, database qavio_prod riêng, ba migration C. Đây là **bằng chứng phát hành trước**, chưa phải xác minh lại image/container qua SSH ở E.
- E chỉ GET HTTPS công khai: health trả 200 `{status:ok,service:qavio}`; forms status enabled=false, emailConfigured=false, testing=false. Không gửi dữ liệu khách hàng hoặc stress test production. Không SSH khi chưa có xác nhận mới; exact image/tag/digest, RAM/CPU/disk, proxy/ports/roles hiện tại trên VPS còn chờ xác minh.
- Không sửa Restaurant/QuánPilot, không kết nối DB/payment sản phẩm, không đổi DNS/domain hoặc container nào trên VPS.

## 2. Docker/Linux — đã chuẩn bị, chưa runtime PASS

Local có Docker CLI 29.5.3 nhưng Docker Desktop Linux Engine không chạy; WSL chỉ có docker-desktop đang stopped. Không khởi động engine chung để tránh tự khởi động dịch vụ ngoài phạm vi. Không có môi trường Linux được duyệt để chạy image trong lượt này.

- Dockerfile runner vẫn Next standalone, non-root node UID1000, OpenSSL/CA, liveness, shutdown signal trực tiếp tới Node qua init. Entrypoint mới kiểm environment trước import server.
- Operations target chuyển sang PostgreSQL16 bookworm, lấy Node/pnpm từ builder, có pg_dump/pg_restore16 thay vì dựa vào client15 của Debian mặc định. **Code image này chưa được build/run trên Linux**; ABI/native/system libraries cần smoke thật.
- Sharp DLL Windows tracing đã có từ D; E kiểm thử sharp/Prisma/standalone thật trên Windows, không suy diễn thành Linux libvips/OpenSSL PASS.
- Image build loại .env*, .runtime, private keys, archives, backups và thư mục secrets qua .dockerignore; runtime env/volume tách khỏi image. Local standalone kiểm tra không chứa env credential/runtime directory.
- `compose.staging.yaml`: project qavio-staging, network/DB/volume riêng, app loopback3102, DB không publish, web/worker/database tách biệt, log rotation, healthcheck/grace period. `compose.release-candidate.yaml`: private media/ops volumes, tắt admin/CMS/forms/policy/indexing/provider theo mặc định; cấu hình chờ duyệt, chưa áp dụng.
- Compose CLI validation `config --no-env-resolution --quiet`: PASS cho staging (syntax origin https://localhost chỉ để nội suy local) và base+production+candidate. Không có secret thật, không resolve env production. **Không coi kiểm tra cú pháp này là Docker runtime.**
- `scripts/check-linux-runtime.mjs` chuẩn bị kiểm UID/OpenSSL/CA/pgtools16/Prisma/role/sharp/volume/health/readiness trong image staging; chưa chạy. Full admin/CMS/upload/restart/restore sau smoke vẫn cần thực hiện theo runbook.

## 3. Migration readiness

Không sửa bốn migration đã có, không thêm migration schema E. Migration D `202610200004_admin_cms` bổ sung tables/enums/columns/index/FK, giữ schema C; không destructive reset/drop/truncate.

Kiểm thử E tạo database loopback có tên prefix `qavio_e_migration_<run>`, áp dụng C1–C3 thật, tạo dữ liệu tổng hợp C, baseline lịch sử C bằng Prisma resolve trên **sandbox mới**, sau đó dùng `prisma migrate deploy` áp dụng D. Đối chiếu nguyên message/email/timestamps/consent/confirmed status/outbox failed và default version: PASS. Đây không phải bản sao dữ liệu production hoặc staging Linux.

Tạo role QA runtime NOSUPERUSER/NOCREATEDB/NOCREATEROLE trên sandbox: CRUD C/D hoạt động, không CREATE schema/table, không INSERT `_prisma_migrations` sau revoke: PASS. Role/tên database có suffix QA, credential ngẫu nhiên không in log; không thay role production.

Production migration entrypoint và Compose giờ mặc định không phê duyệt: cần fresh approval flag, verified-backup flag và SHA release 40 hex khi vận hành được phép. Các flag là guard sau khi người có trách nhiệm đã xác minh, không tự chứng minh approval. Fail migration phải dừng rollout, kiểm status/transaction và review trước resolve; không tự rerun/reset/rollback DDL. Compatibility C client với D sau app rollback vẫn cần rehearsal image C trên Linux.

## 4. Backup/restore — có kiểm chứng PostgreSQL local

`scripts/ops-backup.mjs` tạo archive DB custom dump + media tham chiếu, SHA-256 từng file, AES256-GCM và RSA-OAEP-SHA256 bọc khóa ngẫu nhiên. Kiểm thử dùng RSA3072. Mật khẩu PG qua environment của child process, không qua URL argv/log. Temp directory private do script tự tạo; kiểm boundary trước dọn. Archive output mới có flag exclusive, không ghi đè backup cũ.

**Đã chạy**: backup dữ liệu tổng hợp, không thấy chuỗi QA plaintext trong archive; sửa ciphertext bị GCM từ chối trước restore; restore DB trống khác có prefix `qavio_e_restore_<run>`; kiểm schema/bốn migration, Lead, Subscriber, Consent, Admin, CMS/revision, Audit, Outbox và hash media đúng; từ chối target nonempty, production, Restaurant hoặc remote. Không restore thử production.

Tool yêu cầu quiesced backup: người vận hành phải thực sự đóng ghi/dừng worker QAVIO theo maintenance được duyệt. Chưa triển khai online exported snapshot hoặc scheduler tự dừng website. Private key vận hành/offsite destination chưa có; khóa trong `.runtime/e-infrastructure` là QA, không được dùng production. Windows mode flags không thay kiểm ACL Linux.

Đề xuất lịch 02:00 Asia/Bangkok hằng ngày trong maintenance và trước mỗi deploy; cần duyệt RPO/RTO/retention/offsite/người giữ key. Không cài timer, không tự xóa backup. Marker backup freshness chỉ ghi sau hoàn tất archive, không thay bằng chứng restore/offsite. Backup production/offsite và restore Linux: **chưa thực hiện**.

Sandbox QA và archive/key QA giữ ở namespace riêng trong `.runtime` cho đối chiếu, không mount vào app hoặc đưa Git/image; không drop database để dọn. Không có dữ liệu khách hàng thật trong các sandbox này.

## 5. Media storage

- Runner/operations chuẩn bị `/var/lib/qavio/media` và `/var/lib/qavio/ops`, owner node, persistent volumes riêng ở candidate/staging. Không public folder/build temp/Nginx alias.
- Kiểm soát quota theo tổng byte DB (mặc định 1 GiB) dưới transaction lock quản trị; file mới bị dọn nếu DB/quota lỗi. Kiểm disk available tối thiểu64MiB trước ghi, file600/thư mục700, filename UUID, re-encode WebP và bỏ metadata như D.
- Đã thử actual HTTP upload PNG1024×768, draft private, lưu hash, dừng và chạy lại chính standalone process: session còn hạn và ảnh vẫn đọc cùng hash; anonymous tiếp tục không được xem. PASS **process restart Windows**, chưa container recreation/volume remount Linux.
- HTTP SVG giả MIME trả422, >5MiB trả413, quota đầy giả lập trên fixture riêng trả507 và không có MediaAsset mới; hoàn trả fixture byteSize sau test. Không giả lập hết đĩa bằng cách ghi đầy ổ thật.
- Filesystem hard quota, orphan accounting và offsite media backup cần quy trình vận hành; DB quota không hạn chế các file người vận hành tự chép ngoài app.

## 6. Admin readiness và bootstrap

Giữ auth/RBAC D, scrypt bounded concurrency, CSRF/origin/session fixation protection, expiry/revoke/last SUPER audit. Integration D chạy lại31 nhóm. Secure/HttpOnly/Strict production cookie có kiểm tra code/header; authenticated HTTPS browser thực tế và proxy production vẫn chờ staging.

CLI `pnpm admin:bootstrap --production` đã chuẩn bị: approval per invocation, chính xác tier/host qavio-postgres/database qavio_prod/runtime role qavio_app, xác nhận target qua TTY hoặc stdin fields; password nhập ẩn/stdin không argv/log, khóa first-user trong transaction, audit. Test local bootstrap/duplicate/production rejection đạt; **không tạo admin production**, không mở admin production, chưa thử positive production bootstrap end-to-end.

Runbook có recovery qua SUPER_ADMIN thứ hai hoặc thủ tục offline được duyệt; không bỏ count guard, không password mặc định/plaintext, chưa có CLI recovery được duyệt. MFA chưa triển khai; đề xuất WebAuthn/passkey hoặc TOTP với recovery process riêng, không tuyên bố đã hỗ trợ.

## 7. SMTP và public forms

Chủ dự án đã trả lời **chưa có provider/test mailbox**. EMAIL_PROVIDER=disabled; `pnpm test:smtp` trả NOT_RUN/exit2, không gửi thư hoặc tạo thông tin công ty giả.

Chuẩn bị probe staging chỉ khi provider, EMAIL_FROM/test mailbox/selector được duyệt, SMTP auth + TLS/STARTTLS, DNS TXT SPF/DKIM/DMARC và một thư tổng hợp. SMTP accepted không chứng minh inbox delivery/DMARC alignment. Chưa xác minh DNS email, provider, inbox, confirmation/unsubscribe thật. Adapter in-process C kiểm consent/retry/lease/marketing exclusion tiếp tục đạt, không thay provider thật.

Forms production giữ đóng; policy/indexing không bật. Mở thật cần duyệt pháp lý, đơn vị xử lý, email/hotline/kênh chính thức, quy trình quyền dữ liệu, người nhận lead, backup/monitoring và xác nhận chủ dự án.

## 8. Proxy/security và SEO

Chuẩn bị QAVIO-only TLS proxy location: overwrite hai trusted headers, secret include600 ngoài Git, upstream loopback, limit6m, timeout, no cache/CORS bổ sung. Mẫu redacted access log chỉ nhóm route/status/duration, không query/URI khách hàng/cookie/password/token. Không cài/reload Nginx trong E.

Cloudflare real-IP CIDRs/origin firewall/secret/APP_ORIGIN trên VPS chưa kiểm chứng lại; không tin header từ client. C regression có kiểm spoofed forwarding headers và rate limit đồng thời. Chưa khẳng định per-IP sau proxy production đúng chỉ từ việc có code đọc header.

Public test14 trang/371 liên kết đạt canonical/OG/JSON-LD/sitemap/404/logo. Draft/public publishing/unpublishing/preview/admin guard kiểm HTTP. Giữ SITE_INDEXING_ENABLED=false; legal là draft/noindex, không công bố thông tin doanh nghiệp chưa xác nhận. Favicon chính thức vẫn thiếu: endpoint rỗng204 động giữ generic browser icon, không chế logo mới hoặc nhét ảnh thương hiệu lớn vào icon nhỏ.

## 9. Performance và accessibility

Đo trên Windows local production standalone, dữ liệu tổng hợp24 lead, concurrency4; không stress production hoặc suy diễn thành năng lực VPS. Tập mẫu nhỏ, p95 là mô tả phép đo này, không SLO.

| Tác vụ | Mẫu | p50 | p95/max |
|---|---:|---:|---:|
| Login scrypt đồng thời |4|1061 ms|1396 ms|
| Lead page |3|26 ms|62 ms|
| Dashboard |3|38 ms|77 ms|
| Public home HTML |3|30 ms|66 ms|
| Upload ảnh2048×1536 |3|196 ms|236 ms|

Login tương ứng khoảng1,06/1,40giây. Có các kiểm tra/profiling khác cùng máy, không phải benchmark máy chủ sạch. Tiến trình web local đo working set153.600.000 byte, peak277.012.480 byte (~264MiB), CPU tích lũy9,40625s ở thời điểm chụp. Đây không phải RAM/CPU VPS hoặc cgroup Linux. Candidate đề xuất512MiB cần review host budget; chưa được phép nâng trên VPS.

Lighthouse13.5.0 Chrome headless local: đợt đầu mobile performance92/accessibility97; sau sửa contrast accessibility100 ở home mobile và admin login desktop. Các đợt đo có biến thiên hiệu năng mobile, không chọn điểm cao nhất làm cam kết. Lần chốt không chạy cùng tải kiểm thử: home mobile performance96/accessibility100/best practices100/SEO69, FCP1,1s/LCP2,4s/TBT70ms/CLS0; admin login desktop100/100/100/SEO63, FCP0,3s/LCP0,5s/TBT0/CLS0; không console error. Artifact JSON `.runtime/e-lighthouse-mobile-verified.json` và `.runtime/e-lighthouse-admin-desktop-verified.json`. Các lượt mobile trước đó92 rồi81 cho thấy biến thiên môi trường; không coi96 là SLO. SEO bị giảm do chủ động noindex; không gỡ indexing để đạt điểm. Không tự coi Lighthouse100 là WCAG audit.

Đã kiểm browser desktop1280/tablet820/mobile390 ở admin leads và contact: một H1, không field thiếu label, document không tràn ngang, bảng scroll riêng. Kiểm menu/điều hướng, rich text/dialog mobile, contact empty-submit báo6 trường lỗi; không gửi dữ liệu thật. Console không hydration warning/error trong luồng đã kiểm tra. Màu chữ nền sáng/dark card/login được chỉnh theo lỗi contrast Lighthouse thực tế.

## 10. Monitoring/phục hồi

- Liveness process `/api/health` khác `/api/ready` environment/DB/schema/storage, generic200/503, no-store; cache/single-flight5s. Không lộ connection/credentials.
- Worker heartbeat private15s, stale90s; ERROR/STOPPED unhealthy, EMAIL_DISABLED chỉ xác nhận loop còn sống. SIGINT/SIGTERM ngừng nhận batch/claim mới, chờ in-flight, ghi STOPPED/disconnect. Container grace90s và direct Node command (không qua script shell/pnpm) đã chuẩn bị; Linux signal/drain chưa thử. Windows exec stop là hard-stop, không coi đó là bằng chứng graceful SIGTERM Linux; heartbeat thực chuyển stale sau thời hạn.
- Ops CLI đọc outbox failed/pending, login failures giờ gần nhất, media byte/count, disk, backup age, heartbeat và DB. Không public endpoint chứa thống kê nội bộ. CLI RSS được ghi nhãn riêng.
- Logs an toàn cho API error/upload failure/rate-limit; alert collector/routing, dashboard, lịch backup/offsite chưa triển khai. Runbook có ngưỡng đề xuất và hướng dẫn sự cố app/worker/DB; người trực/cảnh báo cần được chốt.
- Test heartbeat stale/STOPPED, backup freshness và không có PII trong status đã thực hiện. Đã thử dừng PostgreSQL portable QAVIO: liveness200/readiness503; khởi động lại: cả hai200 sau cache5s. Worker stop gate không claim/gửi/thay đổi mail PENDING khi nhận cờ dừng đã PASS; không giả định liveness200 nghĩa database/email đạt.

## 11. Kết quả kiểm thử và phạm vi bằng chứng

| Kiểm tra | Kết quả/phạm vi |
|---|---|
| pnpm lint/typecheck/build | PASS lần cuối; source build có readiness, quota và worker stop gate |
| C integration |29 nhóm PASS PostgreSQL qavio_test, không email thật |
| D integration |31 nhóm PASS PostgreSQL qavio_test |
| CLI bootstrap local/negative prod guard |PASS, không credential echo/default |
| E infrastructure |12 nhóm PASS: migration/backup/restore/role/environment/heartbeat/stop gate thực local PostgreSQL |
| Admin HTTP |10 nhóm PASS trên compiled standalone |
| Public HTTP |PASS privacy/GET mutation/newsletter flows; public14pages/371links PASS |
| Upload/quota/process restart |PASS Windows actual HTTP như mục5; không Docker restart |
| Compose syntax |PASS, không env thật, không runtime Docker |
| SMTP |NOT_RUN theo xác nhận chưa có provider |
| Docker/Linux/staging HTTPS |NOT_RUN, cần môi trường và quyết định riêng |
| Production migrate/bootstrap/deploy |NOT_RUN theo giới hạn bắt buộc |

Không dùng production cho integration; database QA tách khỏi qavio_dev/qavio_test theo guard loopback riêng cho restore/migration sandbox. Không tự xóa khách hàng thật hoặc reset database.

## 12. Staging verification

Đã chuẩn bị Compose, environment template, migration/bootstrap guards, native smoke và checklist12 bước trong runbook. Windows loopback + C synthetic migration/restore là bằng chứng local tương đương một phần, **không** kết luận staging Linux đã đạt. Staging domain/HTTPS/host/tài nguyên chưa xác nhận; không dùng chung VPS khi chưa kiểm tra tài nguyên và được duyệt. Không copy production PII làm test.

## 13. Release/rollback plan

- Candidate SHA/branch/tag/digests: TBD sau duyệt commit; hiện main dirty D/E, không release từ HEAD C.
- Migrations cần production: xác minh C1–C3 đã có rồi D4; backup mã hóa DB+media trước deploy, restore drill/offsite/role/temp space được chứng minh. Không default chấp nhận migration D trên production.
- Env/media/ops volumes/health/smoke/cookie/proxy/resource gate và stop conditions có trong runbook. Forms/admin/indexing giữ đóng theo từng phê duyệt, không tự bật sau health200.
- Rollback app bằng image/config C hoặc image trước release được xác nhận, chỉ service QAVIO, giữ volume. Additive schema không được tự xóa khi rollback code. SMTP at-least-once có cửa sổ trùng gửi, không hứa exactly-once.
- Khôi phục DB phải xét các ghi mới/RPO, backup trạng thái hiện tại, restore/cross-check ở DB khác rồi duyệt cutover. Không rollback DB tự động. Bootstrap/recovery nằm trong thủ tục riêng có người xác nhận.
- Người duyệt release: chủ dự án/người được chỉ định. E không thực hiện release.

## 14. Chưa kiểm chứng và thông tin cần cung cấp

1. Quyền SSH read-only mới cho E để chốt exact images/digests/resources/ports/proxy/role state; không cần gửi lại password trong báo cáo.
2. Linux/staging host được phép, domain/HTTPS/certificate và resource budget; có thể dùng máy riêng thay VPS chung.
3. Provider, approved test mailbox, EMAIL_FROM/người nhận lead, DKIM selector và quyền thay DNS qua quy trình riêng.
4. Private/public backup keys vận hành, offsite destination, retention/RPO/RTO, maintenance window, người giữ key và người trực alerts.
5. Thông tin doanh nghiệp/kênh liên hệ chính thức, chính sách và quy trình quyền dữ liệu; nội dung nào được duyệt xuất bản.
6. Chủ sở hữu tài khoản SUPER_ADMIN, cách giao credential an toàn và quyết định MFA/recovery.
7. Xác nhận commit/release SHA/tag và cuối cùng xác nhận phát hành riêng sau staging. Không xin duyệt deploy khi còn chưa đủ bằng chứng.

## 15. GO/NO-GO

| Gate | Trạng thái |
|---|---|
| Local lint/types/build/C/D/HTTP |PASS local |
| Migration D trên C tổng hợp, role tối thiểu |PASS local, Linux/prod state pending |
| Encrypted backup/restore đủ dữ liệu + media |PASS local; production/offsite/Linux pending |
| Media upload/process restart/privacy/quota |PASS local; container persistence/permissions pending |
| Docker/Linux native/entrypoint/worker runtime |NO-GO: chưa chạy |
| Staging HTTPS/proxy/cookies thực và image C rollback |NO-GO: chưa chạy |
| VPS capacity/network/trust boundary/current version |NO-GO: chưa xác minh lại qua SSH |
| Backup schedule/retention/offsite/alerts/operator |Chờ duyệt/cấu hình |
| SMTP/inbox/DNS nếu mở tiếp nhận/email |NO-GO: chưa provider; giữ disabled |
| Admin thật/forms/policy/indexing |Chưa được phép mở |
| Source commit/tag/SHA và release approval |NO-GO: chưa được duyệt |

## 16. File và cấu hình chính

Dockerfile; compose.staging.yaml; compose.release-candidate.yaml; production migration approval mặc định false; deploy/runtime-environment.mjs, start-production.mjs, init-staging-db.sh, nginx.release-candidate.conf.example; .env templates/git/docker ignores; src/server/operations.ts, media quota, HTTP signals, worker stop gate; scripts ops backup/status/SMTP/Linux/native/infrastructure/performance/upload/persistence; readiness route; contrast CSS/generic favicon endpoint; README/architecture/AGENTS và runbook/báo cáo. Không thay logo gốc hoặc repository Restaurant.

## 17. Nghiệm thu cuối

- Lần chốt: lint/typecheck/production build PASS; C29, D31, E12 nhóm PostgreSQL PASS; bootstrap local/negative production guard PASS; admin HTTP10 và public HTTP PASS; public14pages/371links PASS. Upload/persistence/quota và database outage/recovery PASS đúng phạm vi local nêu trên.
- Lighthouse cuối: mobile96/100/100, admin desktop100/100/100 (performance/accessibility/best practices); SEO69/63 do noindex có chủ đích, không lỗi console. Contrast đã được sửa theo phép đo.
- Compose syntax cho staging/candidate PASS, Docker Engine vẫn chưa chạy; native/Linux/real TLS/SMTP/VPS không tự chuyển PASS.
- Quét180 file text tracked/untracked không thấy các secret local đã biết; standalone không có .runtime/.secrets/.env/.env.local/.env.production. Đây là kiểm tra giới hạn theo giá trị local, không thay security audit toàn diện.
- QA admin/lead/subscriber/media của HTTP/browser được dọn theo fixture IDs, không reset DB. Sandbox migration/restore tổng hợp có namespace riêng giữ lại để đối chiếu, không app nào sử dụng. Không tạo admin thật/mặc định.
- Git HEAD giữ aa77a53, chưa commit/push/deploy hoặc SSH. Runbook và mẫu cấu hình chỉ ở local. **NO-GO production** cho đến khi các gate còn thiếu được xác nhận/kiểm chứng.
- Đã dừng worker/HTTP kiểm thử và PostgreSQL portable do lần E khởi động; heartbeat hard-stop được phát hiện stale (age113s/healthy=false). Graceful SIGTERM Linux vẫn chưa được kiểm chứng. Khởi động lại PostgreSQL QAVIO theo PHASE_C.md trước khi chạy local tiếp.
