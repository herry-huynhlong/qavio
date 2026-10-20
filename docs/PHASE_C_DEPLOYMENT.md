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

## Kết quả

Đang triển khai; chưa ghi PASS cho kiểm tra chưa chạy. Kết quả thực tế và source commit sẽ được cập nhật sau xác minh.
