# Giai đoạn C — backend và tiếp nhận khách hàng

> Cập nhật sau báo cáo local: chủ dự án đã yêu cầu đưa C lên web ngày 20/10/2026. Nội dung dưới đây ghi nhận nghiệm thu local tại thời điểm chưa commit/deploy; trạng thái phát hành được ghi riêng trong `PHASE_C_DEPLOYMENT.md`. Tiếp nhận khách hàng thật và email vẫn đóng.

Ngày kiểm tra: 20/10/2026. Phạm vi C1–C5 tại `D:\anh\qavio`.

**Chưa commit, push, đổi remote hoặc deploy production.** Website production vẫn là bản A/B. Chỉ sử dụng dữ liệu giả để kiểm thử C; `SITE_INDEXING_ENABLED=false`. Chưa bắt đầu Giai đoạn D.

## 1. Kiến trúc backend

Next.js Route Handlers → kiểm tra môi trường/origin/body/rate limit → Zod → service lead/newsletter → Prisma transaction → PostgreSQL riêng. Email được tạo trong outbox cùng transaction; worker gửi độc lập. Backend không phụ thuộc database, authentication, subscription hoặc payment của Restaurant/QuánPilot.

Các module nằm trong `src/server/`: `db-safety`, `db`, `http`, `repository`, `idempotency`, `rate-limit`, `lead-service`, `newsletter-service`, `email`, `outbox-worker`. Schema validation dùng chung ở `src/lib/submission-schema.ts`. Prisma client được tạo khi truy cập database, không kết nối database khi build trang tĩnh.

## 2. API

| Method | Route | Hành vi thực tế |
| --- | --- | --- |
| POST | `/api/contact` | CONTACT hoặc PRODUCT_INQUIRY; lưu lead, consent, activity và outbox theo cấu hình |
| POST | `/api/demo-requests` | DEMO, sản phẩm QuánPilot |
| POST | `/api/quote-requests` | QUOTE, gói BASIC/PRO/UNDECIDED, thời hạn tùy chọn 3/6/12 tháng |
| POST | `/api/newsletter/subscribe` | Tiếp nhận mong muốn nhận tin, phản hồi chung cho mọi trạng thái email |
| POST | `/api/newsletter/resend` | Dùng cùng service subscribe; có cooldown và rate limit |
| POST | `/api/newsletter/confirm` | Nhận token qua JSON, xác nhận một lần |
| POST | `/api/newsletter/unsubscribe` | Nhận token qua JSON, hủy nhận tin không cần đăng nhập |
| GET | `/api/forms/status` | Trạng thái mở form, cấu hình email và môi trường thử nghiệm; không trả PII |
| GET | `/api/health` | Liveness có sẵn; không đồng nghĩa database/email đã sẵn sàng |

Không có public API listing, detail, export, sửa trạng thái lead hoặc subscriber. GET trên các API thay đổi dữ liệu trả 405. Đường dẫn listing không tồn tại trả 404.

POST yêu cầu `Origin` đúng `APP_ORIGIN`, JSON, `Sec-Fetch-Site` phù hợp nếu có; không mở CORS. Lead/subscribe/resend yêu cầu header `Idempotency-Key` là UUID. Không dùng session/cookie cho các thao tác này. Token được gửi trong body của POST, không qua query URL.

Các lỗi có mã an toàn: 400 request/token/key không hợp lệ, 403 origin, 409 key khác payload, 410 token hết hạn/đã dùng, 413 body quá lớn, 415 không phải JSON, 422 validation/chống bot, 429 kèm `Retry-After`, 503 đóng tiếp nhận hoặc dịch vụ lỗi. Response không trả lead ID hay bản ghi khách hàng.

## 3. Prisma models

- `Lead`: nguồn thống nhất CONTACT/DEMO/QUOTE/PRODUCT_INQUIRY; UUID, liên hệ, trường theo loại yêu cầu, trạng thái NEW, thời điểm và phiên bản consent. Email/phone không unique toàn cục. `location` nullable dành cho nhu cầu tương lai; form hiện không thu thập.
- `LeadActivity`: lịch sử CREATED hiện tại; có `actorId` nullable và `note` để admin D sử dụng sau.
- `IdempotencyRecord`: scope, HMAC key/fingerprint, response an toàn, hạn 24 giờ.
- `NewsletterSubscriber`: email chuẩn hóa unique, PENDING/CONFIRMED/UNSUBSCRIBED, version chống token và email cũ.
- `NewsletterConsentEvent`: loại đồng ý, phiên bản chính sách, nguồn và thời gian.
- `NewsletterToken`: tokenHash, purpose, version, hạn và thời điểm sử dụng; không lưu token thô.
- `EmailOutbox`: recipient, payload tối thiểu, trạng thái, attempts/backoff, lease/claim UUID, sentAt, lỗi đã làm sạch; tham chiếu lead/subscriber.
- `RateLimitBucket`: khóa HMAC và cửa sổ thời gian, không lưu IP thô/user agent.

Trạng thái lead chuẩn bị sẵn NEW/CONTACTED/QUALIFIED/CONVERTED/CLOSED/SPAM. Không có API public để gán các trạng thái này. Enum MARKETING chỉ phục vụ điều kiện chặn gửi và khả năng mở rộng; chưa có công cụ hoặc API tạo chiến dịch.

## 4. Database và migrations

Đã khởi tạo PostgreSQL **16.15** độc lập tại local, bind `127.0.0.1:55432`, với `qavio_dev` và `qavio_test`. Không sử dụng PostgreSQL hay database của Restaurant. Docker Engine hiện không chạy, nên integration tests dùng PostgreSQL portable thật, không dùng mock Prisma.

Binaries lấy từ [EDB PostgreSQL binaries](https://www.enterprisedb.com/download-postgresql-binaries), lưu cùng cluster trong `.runtime/` được Git và Docker ignore. Credential local được sinh ngẫu nhiên, chỉ nằm trong file local bị ignore; không ghi trong báo cáo.

Ba migrations đã áp dụng thành công cho cả dev và test:

1. `202610200001_initial`: enums, bảng, indexes và foreign keys.
2. `202610200002_timezone_safe`: các mốc thời gian dùng `timestamptz(3)`, tránh sai retry/TTL khi database và Node có múi giờ khác nhau. Migration diễn giải các timestamp cũ theo UTC; đây là schema C chưa có dữ liệu khách hàng production.
3. `202610200003_data_constraints`: email subscriber phải lowercase/trim, giới hạn branch/term, version và counter hợp lệ.

`scripts/database.mjs dev|test` chỉ cho phép database chính xác `qavio_dev`/`qavio_test` trên loopback hoặc hostname service development. Runtime cũng kiểm tra tên DB theo environment. Các target Restaurant, staging, production và host test ngoài allowlist đều bị chặn bởi script. Không có `migrate reset`, drop hoặc truncate trong quy trình kiểm thử.

### Khởi động local hiện có

```powershell
cd D:\anh\qavio
# Khi cluster portable đã dừng:
& .\.runtime\postgresql\pgsql\bin\pg_ctl.exe -D .runtime\pgdata -l .runtime\postgres.log -o '-p 55432 -h 127.0.0.1' start
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:migrate:test
pnpm dev
```

### Lựa chọn Docker development trên máy khác

Copy `.env.example` thành `.env.local`, thay credential và secret bằng giá trị riêng. Khi Docker Engine đã chạy, dùng Compose riêng, không dùng chung volume/container với Restaurant:

```powershell
docker compose --env-file .env.local -f compose.development.yaml up -d qavio-postgres
docker compose --env-file .env.local -f compose.development.yaml exec qavio-postgres createdb -U qavio_local qavio_test
pnpm db:migrate
pnpm db:migrate:test
```

Chỉ chạy `createdb` khi `qavio_test` chưa tồn tại. PostgreSQL portable và Docker development dùng cùng cổng 55432, vì vậy chỉ bật một lựa chọn. Compose development có project `qavio-development`, volume riêng, port loopback. Đã kiểm tra cú pháp Compose; chưa chạy container do Docker Engine tắt. Production sau này cần role tối thiểu quyền, backup/restore và quy trình migration được duyệt riêng.

## 5. Luồng lead

Client RHF/Zod → POST → validate Zod tại server, kiểm tra consent và anti-spam → chuẩn hóa email/phone → advisory lock idempotency → transaction tạo Lead + CREATED activity + outbox nếu bật → xác nhận đã ghi nhận.

Contact không tự đăng ký newsletter. Demo không tạo tài khoản hoặc lịch hẹn QuánPilot. Báo giá không tính giá, tạo đơn mua hoặc thanh toán. Email gửi lỗi không làm mất yêu cầu đã được database tiếp nhận.

## 6. Luồng newsletter

Đăng ký có consent riêng → email lowercase unique → PENDING → consent event + token CONFIRM hạn 24 giờ + outbox. Với token còn mới trong 5 phút, resend không nhân thêm token/email. Subscriber CONFIRMED nhận cùng response chung; không tiết lộ trạng thái qua response.

Token là HMAC-SHA256 từ UUID ngẫu nhiên và secret riêng. Database chỉ giữ SHA256 của token; outbox chỉ chứa token ID/version. Worker tái tạo token lúc gửi. Các process phải dùng cùng secret; đổi secret làm mất hiệu lực token cũ và cần quy trình cấp lại, không tự quay vòng tùy tiện.

Link email dùng fragment `#token=...`, không gửi token trong URL request đến server. Trang `/newsletter/confirm` và `/newsletter/unsubscribe` đọc fragment vào ref rồi xóa khỏi thanh địa chỉ; không có analytics và không tự đổi trạng thái khi GET. Người dùng bấm nút để POST. Token kiểm tra purpose/version/expiry/usedAt, khóa subscriber khi đổi trạng thái; concurrent confirm chỉ thành công một lần.

Xác nhận → CONFIRMED + consent event + transactional welcome có link hủy. Hủy → UNSUBSCRIBED, tăng version, consent event, vô hiệu hóa email/token cũ. Chủ động đăng ký lại cần consent mới và quay về PENDING, sau đó xác nhận mới. Token hủy có hạn 365 ngày; link hết hạn cần quy trình hỗ trợ dữ liệu ở D, chưa có public cấp token hủy dựa vào email.

Không có chiến dịch marketing trong C. Worker kiểm tra CONFIRMED, recipient, version và token hủy hợp lệ trước loại email marketing; PENDING/UNSUBSCRIBED bị chặn.

## 7. Email và outbox

Adapter SMTP tổng quát qua Nodemailer; chưa chọn nhà cung cấp và **chưa gửi/kiểm tra email thật**. SMTP dùng TLS trực tiếp khi `SMTP_SECURE=true`, còn lại yêu cầu STARTTLS; không tắt xác minh certificate. Không log lỗi provider thô, nội dung, token hoặc credential.

```powershell
pnpm email:worker
pnpm email:worker --loop
```

Khi provider chưa cấu hình: worker trả `EMAIL_NOT_CONFIGURED`, không đánh SENT, không tự xác nhận newsletter. Lead vẫn được ghi nhận; UI không tuyên bố email đã gửi.

Worker claim bằng `FOR UPDATE SKIP LOCKED`, lưu lease 120 giây và claim UUID. Mỗi lần gửi khóa outbox và subscriber để kiểm tra trạng thái/version; hủy đăng ký và gửi marketing được tuần tự hóa. Lease hết hạn được phục hồi. Backoff tăng từ 30 giây, tối đa 1 giờ; tối đa 5 attempts rồi FAILED. Email không còn đủ điều kiện chuyển CANCELLED.

Đây là cơ chế **at least once với số lần thử hữu hạn**, không cam kết SMTP exactly once: crash sau khi SMTP nhận nhưng trước khi ghi SENT vẫn có thể gây gửi lặp. Message-ID ổn định theo outbox giúp đối chiếu nhưng không đảm bảo provider dedupe. Test adapter chỉ được phép khi environment=test và target đúng `qavio_test`; không có endpoint public bật adapter.

## 8. Rate limiting và chống spam

- PostgreSQL atomic upsert, có hiệu lực giữa nhiều process; kiểm thử cạnh tranh thật.
- Mỗi IP: envelope 100 request/phút, tính cả request lỗi/replay; token confirm/unsubscribe thêm 40/phút.
- Request logic mới: 30/15 phút theo scope/IP và 5/15 phút theo scope/email. Idempotent replay không tăng quota tạo lead mới, vẫn chịu envelope.
- Không tin X-Forwarded-For/CF headers. Chỉ nhận `X-Qavio-Client-IP` hợp lệ khi `X-Qavio-Proxy-Secret` khớp secret tối thiểu 32 ký tự. Thiếu proxy tin cậy dùng bucket chung bảo thủ; chưa cấu hình trusted proxy trên production trong C.
- Reverse proxy sau này phải **ghi đè cả hai header**, giữ secret ngoài Git/log và chặn truy cập trực tiếp backend; không nối thêm header client vào chuỗi tin cậy. APP_ORIGIN phải khớp origin công khai.
- Body tối đa 16 KiB theo số byte thực tế, strict schemas, giới hạn từng trường, honeypot không focus/không trong accessibility tree; thời gian form hợp lệ 1,2 giây đến 2 giờ.

Không phải hệ thống chống DDoS; chưa kiểm thử tải lớn hoặc nhiều máy vật lý. IP/user agent không lưu vào lead; HMAC rate keys có hạn. Maintenance local có thể chạy định kỳ để xóa key/bucket hết hạn:

```powershell
pnpm exec tsx scripts/maintenance.ts dev
pnpm exec tsx scripts/maintenance.ts test
```

Maintenance chỉ xóa bản ghi kỹ thuật đã hết hạn, không xóa lead/subscriber/consent. Quy định retention dữ liệu khách hàng, backup và logs hạ tầng vẫn chờ chủ dự án.

## 9. Idempotency

UUID do client giữ trong ref cho một payload logic; không lưu PII hoặc key trong localStorage/sessionStorage. Retry cùng payload giữ key; sửa payload hoặc chủ động tạo yêu cầu mới tạo key khác. Server HMAC payload chuẩn hóa, khóa transaction theo scope/key; tạo lead/outbox/key cùng transaction. Key/payload giống nhau trả response đã lưu; payload khác trả 409. Hạn 24 giờ; hết hạn cho phép yêu cầu mới. Email khách không bị unique toàn cục.

## 10. Integration và end-to-end tests

Đã chạy trên PostgreSQL thật `qavio_test`, không chỉ mock:

- `pnpm test:integration`: **29 nhóm PASS**. CONTACT/DEMO/QUOTE, validation và consent/status giả, concurrent idempotency 8 requests, conflict/replay/expiry, yêu cầu mới cùng email, rollback activity/outbox, email unique và concurrent subscribe, PENDING, token hash/purpose/expiry/replay/concurrent confirmation, unsubscribe/re-enroll, chặn marketing, provider disabled, retry/sanitized errors, lease recovery/max attempts, hai worker, rate limit concurrent/HTTP429, origin/body/honeypot/thời gian, proxy giả, production policy gate và response/log không lộ PII.
- `pnpm exec tsx scripts/check-api.ts`: **PASS** trên production standalone chạy local với DB test. Kiểm tra listing 404, GET mutation 405, origin/validation, chuỗi newsletter PENDING→CONFIRMED→UNSUBSCRIBED và response không echo email.
- Trình duyệt: submit thật contact/demo/quote/subscribe, đối chiếu từng bản ghi trong PostgreSQL bằng `scripts/check-browser-records.ts`; đúng loại lead, consent, QUOTE PRO/6 tháng, không âm thầm thêm newsletter từ contact/demo/quote. Sau đó xác nhận và hủy newsletter bằng UI/token test: **PASS**. Token được bỏ khỏi URL.
- Mất kết nối: dừng đúng process test HTTP local, submit → network error, dữ liệu và consent vẫn còn; khởi động lại, retry → chỉ một lead: **PASS**.
- Resend trên UI: **PASS**, giữ trạng thái thật, không tuyên bố email đã gửi.
- Dữ liệu QA của các integration runs được xóa theo UUID/email giả chính xác của từng run; bản ghi browser được kiểm tra rồi xóa theo danh sách cố định. Không reset/drop/truncate database.

Các scripts test không dùng dữ liệu production. Log test chỉ in tên check, số lượng và kết quả; không in token hoặc secret. Thử nghiệm SMTP thực tế, DNS email, SPF/DKIM/DMARC, inbox delivery và link từ nhà cung cấp thật **chưa chạy**.

## 11. Lint, build và hồi quy A/B

- `pnpm lint`: PASS, không lỗi/warning.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS, production standalone; Prisma generate nằm trong build script.
- `pnpm test:public`: PASS, **14 trang / 371 internal links**, metadata/canonical/OG/Twitter, JSON-LD, sitemap, 404 và logo.
- Responsive bốn form tại 390/768/1280px: 12 tổ hợp, không tràn ngang; mỗi trang một H1, có main/skip target, không field thiếu label. Kiểm tra bàn phím cho checkbox, submit, menu mobile và đóng menu sau điều hướng: PASS.
- Không thấy log hydration error trong phiên kiểm tra trình duyệt. Đây là kiểm tra accessibility cơ bản, chưa thay thế audit screen reader/WCAG đầy đủ.
- Logo `public/brand/Qavio.png` và bố cục navy/vàng kim được giữ. Chưa có favicon chính thức mới. Không bật indexing.
- Docker development `config --quiet`: PASS; runtime Docker image và worker deployment trên Linux chưa kiểm thử vì Docker Engine tắt. Dockerfile bổ sung OpenSSL/CA cho Prisma; `.dockerignore` loại env, runtime database và binaries local.

## 12. Environment

Tham khảo `.env.example`; không commit `.env.local`. Các giá trị cần cung cấp:

| Nhóm | Biến |
| --- | --- |
| Database | `DATABASE_URL`, `QAVIO_TEST_DATABASE_URL`, `QAVIO_DEV_DB_PASSWORD` khi dùng Docker development |
| Môi trường | `QAVIO_DEPLOYMENT_ENV` development/test/staging/production |
| Tiếp nhận | `QAVIO_PUBLIC_FORMS_ENABLED` mặc định false; production còn cần `QAVIO_DATA_POLICY_APPROVED=true` sau phê duyệt thực tế |
| URL/SEO | `APP_ORIGIN`, `SITE_URL`, `SITE_INDEXING_ENABLED=false`, `QUANPILOT_PUBLIC_URL` để trống khi chưa xác nhận |
| Bảo mật | `QAVIO_TOKEN_SECRET` sinh ngẫu nhiên ít nhất 32 bytes, `QAVIO_TRUSTED_PROXY_SECRET` khi có reverse proxy tin cậy |
| Email | `EMAIL_PROVIDER=disabled` hoặc smtp; `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` |
| Lead email | `LEAD_NOTIFICATION_EMAIL`, `LEAD_RECEIPT_ENABLED=false` mặc định |

Environment không hợp lệ đóng tiếp nhận; không suy ra quyền thu thập dữ liệu thật từ việc build thành công. File local hiện chỉ bật kiểm thử development; server test ép `qavio_test` và tắt provider.

## 13. Chức năng phụ thuộc provider thật

Admin notification, biên nhận khách, newsletter confirmation/welcome và biên nhận hủy cần SMTP được cấu hình và worker hoạt động. Không lấy SMTP host/địa chỉ người gửi/người nhận từ thông tin suy diễn. Cần chủ dự án cung cấp và xác nhận các kênh này trước kiểm thử gửi thật.

## 14. Các điểm chưa xác minh / chờ duyệt

Tên pháp lý, đơn vị vận hành, đầu mối phụ trách dữ liệu, kênh hỗ trợ, mục đích/thời hạn lưu, nơi lưu, provider/hợp đồng xử lý, quy trình yêu cầu truy cập/chỉnh sửa/xóa và log/backup policy vẫn cần chủ dự án rà soát. Privacy/terms tiếp tục là **dự thảo**, phiên bản consent local `draft-2026-10-20`; chưa tuyên bố có hiệu lực.

Chưa có SMTP thật; chưa kiểm thử Docker runtime/Linux, tải production, disaster recovery hoặc cấu hình trusted proxy trên VPS. Hạ tầng web hiện tại chưa được thay đổi để chạy C. Cần đánh giá lại các việc này trước deployment sau này; không áp dụng lệnh triển khai A/B cho C khi chưa chuẩn bị database, worker và policy.

## 15. Chuẩn bị Giai đoạn D

Tái sử dụng Lead/LeadActivity/services, bổ sung authentication/authorization admin, phân trang/lọc/ghi nhận người sửa trạng thái, kiểm soát export, audit và quy trình xử lý dữ liệu. Chuẩn bị vận hành worker/monitor FAILED, retention và backup/restore. Chưa mở dashboard, auth, CMS, bulk marketing, payment, SePay hoặc tích hợp dữ liệu sản phẩm.

## 16. File thay đổi chính

`prisma/schema.prisma`, ba migrations; `src/server/*`; API routes; `src/lib/submission-schema.ts`; `InquiryForm`, `NewsletterAction`; `/request-quote`, hai trang newsletter; cập nhật CTA, FAQ, privacy/terms và metadata. Thêm scripts migration/integration/HTTP/worker/maintenance/đối chiếu browser, Compose development, env mẫu; cập nhật dependency/lockfile, Docker ignore/OpenSSL, README và ngoại lệ AGENTS cho C.

## 17. Git và tách biệt Restaurant

`git rev-parse --show-toplevel` xác nhận **D:/anh/qavio**, có `.git` riêng. Remote có sẵn `https://github.com/herry-huynhlong/qavio.git`, nhánh main, HEAD vẫn `ed016cd` (bản docs A/B). Không tạo/đổi remote hoặc commit/push C.

`D:\anh\Restaurant\qavio` là checkout khác có Git metadata riêng, không phải workspace đang sửa. Không xóa, di chuyển hoặc sửa metadata thư mục đó. Tất cả thao tác ghi của C giới hạn QAVIO và artifact kiểm thử của chat; không sửa source/database/container Restaurant/portfolio.

Working tree C có file tracked modified và các thư mục/file backend mới chưa track. `Qavio.png` root vẫn untracked từ bản gốc người dùng, giữ nguyên; ảnh public chính thức vẫn tracked. `.env.local`, `.runtime`, `.next`, `.test-artifacts` bị ignore. Các thay đổi C cố ý chưa stage/commit. Đây là báo cáo local, không phải xác nhận deployment production.

Kết thúc phiên kiểm tra: đã dừng đúng process HTTP test local và cluster PostgreSQL portable riêng của QAVIO. Database được giữ nguyên, không xóa volume/cluster. Chạy lệnh khởi động ở mục 4 để xem lại C tại local. Đã kiểm tra secret local không xuất hiện trong 100 file Git candidate và git diff --check không có lỗi khoảng trắng.
