# Chuẩn bị VPS QAVIO — 20/10/2026

## Môi trường đã kiểm tra

- Domain do chủ dự án cung cấp: `qavio.longh.org`.
- Ubuntu 26.04 x86_64; Docker Engine và Compose đã có sẵn.
- Checkout mới: `/opt/websites/qavio`, origin GitHub `herry-huynhlong/qavio`.
- Restaurant đang dùng loopback 3000; portfolio dùng 3010. Chọn loopback **3100** riêng cho QAVIO.
- RAM khoảng 1 GB, swap 2 GB; cần giới hạn tài nguyên khi build. Không chạy prune cache/image chung.
- DNS trả địa chỉ Cloudflare. Kiểm tra HTTPS ban đầu trả 526; chứng chỉ `longh.org` hiện có không bao gồm `qavio.longh.org`.
- Không lưu credential SSH trong repo. Không đọc private key TLS hoặc `.env` của các ứng dụng khác.

## Build tách riêng

Builder mới được tạo mà không thay default builder của các ứng dụng khác:

```bash
docker buildx create --name qavio-builder --driver docker-container \
  --driver-opt memory=512m,memory-swap=1536m,cpu-period=100000,cpu-quota=50000
cd /opt/websites/qavio
docker buildx build --builder qavio-builder --load --progress plain \
  -t qavio-web:1471c12 .
```

Thông số trên giới hạn builder 512 MiB RAM, tổng RAM+swap 1536 MiB và 0.5 CPU; không giới hạn hay restart container Restaurant/portfolio. Sau khi build xong có thể `docker buildx stop qavio-builder` để giải phóng tài nguyên chạy; không xóa cache/volume dùng chung.

Compose giới hạn app QAVIO riêng ở 256 MiB RAM, tổng RAM+swap 512 MiB và 0.5 CPU theo mặc định. Có thể điều chỉnh qua các biến `QAVIO_MEMORY_LIMIT`, `QAVIO_MEMORY_SWAP_LIMIT`, `QAVIO_CPUS` trong `.env` QAVIO khi tải thực tế thay đổi; không áp dụng cho service đang chạy của dự án khác.

## Bước mở web cần xác nhận triển khai

Theo yêu cầu gốc phần 24/26, không tự deploy production trước khi người dùng xác nhận. Các bước dưới đây là phương án đã chuẩn bị, không đồng nghĩa đã áp dụng:

1. Xác nhận người dùng đồng ý đưa **bản Giai đoạn A** lên `qavio.longh.org` (chưa có form thật/admin, giữ noindex).
2. Khởi động riêng service QAVIO từ image đã build với `QAVIO_IMAGE_TAG=1471c12`; kiểm tra `/api/health`, trang chủ và asset trên `127.0.0.1:3100`.
3. Tạo webroot `/var/www/qavio-acme`, cài virtual host bootstrap `deploy/qavio.longh.org.http.conf` thành site mới, kiểm tra `nginx -t` rồi reload.
4. Xác minh HTTP-01 path qua domain Cloudflare trước khi yêu cầu chứng chỉ. Không tắt xác minh TLS hoặc hạ chế độ SSL Cloudflare để che lỗi 526.
5. Cấp chứng chỉ **riêng** bằng Certbot webroot cho duy nhất `qavio.longh.org`. Dùng thông tin ACME/account đã được cấp phép trên host hoặc email do chủ dự án xác nhận. Không tự đưa email giả.
6. Thay site QAVIO bằng `deploy/qavio.longh.org.https.conf`, `nginx -t` và reload sau khi test đạt. Không sửa file `longh-sites`.
7. Kiểm tra HTTPS origin theo hostname, HTTPS qua Cloudflare, health, CSS và các domain hiện có. Xác minh renewal timer/hook reload phù hợp với Certbot hiện tại.

Không restart Docker Engine, không đổi subscription/database QuánPilot, không thêm container PostgreSQL trước Giai đoạn C. Automatic deploy khi git push chưa được thiết lập; hiện chỉ có quy trình pull/build/update thủ công trong DEPLOYMENT.md.

## Kết quả chuẩn bị và kiểm tra

- Đã build thành công image Linux `qavio-web:1471c12` trên VPS; Docker build kết thúc mã 0, gồm lint và Next production build.
- Đã chuẩn bị `.env` QAVIO riêng trên host với domain, cổng và image tag; không có credential database/email/SSH trong Git.
- Test bằng container tạm `qavio-smoke`, user `node`, RAM 256 MiB, restart=no, chỉ publish `127.0.0.1:3101`.
- Trang chủ, CSS và `/api/health`: HTTP 200. Health trả `status=ok`, `service=qavio` cả từ trong container và host loopback.
- Đã dừng và xóa container tạm; builder QAVIO đã dừng. Image/cache build được giữ lại cho bước triển khai.
- `nginx -t` cấu hình hiện tại: PASS. HTTP template: PASS trong main config tạm. HTTPS template: PASS kiểm tra cú pháp với đường dẫn chứng chỉ hiện có **chỉ trong file tạm**; chứng chỉ mới QAVIO vẫn chưa được cấp.
- Restaurant trả HTTP 307 (redirect), portfolio HTTP 200 sau kiểm tra. Các container sẵn có vẫn chạy; không chỉnh file virtual host hiện hành, không reload Nginx, không restart dịch vụ cũ.
- Git checkout VPS đã cập nhật cấu hình chuẩn bị. Còn khoảng 3.2 GB đĩa trống sau build; không prune cache/image chung.
- **Chưa mở website QAVIO công khai; chưa cấp TLS riêng; chưa bật deploy tự động.** Chờ xác nhận triển khai theo yêu cầu gốc.
