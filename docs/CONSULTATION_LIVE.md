# CONTACT/DEMO tiếp nhận trực tiếp — 21/10/2026

Chủ dự án trực tiếp yêu cầu bỏ bước chờ duyệt chính sách và đưa luồng tư vấn vào hoạt động. Quyết định này thay thế trạng thái chờ thông tin trong báo cáo trước, riêng CONTACT/DEMO. Không tuyên bố chính sách pháp lý đã được duyệt.

## Chức năng
Họ tên, điện thoại, lời nhắn tùy chọn, checkbox đồng ý ngắn và liên kết thông tin bảo mật. API lưu Lead PostgreSQL; Admin xem chuông, chi tiết, gọi điện và đánh dấu đã liên hệ. Không cần email/SMTP và không tạo outbox. Giữ validation, chống spam, idempotency, phân quyền và dữ liệu riêng tư. Chấp nhận phiên bản consent mới và payload cũ. Không lưu PII vào localStorage.

Công tắc riêng QAVIO_CONSULTATION_FORMS_ENABLED cho CONTACT/DEMO. PUBLIC_FORMS và DATA_POLICY_APPROVED vẫn false; QUOTE, PRODUCT_INQUIRY, newsletter, SMTP, indexing không mở. Số chính thức 0935269851; chưa có URL Zalo nên giữ ẩn. Trang privacy chỉ mô tả cách dùng dữ liệu; không tự tạo thông tin pháp lý/địa điểm/thời hạn.

## Kiểm tra trước triển khai
Lint, TypeScript, production build đạt. Integration C 29/Admin 31/Contact 14 đạt. HTTP kiểm tra cả phiên bản consent cũ/mới, CONTACT/DEMO, chống gửi trùng, không outbox và kênh newsletter đóng đạt. Browser trên DB test cô lập: CONTACT với lời nhắn trống gửi thành công, chuông tăng và hiển thị đúng yêu cầu; kiểm tra responsive từ 304px.

Backup trước triển khai được tải ngoài VPS và restore cô lập đạt: SHA256 1743d5cd25c1e8af33084ea11cd3fefc06200deb7d53e91ffd500a365925748d, đủ 5 migration, đối soát toàn vẹn dữ liệu và ảnh. Không có migration mới và không restore production.

## Triển khai
Đang chuẩn bị phát hành; chưa xác nhận mở production tại thời điểm commit này. Bổ sung SHA, CI, image và kết quả website sau khi triển khai thực tế. Build Linux qua GitHub Actions, chỉ recreate QAVIO web; giữ worker/DB/container khác, image rollback và secrets hiện có.
