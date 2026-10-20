# QAVIO — Hoàn thiện tư vấn và quản trị khách hàng

Bắt đầu theo lịch 23:58 ngày20/10/2026 (Asia/Bangkok). Chủ dự án phê duyệt push/deploy sau kiểm tra trong tin nhắn đặt lịch. Đây không phải phê duyệt chính sách dữ liệu. Chỉ làm repository `D:\anh\qavio`.

## Kết quả chức năng

- `/request-demo` và `/contact`: ba trường họ tên/điện thoại/lời nhắn, consent bắt buộc. Gửi thật ở môi trường test, thành công hiển thị đúng “QAVIO đã nhận được thông tin của bạn. Chúng tôi sẽ liên hệ qua số điện thoại bạn cung cấp.” Lỗi giữ input; không lưu PII trong browser storage.
- Backend lưu PostgreSQL bảng `Lead`, consent và nguồn `DEMO`/`CONTACT`, trạng thái mặc định `NEW`; `LeadActivity` giữ lịch sử. Email nullable; CONTACT/DEMO không tạo EmailOutbox và không cần SMTP. Validation, idempotency, rate limit, honeypot giữ nguyên; newsletter/contact settings không phải điều kiện nhận lead.
- `/admin/leads` — **Liên hệ khách hàng**: bảng mặc định khách hàng/số/lời nhắn/ngày/trạng thái; mới nhất trước. Có tìm tên/số, bộ lọc, chi tiết, tel, **Sao chép số điện thoại**, **Đánh dấu đã liên hệ**, ghi chú, phân công và lịch sử. Trạng thái hiển thị tiếng Việt, backend enum không đổi. Tổng quan có **Yêu cầu mới**; số đếm lấy DB khi tải/làm mới, không có polling realtime.
- `/admin/settings` → **Thông tin liên hệ**, hoặc menu riêng `/admin/settings/contact`, luôn có với SUPER_ADMIN kể cả dữ liệu trống. Có số QAVIO/số hiển thị/Zalo, ba checkbox bật gọi/Zalo/cụm nổi, trạng thái **Chưa cấu hình**, hướng dẫn và **Lưu thay đổi**. Lưu cập nhật public ngay, không còn phải tìm nút xuất bản trong trình biên tập chung. PostgreSQL `ContentEntry CONTACT/company` dùng chung contact/footer/widget; revision và audit `CONTACT_CHANNELS_UPDATED`.
- API GET/PATCH `/api/admin/settings/contact`: SUPER_ADMIN, session/Origin/CSRF; validation server, version conflict409 và advisory lock. Lưu nháp cũ vào revision trước khi công bố chỉ các trường kênh vừa nhập; không xuất bản body/SEO/media/địa chỉ/email nháp hoặc QA vô tình. Giữ các trường legacy đã công khai. Không sửa flag policy.
- Public navy/vàng kim và logo giữ nguyên. Widget chỉ public, dùng liên kết thật đã lưu, nút không cấu hình/tắt thì ẩn; Admin vẫn luôn có cấu hình. Không gọi điện hoặc mở tài khoản Zalo thử. Số production0935269851, chưa có URL Zalo chính thức nên ẩn Zalo.
- Menu Bài viết/Nội dung website/Tài khoản giữ nguyên nghiệp vụ; thêm lối vào **Hình ảnh** `/admin/media` để xem kho ảnh và mở ảnh theo phân quyền, tải/gắn ảnh tiếp tục dùng trình biên tập hiện có; không thiết kế lại Admin, không tích hợp dịch vụ trung gian, thanh toán hoặc QuánPilot.

## Kiểm thử

- Lint, TypeScript, production build PASS. Một build đầu bị DLL sharp khóa bởi server test cũ; đã dừng đúng process QAVIO local, build lại đạt, không kill dịch vụ khác.
- PostgreSQL C29checks, Admin31checks, Contact12checks PASS. Hai check bổ sung bao phủ trang setting trống, RBAC, lưu public/audit/version conflict/race, Zalo giả và ngăn xuất bản nội dung nháp ngoài phạm vi.
- Compiled HTTP APIs PASS: hai POST tạo một Lead không email, không outbox; newsletter đóng; Origin/public data protected. Compiled Admin HTTP11checks PASS, gồm GET/PATCH setting mới, public cập nhật liên kết/tắt liên kết, các route và vai trò. Public14trang/371internal links, SEO/sitemap/404/logo PASS.
- Browser E2E trên `qavio_test`: submit DEMO tổng hợp → thành công đúng câu → DB đúng một Lead/email null/no outbox → đăng nhập SUPER_ADMIN test → hàng mới nhất hiện đúng tên/số/lời nhắn → copy số thành công → ghi chú + đánh dấu đã liên hệ → mở lại thấy trạng thái/lịch sử, DB xác nhận CONTACTED/1note/0outbox. Không nhận/gửi email thật.
- Browser setting trống vẫn đầy đủ; nhập số/Zalo tổng hợp, bật các kênh, Lưu thay đổi thành công; public mobile hiện đúng tel/Zalo ngay. Chỉ test local; không đưa QA vào production. Ảnh bằng chứng trong `.runtime/admin-final-evidence/` (ignored).

## Chính sách và điều kiện mở production

`formsEnabled()` chỉ phụ thuộc tier hợp lệ + `QAVIO_PUBLIC_FORMS_ENABLED=true`; riêng production thêm `QAVIO_DATA_POLICY_APPROVED=true`. SMTP không nằm trong điều kiện này. Guard public từ chối503 khi đóng; giao diện fetch `/api/forms/status`. Newsletter có điều kiện email riêng. Không sửa flag chỉ để nút có vẻ hoạt động.

Hiện `/privacy` là khung dự thảo, consent version `draft-2026-10-20`; chưa có ngày hiệu lực. Cần chủ dự án quyết định cụ thể:

1. Tên đơn vị/cá nhân vận hành, đầu mối và kênh liên hệ xử lý dữ liệu.
2. Phạm vi: họ tên, điện thoại, lời nhắn, nguồn, thời điểm và bằng chứng consent để phản hồi tư vấn; email không bắt buộc; marketing/newsletter tách riêng.
3. Thời hạn lưu Lead/consent/audit/log/backup, cách hết hạn/xóa và người chịu trách nhiệm.
4. Nhà cung cấp/vị trí lưu VPS và backup, người được truy cập, vai trò Cloudflare/hạ tầng, phạm vi chia sẻ; không suy đoán quốc gia lưu trữ.
5. Quy trình xác minh/tiếp nhận sửa, xóa, truy cập, rút đồng ý; đầu mối, thời hạn xử lý và các giới hạn thực tế. Luồng quyền dữ liệu chưa tự động mở.
6. Nội dung chính thức, phiên bản consent/ngày hiệu lực và quyết định cho phép nhận PII thật. Cần rà soát nội dung này trước khi công bố, không tự gắn nhãn đã duyệt.

Đã trình câu hỏi cụ thể trong chat. Chưa có quyết định thì deploy code nhưng giữ intake/policy false, email disabled, newsletter/legal/data-request/indexing đóng. Để mở sau này cần cập nhật bản chính sách/consent đã duyệt, kiểm tra vận hành và cấu hình hai flag intake/policy; nếu xuất bản pháp lý CMS cần phê duyệt tương ứng riêng. Không cần SMTP để mở CONTACT/DEMO.

## Phát hành

Không thay schema hoặc migration mới; production giữ5migration. Backup mới được mã hóa, quiesce ngắn riêng web/worker QAVIO, khởi động lại; SHA256 `5c7dc97958f29448a584a01e3dd1a3ecbdd193d5551579742be4d9112829318d`. Đã copy off-host và restore cô lập PASS lúc00:04:13 ngày21/10/2026, đủ5migration, row counts và1media khớp. Không restore/sửa dữ liệu production.

Chờ CI image/release, deploy riêng web bằng image Linux build ngoài VPS1GB; giữ worker c205bbd, DB, flags, config chính thức và image rollback. Kết quả source SHA/CI/health/HTTP production sẽ cập nhật sau triển khai thực tế. Không coi push Git là đã deploy.
