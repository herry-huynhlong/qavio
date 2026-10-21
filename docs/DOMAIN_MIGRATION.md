# Chuyển QAVIO sang qavio.site — 21/10/2026

Đang triển khai, chưa nghiệm thu hoàn tất. Tạm dừng phát triển tính năng khác theo yêu cầu chủ dự án.

Kiến trúc: một Next.js backend/frontend/Admin, một PostgreSQL QAVIO. Website https://qavio.site; Admin https://admin.qavio.site/admin, root302→/admin. API Admin và cookie ở hostname Admin, API Contact ở hostname public. Không thêm dịch vụ Admin, database hoặc thanh toán. Public /admin chuyển sang subdomain; public /api/admin không phục vụ Admin API. Không cần CORS chéo domain; trình duyệt gọi API tương đối cùng origin. Cookie __Host- HttpOnly/Secure/SameSite=Strict, Path=/, không có Domain. Đăng nhập lại tại hostname mới; không sao chép cookie domain cũ.

APP_ORIGIN=https://qavio.site; SITE_URL=https://qavio.site; QAVIO_ADMIN_ORIGIN=https://admin.qavio.site. Admin CSRF chỉ chấp nhận origin Admin, public form chỉ chấp nhận public origin. Fallback local vẫn cùng APP_ORIGIN nếu chưa đặt QAVIO_ADMIN_ORIGIN. Chặn origin cũ/ngoại lai. Metadata/canonical/OpenGraph/JSON-LD/sitemap/robots dùng SITE_URL; giữ noindex. Contact/DEMO giữ mở; trial, email, QUOTE/newsletter/indexing không bật.

Tất cả text/JSON PostgreSQL public schema đã được quét:0 bản ghi chứa qavio.longh.org. Không migration/UPDATE dữ liệu hoặc xóa tài khoản. URL email lấy APP_ORIGIN; provider disabled nên không gửi email. Google OAuth chưa có provider/client thật và trial đang tắt; callback Google nằm ở QuánPilot demo.longh.org, không chuyển domain QuánPilot. QuánPilot có biến QUANPILOT_TRIAL_QAVIO_ORIGIN cũ trong overlay tắt, cần đồng bộ cấu hình khi được phép cập nhật runtime QuánPilot; không mở trial.

Kế hoạch: backup config/env + dump/media mã hóa; cấp chứng chỉ SAN cho cả2hostname bằng webroot Certbot; Nginx chỉ graceful reload sau nginx -t. Build Linux qua CI ngoài VPS vì cần sửa Admin origin; giữ image41218f7 rollback. Dùng ứng viên tạm loopback để kiểm tra/switch upstream rồi recreate service web, tránh ngắt lưu lượng khi đổi container. Không build/prune/down -v/xóa volumes. Worker chỉ cập nhật runtime origin bằng image hiện có; PostgreSQL/Restaurant/Portfolio giữ nguyên.

Chỉ bật301 domain cũ sau public/Admin domain mới vượt qua HTTP/TLS/origin/cookie/health tests. Các deploy/qavio.longh.org.* là tham chiếu rollback lịch sử, không dùng cho domain mới. Tài liệu phase cũ và backup giữ hostname lịch sử, không sửa chứng cứ thành domain mới.

Cloudflare: chưa có quyền/API token, không đổi DNS hay SSL setting. Chủ dự án cần xác nhận SSL/TLS → Overview → Full (strict) cho zone qavio.site sau khi origin có cert hợp lệ; kiểm Universal SSL bao phủ qavio.site và *.qavio.site. Không dùng Flexible. Cache Rules phải bypass /admin*, /api/*, /media/* trên admin hostname; không bật Cache Everything cho Admin/API. Tham khảo https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/ . Không tuyên bố đã xác minh mode khi chưa đọc được dashboard/API.

Đăng nhập/đăng xuất tài khoản chủ dự án trên production phải được chủ dự án thực hiện hoặc nhập credential qua CLI ẩn. Agent không biết mật khẩu Admin và không reset/bootstrap hoặc tạo QA production để thay thế. Test local có thể xác minh vòng đăng nhập/session/đăng xuất trên DB cô lập; chưa thay thế nghiệm thu tài khoản thật.

Bằng chứng production, SHA, disk/container, rollback và file thay đổi sẽ cập nhật sau rollout. Chưa được coi hoàn thành khi còn bước kiểm chứng quan trọng.
