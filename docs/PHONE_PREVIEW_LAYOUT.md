# Thu gọn preview điện thoại QuánPilot — 27/10/2026

- Phạm vi: chỉ CSS `.demo-device-phone` trong gallery `/products/quanpilot`. Trước khung khoảng390px/887px; sau max-width260px, preview ảnh520px, nút/nhãn tổng tối đa560px. Căn giữa bằng width/max-width/margin, không dùng scale hoặc để khoảng chiếm chỗ cũ.
- Mobile dùng `svh`: chiều cao ảnh min(520px,68svh−48px), container/nút giới hạn68svh, chiều rộng co theo100% và chiều cao màn hình. Nhãn1dòng ellipsis/cỡ11px cao38px để mọi chức năng nhất quán; tên đầy đủ vẫn nằm trong aria-label và tiêu đề lightbox.
- Ảnh thật không thay đổi byte, width/height gốc. `object-fit:cover; object-position:center top` chỉ crop preview. Lightbox ảnh gốc, zoom và cuộn độc lập, không bị selector preview ảnh hưởng. Dashboard/Báo cáo/tablet không đổi quy tắc.
- Đã kiểm1440/1024/768/390/375, body không tràn ngang; preview desktop258×558 client (outer260×560); mobile dưới68vh. Nút mở, next, ArrowRight, zoom/kích thước gốc, cuộn và Escape hoạt động; ảnh375×812 gốc giữ nguyên. Chứng cứ `docs/phone-preview/`.
- Lint/TypeScript/production build local PASS. Local có bản Contact đang chờ duyệt; **chỉ stage/commit CSS và tài liệu task ảnh**, CI Linux sẽ build đúng committed source, không bao gồm Contact. Không sửa hoặc deploy QuánPilot, không schema/migration/flags.
- Trạng thái phát hành: đang chuẩn bị CI/review image-only, chỉ ghi hoàn thành khi domain production kiểm chứng.
