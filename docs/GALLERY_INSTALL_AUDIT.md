# Gallery và hướng dẫn cài QuánPilot — 28/10/2026

## Phạm vi và nguyên nhân

Hai file cũ `pro-tables.webp` và `pro-menu-admin.webp` chứa pixel của Báo cáo năm. Mapping đã dùng hai URL khác nhau; lỗi nằm ở ảnh được chụp trước khi điều hướng hoàn tất, không phải dùng chung một URL. Đã xem bằng mắt cả 26 nguồn ảnh, giữ 24 ảnh đúng và chụp lại hai màn hình từ clone PRO QAVIO cô lập, slug `thien-dao`. Không ghi dữ liệu vào production.

- Bàn: `pro-tables-v2-750c1150.webp`, 1180×900; khu vực A đang phục vụ/chờ thanh toán và B trống.
- Thực đơn: `pro-menu-admin-v2-acf11b28.webp`, 1165×709; danh mục Món chính, ảnh, giá, trạng thái và các thao tác thật. Crop vùng danh sách, không sửa nội dung hay số liệu.
- URL mới có hash tránh cache ảnh cũ. Hai file cũ không còn được mapping công khai sử dụng; giữ file lịch sử không đồng nghĩa ảnh cũ còn xuất hiện trong gallery.
- Bảng đầy đủ vai trò/tab/thiết bị/alt/caption/file/SHA256: [mapping.json](gallery-install/mapping.json). Test kiểm tra đúng 26 nguồn duy nhất và hash của các pixel đã review.

## Giao diện và kiểm thử local

- Thêm section giới thiệu cài ứng dụng từ website, ảnh giao diện thật, CTA dùng thử và `/products/quanpilot/install`.
- Hướng dẫn Android, Safari iPhone/iPad, Chrome/Edge desktop; giải thích tùy hỗ trợ, cần mạng, tên biểu tượng theo nhà hàng, có thể cần đăng nhập lại. Không tạo ảnh giả đã cài, không hứa offline/native store.
- 26/26 tab và lightbox trên desktop/mobile được kiểm tra nguồn ảnh; chụp trực tiếp viewport để đối chiếu. 26 bước Tiếp, 6 vòng Trước và chuỗi Năm → Bàn → Menu → Năm → Bàn đạt.
- 1440/1024/768/390/375px: không tràn ngang (client/scroll lần lượt 1425/1425, 1009/1009, 753/753, 375/375, 360/360; thanh cuộn chiếm 15px).
- Lint, TypeScript, production build: PASS. 14 trang/367 liên kết nội bộ, metadata/canonical/sitemap/404: PASS. CMS ảnh 14 ca trên `qavio_test`: PASS. Test gallery/guide: PASS.
- Những thay đổi Contact đang chờ nghiệm thu thuộc task trước được giữ local, không đưa vào commit/phát hành này.

## PWA production và giới hạn

- Manifest `/thien-dao/admin/manifest.webmanifest`: HTTP200, `display: standalone`, scope `/thien-dao/`, start URL đúng `/thien-dao/admin`, icon theo tenant. Service worker HTTP200; không có offline data cache.
- Phát hiện hai lỗi riêng QuánPilot: fallback Cài App luôn đưa hướng dẫn iPhone, kể cả desktop; icon PNG khai báo 192/512 nhưng production trả 227/605px. Nguyên nhân icon: nhiều resize trong một pipeline Sharp, chỉ resize cuối có hiệu lực trước extend.
- Đã chuẩn bị bản sửa local Restaurant: hướng dẫn theo thiết bị, xử lý prompt lỗi, dọn listener; render icon bằng hai pipeline và canvas kích thước chính xác. Test 7 trường hợp thiết bị và 6 trường hợp icon (ngang/dọc/nhỏ ×192/512) PASS; lint và TypeScript PASS. Báo cáo riêng `D:/anh/Restaurant/docs/PWA_INSTALL_AUDIT.md`.
- **Chưa phát hành Restaurant.** Không thay auth/session/OAuth/QR/order/payment/subscription/schema/dữ liệu. Cần nghiệm thu riêng bản PWA trước phát hành.
- Chỉ có Browser Codex, không có trình cài native Chrome/Android/iOS. Chủ dự án trả lời “Chưa thử được — ghi rõ phần chưa kiểm chứng”. Vì vậy cài thật, mở lại từ OS và session trong ứng dụng đã cài **chưa kiểm chứng**, không suy diễn từ manifest hoặc nút hiện trên UI.

## Phát hành QAVIO

Đang chuẩn bị CI image-only. Chỉ đánh dấu production hoàn tất sau khi có SHA, checksum, backup/restore, capacity, deploy và browser smoke thật; sẽ bổ sung bằng chứng cuối ở đây.
