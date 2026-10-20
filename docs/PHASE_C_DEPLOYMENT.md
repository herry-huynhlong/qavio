# Triển khai C — qavio.longh.org

Ngày 20/10/2026, sau nghiệm thu local, chủ dự án yêu cầu “oke cho lên web”. Được phép commit/push và deploy; giữ đóng tiếp nhận khách hàng thật, privacy/terms là dự thảo, email chưa cấu hình, indexing tắt. Không triển khai D hoặc sửa Restaurant/portfolio.

## Cấu hình phát hành

- Dùng `compose.yaml` cùng `compose.production.yaml`, project `qavio`.
- Web image target `runner`; operations image target `operations` gồm CLI migration và worker.
- PostgreSQL service `qavio-postgres`, database `qavio_prod`, volume `qavio_production_data` thuộc riêng project; không publish cổng database ra host.
- Role bootstrap/migration `qavio_owner`, role runtime `qavio_app` chỉ CONNECT/USAGE và CRUD bảng. Runtime không có quyền tạo schema objects hoặc sửa `_prisma_migrations`.
- Secrets sinh ngẫu nhiên trên host trong `.env.database`, `.env.production`, `.env.migration`, permission 600; không dùng credential Restaurant hay commit các file này.
- Web và worker chỉ nhận env runtime; owner credential chỉ dành cho migration/database. Migration entry point kiểm tra approval flag, environment production, host service, database và role chính xác rồi chạy `migrate deploy`; không reset/drop.
- Web giữ 256 MiB; PostgreSQL 128 MiB; worker 128 MiB, mỗi service có giới hạn CPU/swap và log rotation. Builder riêng `qavio-builder` giới hạn như VPS_SETUP; dừng builder sau build.
- Giữ image B, bản sao `.env` QAVIO cũ và không chạy prune/restart Docker Engine.

## Quy trình

Kiểm tra working tree VPS sạch, tài nguyên và trạng thái Restaurant/portfolio trước cập nhật. Pull fast-forward đúng source commit. Build/tag hai images bằng builder riêng, kiểm tra web bằng container tạm loopback 3101 trước thay service chính.

Khởi tạo PostgreSQL riêng, chạy migration có guard, kiểm tra role/tables và tạo backup schema/database ban đầu. Web chỉ chuyển sang C sau các bước này. Khởi động worker với provider disabled để xác minh không gửi giả. Kiểm tra HTTPS/health/assets/pages/form status và POST bị chặn, rồi so sánh dịch vụ cũ.

## Vận hành sau phát hành

```bash
cd /opt/websites/qavio
docker compose -f compose.yaml -f compose.production.yaml ps
docker compose -f compose.yaml -f compose.production.yaml logs --tail=30 worker
# Backup QAVIO riêng; dùng umask 077 và lưu ngoài Git.
umask 077
mkdir -p backups
docker compose -f compose.yaml -f compose.production.yaml exec -T qavio-postgres pg_dump -U qavio_owner qavio_prod | gzip > backups/qavio-prod-$(date -u +%Y%m%dT%H%M%SZ).sql.gz
```

Backup local host không thay thế backup ngoài máy hoặc kiểm thử restore. Chưa mở thu thập dữ liệu thật trước khi duyệt policy, retention, provider, trusted proxy và vận hành backup/restore. Không tự bật flags chỉ vì build/deploy thành công.

## Rollback

Giữ PostgreSQL/volume mới; không rollback destructive migration. Nếu web C lỗi, dùng image `qavio-web:rollback-before-c` với cấu hình web A/B đã lưu, giữ cùng loopback 3100; chỉ recreate service web. Dừng riêng worker C nếu cần. Không chạy compose down/prune hoặc sửa Restaurant/portfolio.

```bash
cd /opt/websites/qavio
docker compose -f compose.yaml -f compose.production.yaml stop worker
QAVIO_IMAGE_TAG=rollback-before-c docker compose --env-file .env.before-c-570f8f7 -f compose.yaml up -d --no-deps --no-build --wait web
curl --fail http://127.0.0.1:3100/api/health
```

## Kết quả

**Đã triển khai và xác minh ngày 20/10/2026.** Source ứng dụng: `570f8f729ffbb0d7671c8c48ccfbfbf81ac0bfb5`. Commit tài liệu sau đó không yêu cầu build lại ứng dụng.

- GitHub main đã nhận source C; checkout VPS đã fast-forward, không reset hay ghi đè thay đổi cũ.
- Images Linux: `qavio-web:570f8f7` và `qavio-operations:570f8f7`. Docker build đã chạy lint, Prisma generate, TypeScript và Next production build thành công.
- `qavio-web-1` healthy, chỉ bind `127.0.0.1:3100`; `qavio-qavio-postgres-1` healthy, chỉ port nội bộ; `qavio-worker-1` chạy, restart count 0 tại lần kiểm tra cuối.
- Volume thực tế: `qavio_qavio_production_data`, không dùng volume/database Restaurant. Cả ba migration đã áp dụng thành công vào `qavio_prod`.
- Prisma trong **image web standalone** kết nối thật bằng `qavio_app`: database đúng, không CREATE schema objects, không INSERT bảng `_prisma_migrations`; Lead và NewsletterSubscriber đều 0. Không tạo dữ liệu khách hàng hoặc lead thử trên production.
- Container thử trước chuyển service: 14 trang / 371 liên kết nội bộ, metadata/sitemap/404/logo PASS. Container thử đã dừng và xóa.
- Sau chuyển service: 16 route gồm 14 trang công khai và hai trang newsletter trả HTTP 200; health qua loopback, origin TLS có xác minh hostname và domain qua Cloudflare PASS.
- Kiểm tra độc lập từ máy local bằng curl/Node: 14 trang HTTPS/noindex, CSS, logo, sitemap, robots và health PASS; API listing không tồn tại trả 404. Probe Python urllib nhận 403; kiểm tra curl, Node và trình duyệt đều thành công, không thay đổi bảo vệ Cloudflare để xử lý probe này.
- `/api/forms/status`: `enabled=false`, `emailConfigured=false`, `testing=false`; POST contact với body rỗng trả `503 FORMS_NOT_ENABLED`. Đây là trạng thái đóng có chủ đích, không phải form gửi thành công.
- Worker thực tế báo `processed=0`, `EMAIL_NOT_CONFIGURED`; chưa gửi/kiểm chứng email thật. Không tự CONFIRMED subscriber.
- Trình duyệt thật mở `/request-quote`, hiển thị đúng trạng thái đóng, nút gửi disabled, không có console error/warning ở lần kiểm tra. Ảnh xác minh được lưu trong artifact chat.
- Các secret files đều permission 600. Initial backup `backups/qavio-prod-initial-570f8f7.sql.gz` đã tạo, kiểm tra gzip PASS; **chưa kiểm thử restore hoặc backup ngoài máy**.
- Rollback image B `qavio-web:rollback-before-c` và `.env.before-c-570f8f7` được giữ. Builder QAVIO đã dừng; default builder không thay đổi. Không prune/restart Docker Engine.
- Container ID và StartedAt của Restaurant app/maintenance/PostgreSQL và portfolio trước/sau chuyển phiên bản khớp hoàn toàn. Restaurant HTTP 307 và portfolio HTTP 200 như trước. `nginx -t` PASS; không sửa/reload virtual host hiện có.
- Tại lần kiểm tra sau triển khai: còn khoảng 9,2 GiB đĩa và 516 MiB RAM available; chưa phải kiểm thử tải production.

Production giữ `QAVIO_PUBLIC_FORMS_ENABLED=false`, `QAVIO_DATA_POLICY_APPROVED=false`, `EMAIL_PROVIDER=disabled`, `SITE_INDEXING_ENABLED=false`. Chờ duyệt chính sách/thông tin công ty, provider, trusted proxy và backup/restore trước mở thu thập dữ liệu thật. Không triển khai Giai đoạn D.
