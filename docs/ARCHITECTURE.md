# Kiến trúc và lộ trình QAVIO

## Kiểm tra ban đầu — 20/10/2026

Repository chỉ có `.git`, nhánh `main` chưa có commit; origin `herry-huynhlong/qavio`. Không có cấu hình hay code cần giữ lại. Phạm vi triển khai đầu tiên là A theo phần 26 của yêu cầu. Không sửa `D:\anh\Restaurant`.

## Cấu trúc hiện tại

Cập nhật cuối Giai đoạn B: đã có 12 route công khai chi tiết, `src/lib/site-config.ts`/`seo.tsx`, component trang dùng chung và giao diện kiểm tra form, ảnh gốc trong `public/brand`, sitemap/robots và kiểm tra HTTP `scripts/check-public-pages.mjs`. Backend/database/admin chưa được triển khai. Xem `PHASE_B.md` cho phạm vi đã kiểm tra.

```text
src/
  app/                 Next.js routes, layout, CSS, error/loading/404/robots
  components/          Header, footer và tương tác tab QuánPilot
  content/vi.ts        Nội dung có cấu trúc, sẵn sàng thêm ngôn ngữ/CMS
docs/                  Yêu cầu, kiến trúc và báo cáo giai đoạn
```

Không thêm dependencies database, auth, email trước khi cần. Không thêm starter của hosting khác vì người dùng đã chọn Next.js và local-only.

## Cấu trúc mục tiêu

Một ứng dụng modular, không microservices. Các phần sau **là kế hoạch**, chưa được triển khai:

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

Public pages ưu tiên Server Components, chỉ dùng client cho tương tác cần thiết. Server tự xác định quyền và validate mọi thao tác. Nội dung CMS theo section có cấu trúc; không HTML tùy ý và không page builder.

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
