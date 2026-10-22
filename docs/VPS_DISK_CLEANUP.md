# Dọn dung lượng VPS —22/10/2026

Chủ dự án yêu cầu dọn server sau khi df báo94% sử dụng. Lượt này chỉ xóa image phát hành cũ không có container tham chiếu, theo danh sách cụ thể; không dùng system/image/volume prune chung.

## Kết quả

- Trước kiểm tra:1.807.745.024byte trống (~1.68GiB), df93%; ảnh chủ dự án gửi trước đó94%.
- Sau:7.325.618.176byte trống (~6.82GiB), df -h hiển thị6.9G, dùng71%.
- Thu hồi5.517.873.152byte (~5.14GiB), chủ yếu từ Docker/containerd.
- Đã xóa16image cũ (19tag), chỉ thuộc qavio-web, quanpilot-app và qavio-staging-web; toàn bộ đều không được container nào sử dụng. Danh sách tag chính xác trong docs/vps-cleanup/20261022.json.

## Những gì được giữ

- QAVIO web đang chạy d590b1c; hai bản dự phòng898451b và7ebeb22.
- QuánPilot đang chạy3574ce4; hai bản dự phòng05ff9ad vàbe133f2. Base runtime05ff9ad của image mới được giữ nguyên.
- Tất cả image đang được bất kỳ container nào tham chiếu, kể cả worker/Portfolio/PostgreSQL; giữ worker c205bbd và bản trước570f8f7. Không xóa image công cụ/namespace khác.
- Cả7container giữ nguyên ID/image/start/restart count/mounts. Cả12volume giữ nguyên, gồm production và các volume staging cũ. Không xóa backup hoặc ảnh upload.
- Không dọn log/journal, không xóa trực tiếp thư mục Docker/containerd, không restart Docker hay service, không thay env/code/database.

## Kiểm chứng

Script lập danh sách và chụp trạng thái trước; trước mỗi lần xóa kiểm lại image không có container dùng và tag chưa đổi. Dùng docker image rm theo chính xác tag, không force. Docker quản lý tham chiếu/lớp dùng chung; giữ toàn bộ lớp runtime còn được image khác dùng.

Sau khi dọn: kiểm lại container/mount/volume và các bản rollback; HTTPS qavio.site/api/ready và admin.qavio.site/restaurant-login PASS. Hai PostgreSQL/QAVIO worker/web healthy, QuánPilot/maintenance worker/Portfolio vẫn Up. Không gửi QA vào production hoặc sửa dữ liệu.

Các mục ghi giữ image rất cũ trong báo cáo phát hành trước là lịch sử: những tag có trong deletedImageTags đã được chủ dự án cho phép dọn trong lượt này. Khi rollback dùng danh sách còn giữ phía trên, không dùng tag đã xóa. Bằng chứng vận hành private ở /opt/websites/qavio/.runtime/disk-cleanup-20261022; bản JSON công khai không chứa env/credential.

## Đợt dọn tiếp theo sau push hardening — 22/10/2026

Chủ dự án tiếp tục yêu cầu kiểm kê và xóa bớt tài nguyên không còn cần. Đã xóa5image không container nào dùng (qavio-web7ebeb22/d590b1c/898451b và quanpilot-app05ff9ad/be133f2) cùng11archive Docker staging cũ đã kiểm checksum, không phải backup dữ liệu. Danh sách giữ ở phần lịch sử phía trên được cập nhật: hiện giữ production QAVIOcc06d0f/QuánPilot1edbfd9, rollback QAVIO5f10868/QuánPilot3574ce4, toàn bộ image container/worker/PG/Portfolio và backup cần thiết.

Thu hồi thêm3.68GiB; free4.89→8.56GiB, df79%→63%;7container/env/mounts và12volumes không đổi, HTTPS PASS. Cache build0B, không dọn log/backup/volume hoặc restart service. Chi tiết và bằng chứng mới ở [DEPLOYMENT_HARDENING.md](DEPLOYMENT_HARDENING.md) và `deployment-hardening/cleanup-20261022.json`. Không dùng những tag vừa xóa để rollback.
