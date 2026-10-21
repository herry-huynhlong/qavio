# CONTACT/DEMO tiếp nhận trực tiếp — 21/10/2026

Chủ dự án trực tiếp yêu cầu bỏ bước chờ duyệt chính sách và đưa luồng tư vấn vào hoạt động. Quyết định này thay thế trạng thái chờ thông tin trong báo cáo trước, riêng CONTACT/DEMO. Không tuyên bố chính sách pháp lý đã được duyệt.

## Chức năng
Họ tên, điện thoại, lời nhắn tùy chọn, checkbox đồng ý ngắn và liên kết thông tin bảo mật. API lưu Lead PostgreSQL; Admin xem chuông, chi tiết, gọi điện và đánh dấu đã liên hệ. Không cần email/SMTP và không tạo outbox. Giữ validation, chống spam, idempotency, phân quyền và dữ liệu riêng tư. Chấp nhận phiên bản consent mới và payload cũ. Không lưu PII vào localStorage.

Công tắc riêng QAVIO_CONSULTATION_FORMS_ENABLED cho CONTACT/DEMO. PUBLIC_FORMS và DATA_POLICY_APPROVED vẫn false; QUOTE, PRODUCT_INQUIRY, newsletter, SMTP, indexing không mở. Số chính thức 0935269851; chưa có URL Zalo nên giữ ẩn. Trang privacy chỉ mô tả cách dùng dữ liệu; không tự tạo thông tin pháp lý/địa điểm/thời hạn.

## Kiểm tra trước triển khai
Lint, TypeScript, production build đạt. Integration C 29/Admin 31/Contact 14 đạt. HTTP kiểm tra cả phiên bản consent cũ/mới, CONTACT/DEMO, chống gửi trùng, không outbox và kênh newsletter đóng đạt. Browser trên DB test cô lập: CONTACT với lời nhắn trống gửi thành công, chuông tăng và hiển thị đúng yêu cầu; kiểm tra responsive từ 304px.

Backup trước triển khai được tải ngoài VPS và restore cô lập đạt: SHA256 1743d5cd25c1e8af33084ea11cd3fefc06200deb7d53e91ffd500a365925748d, đủ 5 migration, đối soát toàn vẹn dữ liệu và ảnh. Không có migration mới và không restore production.

## Triển khai
Đã push và deploy source `5ef3970275b647226ef8331699fb464f1e201307`, image `qavio-web:5ef3970`. GitHub Actions run `39538498373` đạt; artifact `12317429261`, ZIP digest `sha256:520f9f5726e7b3937e456fdb9b3f7106341bd34342f5c6346718b268ba970851`. Đối soát archive, config, layer, architecture amd64 và revision đạt. Config digest `sha256:a7d79353b73e91774d1ca63a3e7e68ad54d93881e2611235e160f2c6015b324a`; Docker OCI image digest `sha256:6be3d6e99d8231244f62cef10eaa4e0f493c6dd57230e6aaed7b9a5130c186b7`. Chỉ recreate QAVIO web, rollback `qavio-web:e299485`. Worker `c205bbd`, PostgreSQL, Restaurant và portfolio giữ nguyên container/start time/restart count qua deploy. Không chạy migration; số bản ghi ứng dụng giữ nguyên trước QA.

Đã bật CONSULTATION trong cả cấu hình Compose và env production. Status thực tế: enabled=true, quoteEnabled=false, newsletterEnabled=false, emailConfigured=false, testing=false. PUBLIC_FORMS/DATA_POLICY/INDEXING/LEGAL_PUBLICATION/ADMIN_DATA_REQUESTS vẫn false, EMAIL_PROVIDER=disabled, Admin/CMS=true. Không đổi secret hay bootstrap.

HTTP public 14 trang, assets, readiness, noindex, cookie bảo mật, CSRF/Origin và chặn Admin ẩn danh đạt. Browser HTTPS thật: CONTACT lời nhắn trống và DEMO có lời nhắn đều hiện thành công. SQL xác nhận mỗi tên QA đúng một Lead, email NULL, consent phiên bản mới, NEW và outbox tổng bằng 0. Hai yêu cầu được giữ để chủ dự án thấy trong Admin: `QA QAVIO CONTACT 20261021`, `QA QAVIO DEMO 20261021`; số NEW cung cấp cho chuông là 2 tại lúc kiểm tra. Điện thoại QA là số tổng hợp dành cho kiểm thử, không gọi các số này. Không có dữ liệu khách thật được tạo bởi agent.

Phiên Admin production hiện chuyển về login; agent không có mật khẩu Admin nên không khẳng định đã đăng nhập kiểm tra chuông production. Luồng chuông/chi tiết/Đã liên hệ đã đạt browser E2E trên DB test; production xác minh dữ liệu NEW và API ẩn danh bị chặn. Chủ dự án dùng tài khoản đã bootstrap; không thay mật khẩu.

Bằng chứng riêng ngoài Git: `.runtime/consultation-live-evidence/production-demo-success.png`, `production-contact-success-mobile.png`; VPS `.runtime/consultation-live-release/deployed.json` và `live-qa.json`. Local test fixtures đã dọn; Next test và PostgreSQL test đã dừng. Không cần bước phê duyệt chính sách để form này hoạt động.
