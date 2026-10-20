# Quy trình QAVIO đã được chủ dự án xác nhận

- Chỉ làm việc trong repository QAVIO. Không sửa source, database hoặc container Restaurant/portfolio.
- Ngày 20/10/2026, chủ dự án duyệt toàn bộ bản A/B và yêu cầu: sau này làm xong, kiểm tra đạt thì commit/push Git và deploy QAVIO lên web; không cần hỏi lại cho các lần cập nhật thông thường trong phạm vi được giao.
- Đây là ủy quyền cho tác vụ QAVIO đã được giao, không tự bắt đầu giai đoạn hoặc tính năng mới. Giai đoạn C vẫn cần yêu cầu bắt đầu riêng.
- Chạy lint, TypeScript, production build và kiểm tra phù hợp trước khi push/deploy. Không tuyên bố thành công chỉ dựa vào việc đã chạy lệnh; kiểm tra HTTP/health/assets và giao diện thực tế sau deploy.
- Git origin: `herry-huynhlong/qavio`, nhánh triển khai hiện tại `main`.
- VPS hiện tại: `160.250.5.35`, SSH cổng 22; checkout `/opt/websites/qavio`, domain `https://qavio.longh.org`. Không ghi password/key/token vào Git, tài liệu hoặc lệnh shell có thể lưu lịch sử.
- Compose project `qavio`, service `web`, loopback 3100. Chỉ cập nhật service này bằng image đã build; giữ image trước đó để rollback. Không restart Docker Engine hoặc chạy prune/xóa volume chung.
- VPS RAM thấp: dùng builder `qavio-builder` riêng có giới hạn tài nguyên theo `docs/VPS_SETUP.md`, không đổi default builder của dự án khác; dừng builder sau build.
- Giữ nguyên noindex đến khi có yêu cầu bật tìm kiếm. Chưa tích hợp database/auth/payment QuánPilot. Form B không tiếp nhận dữ liệu thật.
- Logo chính thức ở `public/brand/Qavio.png`. File gốc `Qavio.png` tại root là bản người dùng cung cấp; giữ nguyên, không cần commit thêm bản trùng khi ảnh đã có trong public.
- Lưu trạng thái triển khai, kiểm tra và giới hạn đúng thực tế trong docs. Không suy diễn việc push Git đã tự deploy: hiện quy trình deploy do agent thực hiện, chưa có CI/CD tự kích hoạt.

## Ngoại lệ Giai đoạn C — 20/10/2026
Yêu cầu C hiện tại ghi rõ: không commit, push, tạo remote hoặc deploy production. Quy định này ưu tiên hơn ủy quyền A/B phía trên. Chỉ làm C1–C5 tại local; không mở admin, chiến dịch marketing hoặc tích hợp QuánPilot. Bản privacy vẫn là dự thảo; tiếp nhận dữ liệu thật trên production cần được chủ dự án xác nhận.

## Cập nhật ủy quyền triển khai C — 20/10/2026
Sau báo cáo local, chủ dự án yêu cầu “oke cho lên web”. Được phép commit/push và deploy C tại qavio.longh.org, gồm PostgreSQL riêng và worker. Giữ QAVIO_PUBLIC_FORMS_ENABLED=false, QAVIO_DATA_POLICY_APPROVED=false, EMAIL_PROVIDER=disabled và noindex; yêu cầu đưa lên web chưa phê duyệt chính sách dữ liệu hoặc cấu hình email thật. Giữ image B để rollback; không sửa Restaurant/portfolio. Ngoại lệ không deploy ở trên là lịch sử của lần làm C tại local.

- C đã deploy bằng images `qavio-web:570f8f7`, `qavio-operations:570f8f7`; dùng `compose.yaml` + `compose.production.yaml`. Secrets riêng trên VPS, không in env/config đầy đủ vào logs. Trước migration tiếp theo phải backup QAVIO và kiểm tra target; không dùng reset/drop. Xem `docs/PHASE_C_DEPLOYMENT.md`. Chưa mở form hoặc bắt đầu D.
