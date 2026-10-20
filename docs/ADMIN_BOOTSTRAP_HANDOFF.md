# Quy trình bootstrap lịch sử — đã hoàn tất, không chạy lại

**Cập nhật: chủ dự án đã bootstrap qua Termius; agent đã xác minh một SUPER_ADMIN/audit và bật Admin/CMS lúc19:41 ngày20/10/2026. Không chạy lại CLI bên dưới.** Hiện mở https://qavio.longh.org/admin/login và đăng nhập bằng credential vừa nhập. Hướng dẫn CLI dưới đây giữ làm bằng chứng quy trình trước đó; nghiệm thu CMS có đăng nhập còn chờ chủ dự án.

**Cập nhật nghiệm thu tiếp theo:** chủ dự án đã đăng nhập, các luồng CMS được kiểm và báo cáo tại `docs/ADMIN_PRODUCTION_ACTIVATION.md`. Đã kiểm logout, activeSessions=0; chủ dự án đăng nhập lại để sử dụng. Bài QA được duyệt đã publish35giây rồi gỡ, chín draft còn giữ riêng tư; không chạy bootstrap hoặc publish lại QA.

Chủ dự án đã chọn “Duyệt bootstrap và bật Admin/CMS”. Proxy/backup đã chuẩn bị; **chưa tạo tài khoản và chưa bật Admin/CMS**, đang chờ chủ dự án tự nhập email, tên và mật khẩu qua CLI. Không gửi password trong chat. Không cần duyệt lại hai thao tác này; agent không tự điền credential hoặc chạy thay chủ dự án khi chưa có input an toàn.

## Thao tác đã được duyệt

1. Chủ dự án chạy CLI hiện có để tạo đúng **một SUPER_ADMIN đầu tiên** trên production/qavio_prod/qavio-postgres bằng role qavio_app; CLI khóa transaction, từ chối nếu đã có AdminUser và ghi audit.
2. Sau khi CLI báo thành công, agent kiểm tra bằng metadata/audit (không đọc password/hash/session token), đổi riêng hai flag Admin/CMS=true trong env và overlay interpolation mặc định false; chỉ recreate web QAVIO bằng image c205bbd, đủ ba Compose file.
3. Giữ forms/policy/email/indexing/legal/data-request=false/disabled; không restart DB, build, phát triển D6 hay publish QA. Thất bại thì đóng hai flag, giữ dữ liệu và tài khoản, không restore/reset DB.
4. Chủ dự án đăng nhập ở `/admin/login` bằng mật khẩu vừa nhập; agent có thể tiếp tục nghiệm thu qua tab đã đăng nhập sau khi chủ dự án bàn giao. Không cần agent biết mật khẩu.

## Kênh nhập an toàn

Mở terminal trên máy chủ dự án. Lệnh dưới không chứa email/password/secret:

```powershell
ssh -t root@160.250.5.35 "cd /opt/websites/qavio && docker compose -f compose.yaml -f compose.production.yaml -f compose.release-candidate.yaml run --rm --no-deps -e QAVIO_PRODUCTION_BOOTSTRAP_APPROVED=true worker node --import tsx scripts/bootstrap-admin.ts --production"
```

- SSH dùng host key đã biết; không bỏ qua host-key warning hoặc bật ghi transcript terminal. Password SSH nhập trong prompt SSH, không đưa vào lệnh.
- Ở prompt xác nhận target, nhập đúng `production qavio_prod qavio-postgres`.
- Nhập email SUPER_ADMIN thật và tên hiển thị do chủ dự án chọn.
- Nhập password riêng 12–128 ký tự, không dùng password SSH; CLI **không echo password** và không ghi ra file/log. Không paste credential vào chat hoặc arguments.
- CLI chỉ báo thành công/thất bại; khi thành công chủ dự án báo lại “đã bootstrap” (không gửi password). Nếu dở dang, Ctrl+C rồi báo trạng thái; agent kiểm tra số AdminUser/audit trước khi thử lại.
- Agent chưa chạy lệnh trên. Cờ chấp thuận bootstrap chỉ tồn tại trong process/container một lần, không ghi vào runtime env lâu dài.

## Thay đổi Compose sau khi bootstrap và được duyệt

Chỉ hai dòng trong overlay, giữ mặc định đóng:

```yaml
QAVIO_ADMIN_ENABLED: ${QAVIO_ADMIN_ENABLED:-false}
QAVIO_CMS_ENABLED: ${QAVIO_CMS_ENABLED:-false}
```

Hai giá trị true cần có trong env Compose và runtime private; `env_file` không thay thế interpolation/override. Kiểm merged flags qua output whitelist, không in toàn bộ Docker Env/Compose config. Hiện tại chưa áp dụng các thay đổi này.

## Nghiệm thu sau kích hoạt

Login/logout, __Host- cookie Secure/HttpOnly/Strict, CSRF/origin, dashboard/RBAC/audit, draft/edit/preview, ảnh riêng tư và ảnh qua restart. Chỉ dùng nội dung do chủ dự án duyệt. **Publish/unpublish public cần phê duyệt riêng nội dung và thời gian**; chưa có quyền công khai bài QA từ bước chuẩn bị hoặc bootstrap.
