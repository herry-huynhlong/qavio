# Báo cáo Giai đoạn A — 20/10/2026

> Cập nhật sau báo cáo ban đầu: A đã được triển khai lên VPS theo xác nhận riêng của chủ dự án. Lượt hoàn thiện A + B đã tích hợp ảnh gốc `public/brand/Qavio.png`, sửa navigation và bổ sung trang công khai tại local; xem `PHASE_B.md`. Các mục dưới đây lưu kết quả tại thời điểm A ban đầu.

## Phạm vi đã triển khai

- Khởi tạo repository trống bằng Next.js App Router, TypeScript strict, Tailwind CSS.
- Bộ màu navy/vàng kim/trắng ngà, typography hệ thống hỗ trợ tiếng Việt không phụ thuộc Google Fonts, button/card/spacing/focus dùng chung.
- Header sticky đổi bóng khi cuộn, navigation desktop/mobile, Escape đóng menu, đóng khi click ngoài/chọn mục.
- Trang chủ đầy đủ các phần trong README; vị trí liên hệ và newsletter chưa nhận dữ liệu.
- Giới thiệu QuánPilot bằng nội dung phù hợp source đã kiểm tra trước đó, không mang source hay dữ liệu vận hành sang QAVIO.
- Tab 5 vai trò có ARIA và ArrowLeft/ArrowRight/Home/End; FAQ native details.
- Error/loading/404, robots noindex cho bản phát triển, security headers cơ bản.
- Header/footer dùng anchor hoạt động; các trang chi tiết và legal thuộc B, không tạo đường dẫn chết hoặc nội dung pháp lý chưa duyệt.

## File chính

- `src/app/page.tsx`, `globals.css`, `layout.tsx`.
- `src/components/site-header.tsx`, `product-explorer.tsx`, `site-footer.tsx`.
- `src/content/vi.ts`, `next.config.ts`, cấu hình lint/TypeScript/Tailwind.
- `docs/ARCHITECTURE.md`, `README.md`.

## Migration

Không có migration. Database và persistence thuộc C; không kết nối database nào ở A.

## Tài sản/thông tin cần cung cấp

1. File `Qavio.png` gốc; ưu tiên thêm SVG hoặc PNG độ phân giải cao, nền trong suốt và biến thể sáng/tối nếu có. Ảnh mẫu đính kèm là định hướng, không phải logo chính thức.
2. Domain, tên pháp lý/trạng thái pháp nhân nếu công bố; email/hotline/địa chỉ/social được xác nhận. Không yêu cầu gửi secret trong chat/Git.
3. Screenshot QuánPilot đã duyệt và đường dẫn demo sản phẩm nếu có.
4. Nguồn bảng giá/tính năng BASIC/PRO và điều kiện thương mại chính thức.
5. Provider email, người nhận thông báo, quy trình xử lý lead và dữ liệu cá nhân; cấu hình secret qua môi trường ở C–E.

## Giới hạn hiện tại

Chưa triển khai B–E: route nội dung chi tiết, form thật, database, newsletter xác nhận/hủy, auth/admin/CMS/email, Docker/backup/staging. Không tuyên bố website đã hoàn chỉnh hoặc đã được deploy. Wordmark chữ chỉ là vị trí thay thế logo chính thức; minh họa hero là hình học kết nối, không mô phỏng logo.

## Kiểm tra

- `pnpm install --frozen-lockfile`: PASS. Cho phép riêng build script của `unrs-resolver` trong `pnpm-workspace.yaml`, không bật tự do mọi dependency script.
- `pnpm lint`: PASS, không warning/error ở bản cuối.
- `pnpm typecheck`: PASS; build cuối cũng chạy TypeScript thành công.
- `pnpm build`: PASS, Next.js 16.4.2, trang chủ/404/robots được prerender.
- Production preview tại loopback cổng 3100: HTTP 200, header noindex và frame DENY được xác minh.
- Browser kiểm tra độ rộng 320/390/768/820/1024/1280: không có horizontal overflow của document. Đã xem ảnh toàn trang desktop và ảnh mobile/tablet.
- Browser: chuyển tab Bếp bằng click, End chuyển sang Chủ quán; Thu ngân hiển thị đúng trên mobile.
- Browser: menu mobile mở, Escape đóng; chọn Sản phẩm đóng menu và điều hướng đúng.
- Browser: FAQ mở và hiển thị đúng câu trả lời. Toàn bộ anchor trên trang tìm thấy target.
- Đây là kiểm tra giao diện Giai đoạn A, chưa phải unit/integration/E2E cho backend chưa được xây dựng; chưa đo Lighthouse và không tuyên bố điểm hiệu năng.

Ảnh QA được lưu bên ngoài repository tại thư mục artifacts của chat. Server local dùng để kiểm tra được dừng sau bàn giao; chạy `pnpm dev` để xem lại.
