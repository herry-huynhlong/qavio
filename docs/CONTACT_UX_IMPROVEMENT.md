# QAVIO — Liên hệ khách hàng và đăng ký tư vấn

Ngày20/10/2026, local `D:\anh\qavio`. Chủ dự án yêu cầu “xong push code thẳng lên web nhé”: được commit/push/deploy sau kiểm tra, không cần xin duyệt lại phát hành. Quyền này không bao gồm mở chính sách dữ liệu, form thật, newsletter hoặc indexing.

## Giao diện và CRM

- `/contact` và `/request-demo` dùng chung ConsultationForm: họ tên, số điện thoại bắt buộc; lời nhắn tùy chọn, checkbox consent bắt buộc. Không email/tên nhà hàng/loại hình/số cơ sở/gói dịch vụ. Có metadata/honeypot ẩn chống spam.
- Chỉ báo thành công sau khi API/database xác nhận. Khi lỗi giữ nguyên input; khóa lúc đang gửi/thành công; retry cùng payload giữ idempotency key. Không lưu PII vào localStorage/sessionStorage.
- `/contact` có phần mở đầu mới, số chính thức và nút gọi/Zalo theo cấu hình đã xuất bản. Trang demo giải thích chỉ cần tên/điện thoại; các CTA cũ vẫn dẫn đúng route.
- Menu `/admin/leads` đổi thành **Liên hệ khách hàng**. Bảng hiển thị tên, số có tel link, lời nhắn, nguồn dễ đọc, thời điểm, trạng thái, người phụ trách. Tìm kiếm thêm lời nhắn; giữ bộ lọc/phân trang, chi tiết, đổi trạng thái, ghi chú, phân công, optimistic concurrency, lịch sử/audit và CSV theo quyền.

## Cụm liên hệ nổi và cấu hình

- Chỉ public layout có cụm góc phải dưới, mặc định thu gọn; mở/thu, Escape, accessible names/aria-expanded, focus/hover, safe-area. Không animation nhấp nháy. Footer có khoảng trống, hàng submit chừa chỗ; kiểm mobile304px không tràn ngang/không giao nhau giữa nút nổi và nút gửi.
- Cấu hình dùng cùng bản ghi CMS **CONTACT/company** trong PostgreSQL, không thêm database hoặc backend: `phone`, `phoneDisplay`, `zaloUrl`, `floatingEnabled`, `callEnabled`, `zaloEnabled`. Giữ email/địa chỉ/social cũ.
- Trong `/admin/settings` → Thông tin liên hệ: SUPER_ADMIN sửa, lưu nháp/preview rồi Xuất bản. Backend giữ kiểm quyền SETTINGS cho CONTACT; ADMIN/EDITOR không thể sửa chính thức. Lưu revision/audit, không tự mở policy.
- Backend giới hạn điện thoại8–15chữ số, chuẩn hóa tel. Zalo chỉ HTTPS trên đúng `zalo.me`, đường dẫn tài khoản số hoặc nhóm hợp lệ, không credentials/port/query/hash; loại bỏ domain giả và redirect query. Không có dữ liệu hoặc flag tắt thì không dựng nút.
- Biểu tượng Zalo nguyên gốc lấy từ [website Zalo chính thức](https://zalo.me/en/), asset `https://zalo-site.zadn.vn/_next/static/media/logo-zalo.5eb1a7b1.webp`, lưu `public/brand/zalo-official.webp`; không tạo lại bằng AI, không nhúng SDK/tracker bên ngoài. Đây là tài sản thương hiệu Zalo, không phải logo QAVIO.
- Chủ dự án cung cấp số **0935269851**, chọn chưa có URL Zalo nên **giữ Zalo ẩn**. Khởi tạo số phải không xuất bản nội dung QA của CONTACT/company từ lần nghiệm thu trước.

## API, dữ liệu và migration

- Giữ `/api/contact`, `/api/demo-requests`, `/api/quote-requests`; tái sử dụng createLead/idempotency/PostgreSQL rate limit. CONTACT/DEMO cho phép email null/không có, lời nhắn rỗng và các trường demo cũ optional; payload cũ vẫn hợp lệ. QUOTE giữ hợp đồng cũ.
- Migration `202610200005_contact_consultation` chỉ `ALTER TABLE Lead ALTER COLUMN email DROP NOT NULL`. Không drop cột, chuyển/xóa giá trị hoặc mất quan hệ/index. Test migration từ bản C có dữ liệu qua cả D và5 giữ giá trị nguyên vẹn.
- Tên/điện thoại/message/nguồn/consent được lưu trực tiếp vào Lead và LeadActivity trong transaction. CONTACT và DEMO **không tạo EmailOutbox**, kể cả env notification/receipt đang có. QUOTE/PRODUCT_INQUIRY cũ giữ nghiệp vụ email; receipt phải có email.
- Idempotency khóa transaction + response ổn định; cùng key khác payload409. Rate limit theo IP và email nếu có, nếu không thì điện thoại; key lưu dạng HMAC. Không gom mọi khách không email vào cùng bucket.
- Tiếp nhận Lead chỉ cần PostgreSQL, không phụ thuộc SMTP. Subscribe/resend newsletter bị503 nếu chưa cấu hình provider; forms/status trả riêng newsletterEnabled. Không lộ Lead/PII/internal ID qua public response/listing.

## Kiểm thử đã đạt tại local

- Lint không warning, TypeScript, production build và runtime rendering manifest.
- Integration C29, Admin31, Contact10; operations/migration/backup-restore cô lập12checks, trong đó restore đủ5migration và giữ dữ liệu legacy. Không restore production.
- Compiled HTTP APIs: gửi không email/lời nhắn, hai POST cùng key chỉ một Lead, không outbox, newsletter đóng, chặn Origin/public listing.
- Public:14trang,371internal links, metadata/canonical/sitemap/404/logo PASS.
- Browser trên build local: form đúng3trường, số sai/thiếu consent bị chặn và giữ input; gửi yêu cầu tổng hợp hiện thông báo đúng; Admin thấy lead không email, gọi tel link, đổi CONTACTED/phân công/ghi chú và đọc lại lịch sử. Mobile304px không tràn ngang, nút nổi không che submit. Cụm thử mở đúng tel/Zalo URL đã cấu hình; không thực hiện gọi hoặc mở tài khoản Zalo thử.
- Các tài khoản/dữ liệu browser QA chỉ thuộc qavio_test, không dùng credential hay khách hàng production.

## Build và phát hành

- Không build trên VPS1GB. Workflow thủ công `.github/workflows/qavio-release.yml` chạy trên GitHub Actions: dependency lock, DB QAVIO ephemeral, integration suites và Docker Linux build (lint/build trong Dockerfile); đóng gói web image kèm revision và checksum, không có env/secrets.
- Chỉ thay web image vì thay đổi này thuộc web/API; worker email hiện disabled giữ image c205bbd và không cần recreate. `QAVIO_OPERATIONS_IMAGE_TAG` pin riêng operations; migration service mount thư mục prisma đã duyệt read-only để CLI Prisma6.19.2 hiện có áp dụng migration5, không build operations image1,85GB trên VPS chật.
- Phải có backup mới đủ trạng thái hiện tại, copy off-host và restore cô lập trước migration. Giữ image web c205bbd để rollback; migration nullable là tương thích ngược, không rollback DB.
- **Trạng thái lúc tạo báo cáo: local PASS; chờ CI/image, backup và deploy.** Không coi push Git là đã lên web; cập nhật bằng chứng sau HTTP/readiness thực tế.

## Điều kiện mở tiếp nhận thật và giới hạn

- Hiện production vẫn `QAVIO_PUBLIC_FORMS_ENABLED=false`, `QAVIO_DATA_POLICY_APPROVED=false`, `EMAIL_PROVIDER=disabled`, noindex; newsletter và legal/data-request approval vẫn đóng. Giao diện mới được phát hành không đồng nghĩa đã mở nhận khách.
- Cần nội dung chính sách và phiên bản consent được chủ dự án phê duyệt, xác nhận mở hai flag intake/policy rồi mới nhận PII thật. SMTP không phải điều kiện để nhận Lead tư vấn; newsletter vẫn cần provider.
- Thiếu URL Zalo chính thức; nút Zalo ẩn. Không tích hợp Zalo API/Telegram/SMS/payment/auth QuánPilot. Không thay Restaurant/portfolio hoặc Docker Engine, không prune/xóa volume.
