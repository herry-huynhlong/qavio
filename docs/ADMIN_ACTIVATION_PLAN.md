# Phương án chờ duyệt — chỉ cấu hình QAVIO, không build

Chưa áp dụng bất kỳ bước nào lên production. Proxy hiện thiếu secret/header xác thực và body limit chỉ 1m; theo yêu cầu phải dừng trước sửa proxy hoặc bootstrap.

## Các thay đổi dự kiến

1. Sao lưu cấu hình QAVIO hiện tại vào vị trí private; tạo archive DB/media hiện tại bằng ops image c205bbd, mã hóa với public key hiện có. Dừng ghi riêng QAVIO trong cửa sổ backup ngắn, giữ DB chạy; copy archive về local, kiểm SHA và restore DB mới cô lập. Giữ nguyên bản cũ và private key off-host.
2. Thêm secret ngẫu nhiên ≥32 bytes vào env private QAVIO và include Nginx permission600, không Git/log/argv. Nginx **ghi đè** X-Qavio-Proxy-Secret và X-Qavio-Client-IP; không tin header do khách tự gửi.
3. Sửa **riêng** TLS virtual host `/etc/nginx/sites-available/qavio.conf`: upstream vẫn loopback3100, protocol HTTPS, upload6m, timeout75s và tắt proxy cache. Giữ HTTP ACME/redirect và chứng chỉ hiện có.
4. Do domain qua Cloudflare: chỉ lấy real IP từ CIDR Cloudflare chính thức đã xác minh, scoped vào QAVIO TLS server. Dự kiến giới hạn ingress HTTPS của riêng QAVIO về Cloudflare + loopback qua điều kiện trên peer gốc; không đổi firewall toàn host hoặc domain khác. Nguồn CIDR phải xác minh lại lúc áp dụng: [IPv4](https://www.cloudflare.com/ips-v4), [IPv6](https://www.cloudflare.com/ips-v6) (đã đọc 15 IPv4/7 IPv6 ngày20/10). Truy cập trực tiếp origin từ bên ngoài sẽ bị từ chối cho QAVIO; public qua Cloudflare và origin health từ loopback vẫn được phép.
5. Thêm cấu hình log riêng QAVIO: chỉ timestamp/method/route group/status/duration; không URL query, email, token, cookie hay header secret. Các biến/map/geo/log_format đặt tên riêng QAVIO và chỉ được site QAVIO sử dụng. Không đổi access log site khác.
6. `nginx -t` trước graceful reload Nginx; không restart Nginx/Docker Engine hoặc container khác. Nếu syntax/HTTPS/proxy health sai thì dừng, khôi phục cấu hình proxy QAVIO đã sao lưu và kiểm lại; không rollback database.
7. Kiểm tra secret/header boundary, origin HTTPS, readiness, media owner/quyền. Không bật Admin/CMS ở bước sửa proxy. Cần recreate **web QAVIO** để nhận proxy secret; worker chưa cần nhận vì email/admin vẫn đóng. Không build/pull image hoặc restart DB.
8. Chuẩn bị CLI nhập credential, sau đó dừng cho chủ dự án nhập. Dùng CLI bootstrap đã có qua SSH TTY hoặc stdin an toàn, xác nhận production/qavio_prod/qavio-postgres, roleqavio_app. Email/tên nhập trong terminal, password không echo; không ghi file credential, password vào argv, terminal transcript hoặc báo cáo. Chỉ chạy bootstrap khi chủ dự án đồng ý thao tác và tự nhập thông tin. Không dùng mật khẩu SSH làm password admin.
9. Sau bootstrap hợp lệ và chấp thuận bật flag: đổi riêng hai dòng overlay từ false sang `${QAVIO_ADMIN_ENABLED:-false}` / `${QAVIO_CMS_ENABLED:-false}`; đặt hai biến true trong env Compose và runtime private. Các flag forms/policy/indexing/provider/legal/data-request giữ nguyên. Không chỉ sửa env_file vì overlay hiện hardcode false.
10. Dùng đủ ba file Compose để recreate riêng web (không --build, không --force-recreate DB). Kiểm merged config bằng output whitelist; health/readiness, secure cookie/CSRF, login/logout, audit và trang Admin. Rollback cấu hình web về flags false nếu không đạt, giữ mọi dữ liệu/tài khoản đã tạo, không rollback DDL/restore DB.

## Dữ liệu thử chưa được phép publish

Chưa có nội dung public test được duyệt. Có thể chuẩn bị đề xuất một bài thử có nhãn rõ ràng, slug không trùng nội dung thật và ảnh không phải logo, nhưng phải trình nội dung cụ thể và thời gian hiển thị để duyệt trước publish. Draft/preview không được ghi như đã chứng minh publish/unpublish production.

## Phê duyệt cần trước mắt

Cập nhật: hai phê duyệt đã nhận và đã thực hiện proxy/backup, chủ dự án bootstrap qua Termius, agent bật Admin/CMS bằng image hiện có. Phần xin duyệt bên dưới là lịch sử. Hiện chờ chủ dự án đăng nhập cho nghiệm thu CMS; publish QA vẫn cần duyệt nội dung/thời gian riêng.

Chỉ xin duyệt **bước1–7 và chuẩn bị kênh nhập an toàn bước8**. Không bootstrap, bật Admin/CMS hoặc publish public chỉ từ phê duyệt sửa proxy/backup. Bước8 cần credential do chủ dự án nhập, bước9 cần xác nhận thao tác cụ thể sau các điều kiện đạt. Không tự phát triển D6.
