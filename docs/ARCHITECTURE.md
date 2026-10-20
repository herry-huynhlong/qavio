# Kiến trúc và lộ trình QAVIO

## Kiểm tra ban đầu — 20/10/2026

Repository chỉ có `.git`, nhánh `main` chưa có commit; origin `herry-huynhlong/qavio`. Không có cấu hình hay code cần giữ lại. Phạm vi triển khai đầu tiên là A theo phần 26 của yêu cầu. Không sửa `D:\anh\Restaurant`.

## Cấu trúc hiện tại

Cập nhật Giai đoạn D (20/10/2026): A/B/C đã có; C đang chạy production, D chỉ local theo yêu cầu hiện tại. Xem PHASE_D.md cho phạm vi và kết quả kiểm thử. Không commit/push/deploy D hoặc thay VPS trong giai đoạn này.

```text
src/app/(public)/       Public URL cũ, header/footer riêng; news/products đọc published CMS
src/app/admin/          Login, layout quản trị, protected pages và preview nội bộ
src/app/api/admin/      Một API dispatcher dùng cùng backend/service/PostgreSQL C
src/app/media/[id]/     Ảnh chuẩn hóa, draft có guard
src/server/admin/      Auth/RBAC, CRM, newsletter, CMS, accounts/audit
src/server/            C services, worker/shared eligibility, public CMS reads
prisma/                C migrations + migration D bổ sung (local dev/test)
scripts/               CLI bootstrap, migration và integration/HTTP tests có DB guard
docs/                  Yêu cầu, kiến trúc và báo cáo giai đoạn
```

Dùng một ứng dụng Next.js modular và một PostgreSQL riêng QAVIO; qavio_test tách khỏi qavio_dev. Không dùng DB/auth/payment Restaurant/QuánPilot. CMS rich text giới hạn tag và sanitize ở server; trường section/social/CTA có schema riêng. Không page builder hoặc HTML không kiểm soát.

## Cấu trúc mục tiêu

Một ứng dụng modular, không microservices. Các phần sau là lộ trình ban đầu; A–D đối chiếu theo báo cáo từng giai đoạn, E có code/cấu hình local; Docker/Linux/production chưa được xác minh đầy đủ:

```text
src/app/(public)/       About, solutions, products, pricing, news, forms, legal
src/app/admin/          Dashboard, lead, subscriber, bài viết, nội dung, cài đặt
src/app/api/            Endpoint giới hạn, validation phía server
src/server/auth/       Session, hash mật khẩu, quyền SUPER_ADMIN/ADMIN/EDITOR
src/server/services/   Lead, newsletter, CMS, media, company, audit
src/server/email/      Provider, templates, outbox và retry
src/lib/validation/    Zod schemas dùng lại với React Hook Form
src/content/           Locale và nội dung mặc định được kiểm duyệt
prisma/                Schema và migrations PostgreSQL riêng QAVIO
tests/                 Unit, integration và browser tests
```

Public pages ưu tiên Server Components; admin dùng client cho form/bảng và server cho guard, quyền, validation. CMS section có cấu trúc; rich text giới hạn whitelist, sanitize khi lưu và render; không HTML tùy ý hoặc page builder.

## Giai đoạn B — Nội dung

Đã triển khai, kiểm tra local/Linux và deploy B sau khi chủ dự án xác nhận ngày 20/10/2026. Các gạch đầu dòng dưới đây là nguyên tắc đã áp dụng, phần CMS/nội dung xuất bản chờ D.

- Thêm đầy đủ route công khai theo brief, metadata, breadcrumbs và SEO theo domain được xác nhận.
- Privacy/terms cần thông tin xử lý dữ liệu và nội dung được chủ dự án duyệt trước khi nhận lead.
- Giá BASIC/PRO để liên hệ nếu chưa có nguồn chính thức. Không có checkout/subscription QAVIO.
- News chỉ lấy bài published. Không tự xuất bản bài về sự kiện, khách hàng hoặc thành tích.
- Thay hình minh họa bằng screenshot thật khi có tài sản đã duyệt; giữ nhãn minh họa nếu chưa có.

## Giai đoạn C — Dữ liệu và lead

- PostgreSQL riêng, migration tái lập và database test riêng; không lấy DATABASE_URL Restaurant.
- Lead dùng chung cho liên hệ/demo/báo giá để tránh nhân bản. Lưu source, consent, idempotency và lịch sử hoạt động.
- Subscriber unique email, token hash có expiry, xác nhận/hủy an toàn, lưu consent events. Không marketing khi chưa confirmed.
- React Hook Form + Zod; validate backend, hạn chế payload, chống spam, rate limit có lưu trữ dùng chung.
- Email outbox và trạng thái gửi trung thực nếu provider chưa được cấu hình.

## Giai đoạn D — Admin/CMS

- Session cookie HttpOnly/Secure, CSRF theo cơ chế chọn, bootstrap admin bằng secret đầu vào không mật khẩu cố định.
- SUPER_ADMIN quản trị tài khoản/cấu hình nhạy cảm; ADMIN nội dung/lead; EDITOR chỉ nội dung được cấp.
- Guard backend mọi action, audit log, phân trang/tìm kiếm/lọc, CSV theo quyền, bảo vệ formula injection khi export.
- LeadActivity lưu thay đổi trạng thái/ghi chú/phân công. Không ghi đè mất lịch sử.
- News draft/published, preview có guard, media giới hạn MIME/kích thước và xử lý upload an toàn.

## Giai đoạn E — Vận hành

- Provider email, SEO hoàn chỉnh, kiểm tra accessibility/performance/security, health check.
- Docker app/database QAVIO tách riêng cổng, volume, network, compose project, môi trường; backup/restore có hướng dẫn.
- Typecheck/lint/unit/integration/E2E/build, migration trên database test và staging.
- Production deployment chỉ thực hiện sau khi người dùng xác nhận. Không restart/chỉnh container QuánPilot.

## Cập nhật E — local, chưa phát hành

Readiness khác liveness, environment validator ở image entrypoint, worker heartbeat/shutdown, ops CLI, media quota/disk checks, backup DB+media mã hóa và restore chỉ DB sandbox trống. Không thêm migration E. Có compose.staging.yaml cô lập và overlay release-candidate tắt các tính năng production theo mặc định; chưa áp dụng lên VPS. Xem PHASE_E.md và OPERATIONS_RUNBOOK.md, không coi cấu hình đã viết là runtime Docker đã chạy.
