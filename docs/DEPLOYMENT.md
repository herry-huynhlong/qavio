# Đưa QAVIO lên VPS bằng Docker

## Trạng thái bản này

Repo có Dockerfile multi-stage, Next standalone, container chạy bằng user `node`, health check, Compose riêng tên `qavio`, mẫu Nginx. Website Giai đoạn A đã được triển khai lên **https://qavio.longh.org** ngày 20/10/2026 sau khi chủ dự án xác nhận; chưa có database/admin/form thật. Xem `VPS_SETUP.md` để biết trạng thái vận hành.

Push GitHub chỉ cập nhật source. **Chưa có automatic deploy khi push.** Chỉ thiết lập tự động sau khi xác nhận VPS, domain, quyền triển khai và quy trình rollback. Không lưu SSH key/token/mật khẩu vào Git.

## Chuẩn bị trên VPS

- VPS Linux có Git, Docker Engine và Docker Compose plugin. Cài theo hướng dẫn chính thức phù hợp bản phân phối, không tự thay cấu hình Docker đang chạy Restaurant.
- Chọn thư mục QAVIO riêng; ví dụ bên dưới dùng `/opt/websites/qavio`. Không chạy các lệnh trong `/opt/websites/restaurant`.
- Reverse proxy Nginx chạy trên host, domain đã trỏ DNS về VPS, chứng chỉ TLS riêng cho domain QAVIO.
- Xác nhận cổng 3100 còn trống. Nếu không, đổi `QAVIO_HTTP_PORT` và upstream của Nginx cho khớp.
- Nếu repository private, cấu hình tài khoản Git hoặc deploy key chỉ đọc trên VPS. Không đặt token trong URL clone, command history hay Compose.

## Lần đầu triển khai — chỉ chạy khi môi trường đã được xác nhận

```bash
git clone https://github.com/herry-huynhlong/qavio.git /opt/websites/qavio
cd /opt/websites/qavio
cp .env.example .env
```

Sửa `.env` theo domain/cổng của QAVIO. `SITE_URL` là cấu hình dự kiến cho SEO ở B, hiện A chưa xuất canonical; không dùng nó như bằng chứng website đã được cấu hình domain đầy đủ. Bản hiện tại không cần credential database/email.

```bash
docker compose config --quiet
docker compose build web
docker compose up -d --no-deps --wait --wait-timeout 120 web
docker compose ps
curl --fail http://127.0.0.1:3100/api/health
curl --fail --head http://127.0.0.1:3100/
docker compose logs --tail=100 web
```

Container chỉ publish `127.0.0.1:3100`; truy cập từ Internet phải qua reverse proxy. Không thêm mapping công khai database; A chưa có database nên không tạo container PostgreSQL rỗng cho có.

## Domain và HTTPS

1. Dùng `deploy/nginx.conf.example` làm **virtual host mới** cho QAVIO, thay `example.com` bằng domain được xác nhận.
2. Kiểm tra đường dẫn site/config và cơ chế certificate manager đang dùng trên VPS trước khi cài file. Không ghi đè default hoặc cấu hình Restaurant.
3. Chạy `nginx -t` trước khi reload Nginx; chỉ reload sau khi kiểm tra thành công và được xác nhận triển khai trên host đó.
4. Cấp chứng chỉ và cấu hình HTTPS bằng công cụ hiện có trên VPS. Kiểm tra `https://<domain>/` và `/api/health`, redirect HTTP sang HTTPS sau khi TLS hoạt động.

Mẫu Nginx chỉ dùng cho proxy trên host. Nếu proxy chạy trong Docker, cần thiết kế network riêng phù hợp; `127.0.0.1` trong container proxy không trỏ về host/container QAVIO.

Giữ noindex ở Giai đoạn A. Khi sẵn sàng công bố, cần duyệt metadata/domain, sitemap, nội dung và gỡ đồng thời chặn trong `next.config.ts`, metadata `layout.tsx` và `robots.ts`. Không tự gỡ chỉ vì đã gắn domain.

## Cập nhật và rollback thủ công

Thao tác tại checkout QAVIO; dừng nếu có thay đổi local trên VPS. Dùng merge fast-forward, không reset cưỡng bức.

```bash
cd /opt/websites/qavio
git status --short
# Tiếp tục khi working tree sạch.
git fetch origin
git merge --ff-only origin/main

# Giữ image đang chạy để có thể quay lại, nếu đây không phải lần đầu.
OLD_ID=$(docker compose images -q web)
if [ -n "$OLD_ID" ]; then docker image tag "$OLD_ID" qavio-web:rollback; fi

docker compose build web
docker compose up -d --no-deps --wait --wait-timeout 120 web
docker compose ps
curl --fail http://127.0.0.1:3100/api/health
```

Nếu phiên bản mới lỗi và có image rollback:

```bash
QAVIO_IMAGE_TAG=rollback docker compose up -d --no-deps --no-build --wait --wait-timeout 120 web
curl --fail http://127.0.0.1:3100/api/health
```

Giữ nguyên `QAVIO_HTTP_PORT` khi rollback. Không chạy `docker system prune`, `docker compose down` ở project khác, xóa volume hoặc restart container Restaurant. Đây là rollback image cho A; khi có database cần thêm kế hoạch tương thích migration và backup.

## Kiểm tra và giới hạn

- Local có Docker CLI/Compose nhưng Docker Engine chưa chạy. Sau đó image Linux đã được build và kiểm tra bằng container tạm trên VPS; xem `VPS_SETUP.md`.
- Có thể validate `docker compose config --quiet` khi engine tắt.
- Đã xác minh home/CSS/health HTTP 200 trên loopback bằng container thử Linux. Chưa kiểm tra đường truy cập QAVIO qua Nginx/HTTPS vì chưa công bố website.
- `pnpm lint` và `pnpm build` (gồm TypeScript): PASS sau khi thêm standalone/health route.
- `docker compose config --quiet`: PASS; chỉ có service `web`, project `qavio`.
- `pnpm start` chạy standalone local: trang chủ, `/api/health` và CSS đều trả HTTP 200.
- `git diff --cached --check`: PASS. Không stage file `.env` thật; kiểm tra mẫu private key/token phổ biến không phát hiện kết quả.
- Docker build cũng chạy lint và build. Kiểm tra local standalone không thay thế build/run image Linux.
- PostgreSQL, migration, email, backup dữ liệu khách và admin được bổ sung ở C–E, tách biệt hoàn toàn QuánPilot.

Tham khảo: [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [Docker Next.js guide](https://docs.docker.com/guides/nextjs/), [Docker Compose](https://docs.docker.com/compose/).
