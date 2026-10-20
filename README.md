# QAVIO

Website thương hiệu QAVIO. Dự án độc lập tại `D:\anh\qavio`, remote `https://github.com/herry-huynhlong/qavio.git`.

## Trạng thái

Giai đoạn A: nền tảng và trang chủ. **Chưa phải hệ thống hoàn chỉnh và chưa sẵn sàng nhận dữ liệu khách hàng.** Không có kết nối database, email, admin hay thanh toán. Không đọc/chỉnh sửa database hoặc source Restaurant.

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4.
- CSS design tokens, nội dung tiếng Việt tách riêng, header sticky và menu mobile.
- Trang chủ: hero, giới thiệu, giải pháp, QuánPilot, giá trị thương hiệu, quy trình, định hướng gói, tin tức trống, FAQ, trạng thái nhận tin/liên hệ, footer.
- Tab vai trò QuánPilot dùng bàn phím; FAQ dùng native details; hỗ trợ reduced motion, skip link và focus.
- Chữ QAVIO tạm thời, không phải logo chính thức. Hình kết nối và quy trình là minh họa bằng giao diện, không phải ảnh hệ thống hay biểu tượng thương hiệu.
- Liên kết header/footer trỏ đến section thật trên trang chủ trong Giai đoạn A. Các route chi tiết triển khai ở B.
- Không có biểu mẫu nhận dữ liệu giả. Chỉ hiển thị trạng thái chưa mở đến khi C có backend thật.
- Chặn lập chỉ mục trong metadata, robots.txt và header HTTP ở bản A. Chỉ mở sau khi duyệt nội dung/domain ở staging.

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
```

`.env.example` là mẫu cấu hình; không commit `.env` hoặc secret. Giai đoạn A không yêu cầu biến môi trường để chạy.

## Tài liệu

- `docs/ARCHITECTURE.md`: kiến trúc và kế hoạch B–E.
- `docs/PHASE_A.md`: phạm vi, tài sản còn thiếu và kết quả kiểm tra.
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
