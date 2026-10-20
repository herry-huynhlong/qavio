# Báo cáo Giai đoạn B — 20/10/2026

## 1. Các trang đã hoàn thành tại local

| Route | Nội dung |
| --- | --- |
| `/` | Trang chủ A cập nhật logo gốc, CTA và navigation sang trang B |
| `/about` | Giới thiệu, sứ mệnh, tầm nhìn, triết lý sản phẩm và năm giá trị |
| `/solutions` | Bốn hướng tiếp cận, vấn đề thường gặp, phương pháp, lợi ích kỳ vọng và QuánPilot liên quan |
| `/products` | Giới thiệu hệ sinh thái; QuánPilot là sản phẩm đầu tiên, không có sản phẩm giả |
| `/products/quanpilot` | Tám nhóm tính năng, tab quy trình theo vai trò, giới hạn triển khai và FAQ |
| `/pricing` | BASIC/PRO, thời hạn 3/6/12 tháng; liên hệ báo giá, chưa công bố giá hay quyền chưa được duyệt |
| `/news` | Trạng thái chưa có bài xuất bản; chủ đề biên tập hiển thị dạng danh sách, không có bộ lọc giả |
| `/contact` | Nội dung liên hệ và giao diện chuẩn bị/kiểm tra thông tin |
| `/request-demo` | Giao diện nhu cầu demo: mô hình quán, số cơ sở, nhu cầu chính, lời nhắn |
| `/subscribe` | Giao diện nhận tin và mô tả luồng xác nhận/hủy dự kiến |
| `/faq` | Câu hỏi mở/đóng bằng chuột và bàn phím |
| `/privacy` | Dự thảo bảo mật, chưa có hiệu lực, chỉ rõ các nội dung cần xác nhận |
| `/terms` | Dự thảo điều khoản, chưa có hiệu lực, không tự đưa điều kiện thương mại/pháp lý chưa duyệt |

Các trang cùng dùng hệ thống navy/vàng kim, header/footer, breadcrumbs và CTA dùng chung. Route không tồn tại trả 404. Không tạo `/news/[slug]` giả khi chưa có bài xuất bản.

## 2. Chức năng hoạt động thực tế

- Navigation desktop/mobile đến các route thật; trạng thái trang hiện tại, Escape đóng menu, chọn mục đóng menu.
- Tab QuánPilot hỗ trợ ArrowLeft/ArrowRight/Home/End, có đủ panel đích cho mọi `aria-controls` và ẩn panel chưa chọn.
- FAQ dùng native details/summary; skip link, focus outline, heading, label, alt ảnh và live status.
- Biểu mẫu kiểm tra trường bắt buộc, email, định dạng/số chữ số điện thoại, số cơ sở và đồng ý; có nút xóa thông tin.
- Nút **Kiểm tra thông tin** chỉ kiểm tra client. Sau khi hợp lệ vẫn ghi rõ chưa gửi/ghi nhận yêu cầu; không có thông báo gửi thành công.
- Không gọi API nhận lead, không ghi database, không lưu thông tin vào localStorage/sessionStorage. Chặn implicit submit trước hydration bằng submit control bị vô hiệu hóa; không đưa nội dung form vào query URL.
- Ảnh logo được phục vụ qua Next Image với kích thước nội tại, `height:auto`, `object-fit:contain`, alt và ưu tiên tải ở hero.
- Metadata riêng, canonical mỗi trang, Open Graph, Twitter card, sitemap, robots; JSON-LD chỉ WebSite và BreadcrumbList với thông tin đã xác nhận.

## 3. Phần chỉ có giao diện / chưa kích hoạt

- Liên hệ, demo và nhận tin: không gửi, không tạo lead, không đặt lịch, không tạo tài khoản QuánPilot.
- Chưa có xác nhận/hủy newsletter, gửi email, consent record, chống spam/rate limit phía backend.
- News chưa có bài, CMS, pagination hoặc filter; không tự xuất bản nội dung mẫu.
- Chưa có admin/auth/database/migration/checkout/payment hoặc kết nối QuánPilot.
- Giá và ma trận tính năng gói chờ nguồn có thẩm quyền; không sao chép giá từ Restaurant.

## 4. Logo và favicon

- Tìm thấy ảnh người dùng cung cấp tại `D:\anh\qavio\Qavio.png`.
- Sao chép nguyên byte vào **`public/brand/Qavio.png`**; giữ nguyên file gốc ở root, không di chuyển/xóa hoặc chỉnh sửa ảnh.
- Kích thước gốc 1536 × 1024 (3:2). SHA-256 cả hai file: `B611973E66CA4B8CA6653994EB6C5E8E90D1F7E626E62ABCE552BEF1738BE4FF`.
- Dùng ảnh đầy đủ ở hero, trang about, footer và ảnh chia sẻ OG; không cắt mất chữ, kéo giãn hoặc vẽ lại biểu tượng. Hình học mang chữ QAVIO tạm ở hero A đã được thay bằng tài sản chính thức.
- Header desktop/mobile vẫn dùng tên chữ QAVIO dễ đọc. Không nhét nguyên ảnh có nền/họa tiết vào logo navigation nhỏ. Cần bổ sung logo ngang/SVG hoặc PNG trong suốt đã được duyệt để thay vị trí này.
- Chưa có tài sản favicon riêng đạt chất lượng; giữ trạng thái mặc định trình duyệt của A, không tạo favicon từ biểu tượng suy diễn. Cần file icon chính thức, có thể cung cấp tại `public/brand/qavio-icon.png` hoặc SVG chuẩn.

## 5. Kết quả kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| `pnpm lint` | PASS, không warning/error ở bản cuối |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS; Next prerender 17/17, các trang B đều được build |
| `pnpm start` | PASS, standalone local tại loopback 3100 |
| `pnpm test:public` | PASS: 13 trang, 346 liên kết nội bộ; metadata, canonical đúng route, JSON-LD, sitemap, logo, 404 |
| Responsive / basic a11y | PASS: 39 lượt (13 trang × 320/820/1280px), không horizontal overflow, thiếu label/alt hoặc nhiều/thiếu H1 |
| Mobile 390px | Menu mở/đóng, Escape, điều hướng Liên hệ; form và nội dung đọc được |
| Form liên hệ | Required, email sai, valid nhưng chưa gửi, reset; URL không mang dữ liệu form |
| Demo | Số cơ sở 0 bị từ chối, 1 hợp lệ; trạng thái chưa gửi |
| Newsletter | Bắt buộc đồng ý, hợp lệ vẫn chưa đăng ký/gửi email |
| Điện thoại | Từ chối chuỗi có quá ít chữ số; chấp nhận số có +84 và khoảng trắng hợp lệ |
| Bàn phím | Tab vai trò End chọn Chủ quán; FAQ Enter mở nội dung; không có aria-controls thiếu đích |
| Console / hydration | Không ghi nhận error hoặc warning trong lượt kiểm tra trình duyệt |
| Ảnh | Logo gốc có alt, tải thành công, giữ tỷ lệ trên desktop/mobile |
| `git diff --check` | PASS cho các thay đổi đã được Git theo dõi; chỉ cảnh báo chuẩn hóa LF/CRLF |

Đây là kiểm tra giao diện/SEO và hồi quy HTTP trên build local, không thay thế audit WCAG đầy đủ, Lighthouse hoặc kiểm thử backend Giai đoạn C. Chưa chạy lại Docker Linux vì không deploy bản B.

## 6. Thông tin còn thiếu và cấu hình

- Logo ngang/biểu tượng/favicon chuẩn để dùng ở kích thước nhỏ.
- Tên pháp lý/trạng thái đơn vị vận hành nếu công bố, email/hotline/địa chỉ, giờ làm việc và social chính thức. Các trường chưa được xác nhận không được tự điền.
- URL QuánPilot chính thức, screenshot sản phẩm được duyệt, bảng giá/quyền và điều kiện thương mại.
- Email provider, người nhận lead, quy trình xử lý, thời hạn lưu trữ, thông tin đơn vị xử lý dữ liệu và duyệt hai dự thảo pháp lý.

`src/lib/site-config.ts` là nơi cấu hình tập trung. `SITE_URL` có fallback là domain **đã được người dùng xác nhận** `https://qavio.longh.org`. `QUANPILOT_PUBLIC_URL` để trống: không hiện liên kết sang môi trường sản phẩm khi chưa được xác nhận; không tự lấy `demo.longh.org` làm production URL.

`SITE_INDEXING_ENABLED=false` mặc định. Metadata, header và robots vẫn chặn index cho bản chưa duyệt. Sitemap có các trang công khai nhưng loại hai dự thảo pháp lý. Khi được duyệt mới bật index và build lại; legal draft luôn noindex. Các giá trị cấu hình ảnh hưởng trang prerender cần đặt lúc build, không chỉ thay env runtime.

## 7. Chuẩn bị cho C — chưa bắt đầu

1. Duyệt thông tin doanh nghiệp, nội dung pháp lý và kênh liên hệ.
2. Thiết kế PostgreSQL/Prisma riêng, migrations tái lập và database test riêng.
3. Lead dùng chung nguồn contact/demo/báo giá, validation Zod backend + React Hook Form khi nối API, idempotency và lịch sử xử lý.
4. Newsletter unique email, token hash có hạn, consent events, xác nhận/hủy và không marketing trước confirmed.
5. Email outbox/retry và trạng thái gửi chính xác khi provider chưa có cấu hình.
6. Rate limit có lưu trữ dùng chung, chống spam, giới hạn payload và integration tests; admin/auth/CMS vẫn theo giai đoạn D.

Không có migration mới ở B. **Chưa triển khai C và chưa deploy production bản B.** Các thay đổi B hiện ở local để chủ dự án rà soát; bản A đang chạy trên VPS giữ nguyên.

## 8. Phạm vi thay đổi

- Mã nguồn/tài sản thay đổi chỉ trong `D:\anh\qavio`; không kết nối SSH hoặc chỉnh VPS trong lượt B.
- Không chỉnh source/config/database của Restaurant. Kiểm tra Git chỉ đọc thấy `?? qavio/` trong repository Restaurant ở cuối lượt; không xóa, chuyển hay thay đổi thư mục không thuộc phạm vi này.
- Các file chính: route B trong `src/app`, `src/lib/site-config.ts`, `seo.tsx`, các component brand/public-page/inquiry-form, header/footer, CSS, `public/brand/Qavio.png`, script `check-public-pages.mjs` và báo cáo này.
