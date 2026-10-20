# QAVIO

Website thương hiệu QAVIO. Dự án độc lập tại `D:\anh\qavio`, remote `https://github.com/herry-huynhlong/qavio.git`.

## Trạng thái

Giai đoạn A đang chạy trên VPS theo xác nhận trước đó. Bản hoàn thiện A + Giai đoạn B đã triển khai và kiểm tra tại **local**, chưa deploy bản B. **Chưa sẵn sàng nhận dữ liệu khách hàng:** không có database, email, admin hay thanh toán.

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4.
- CSS design tokens, nội dung tiếng Việt tách riêng, header sticky và menu mobile.
- Trang chủ: hero, giới thiệu, giải pháp, QuánPilot, giá trị thương hiệu, quy trình, định hướng gói, tin tức trống, FAQ, trạng thái nhận tin/liên hệ, footer.
- Tab vai trò QuánPilot dùng bàn phím; FAQ dùng native details; hỗ trợ reduced motion, skip link và focus.
- Logo gốc `public/brand/Qavio.png` ở hero/about/footer/OG, không chỉnh ảnh. Navigation nhỏ giữ tên chữ đến khi có logo ngang; chưa có icon favicon riêng.
- Có đủ 12 trang B, header/footer trỏ đến route thật; trang pháp lý ghi rõ bản dự thảo. Xem danh sách trong `docs/PHASE_B.md`.
- Form contact/demo/subscribe có validation client và reset, không gửi yêu cầu, không lưu localStorage, không báo gửi thành công.
- Metadata/canonical/OG/Twitter, sitemap và WebSite/BreadcrumbList JSON-LD. Mặc định `SITE_INDEXING_ENABLED=false`; chỉ mở index sau duyệt.
- Cấu hình domain và URL sản phẩm tập trung trong `src/lib/site-config.ts`. Không suy diễn URL production QuánPilot và không kết nối dữ liệu sản phẩm.

## Chạy local

Node.js 22+ và pnpm 11.25.0. Đã kiểm tra trên Node 24.

```powershell
cd D:\anh\qavio
pnpm install --frozen-lockfile
pnpm dev
```

Mở `http://127.0.0.1:3100`. Cổng riêng, không chạy hay thay đổi ứng dụng Restaurant.

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm start
# Trong terminal khác, khi server đang chạy:
pnpm test:public
```

`.env.example` là mẫu cấu hình; không commit `.env` hoặc secret. A/B không cần credential để chạy. `SITE_URL` mặc định là domain đã xác nhận `https://qavio.longh.org`; đặt giá trị phù hợp ở lúc build khi đổi môi trường. Để trống `QUANPILOT_PUBLIC_URL` đến khi có URL chính thức được chủ dự án xác nhận.

## Tài liệu

- `docs/ARCHITECTURE.md`: kiến trúc và kế hoạch B–E.
- `docs/PHASE_A.md`: phạm vi, tài sản còn thiếu và kết quả kiểm tra.
- `docs/PHASE_B.md`: 12 trang B, logo, form, SEO, kiểm tra và chuẩn bị cho C.
- `docs/PROJECT_BRIEF.md`: bản yêu cầu gốc do người dùng cung cấp.
- `docs/DEPLOYMENT.md`: setup VPS Docker, domain/HTTPS, cập nhật và rollback.

## Docker trên VPS

```bash
docker compose config --quiet
docker compose build web
docker compose up -d --no-deps --wait --wait-timeout 120 web
```

QAVIO dùng Compose project `qavio`, chỉ mở loopback `127.0.0.1:3100`, cần reverse proxy để truy cập bằng domain. Endpoint liveness: `/api/health`. Cấu hình chạy VPS nằm trong `docs/DEPLOYMENT.md`; chưa có automatic deploy khi push GitHub. Local dùng `pnpm dev` hoặc `pnpm build` rồi `pnpm start`; script start chuẩn bị static/public assets và chạy standalone tại loopback cổng 3100.

Không deploy production, tự tạo thông tin doanh nghiệp, gắn logo suy diễn, dùng giá chưa duyệt hoặc tích hợp database QuánPilot.
