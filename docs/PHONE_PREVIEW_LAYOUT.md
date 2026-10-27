# Thu gọn preview điện thoại QuánPilot — 27/10/2026

- Phạm vi: chỉ CSS `.demo-device-phone` trong gallery `/products/quanpilot`. Trước khung khoảng390px/887px; sau max-width260px, preview ảnh520px, nút/nhãn tổng tối đa560px. Căn giữa bằng width/max-width/margin, không dùng scale hoặc để khoảng chiếm chỗ cũ.
- Mobile dùng `svh`: chiều cao ảnh min(520px,68svh−48px), container/nút giới hạn68svh, chiều rộng co theo100% và chiều cao màn hình. Nhãn1dòng ellipsis/cỡ11px cao38px để mọi chức năng nhất quán; tên đầy đủ vẫn nằm trong aria-label và tiêu đề lightbox.
- Ảnh thật không thay đổi byte, width/height gốc. `object-fit:cover; object-position:center top` chỉ crop preview. Lightbox ảnh gốc, zoom và cuộn độc lập, không bị selector preview ảnh hưởng. Dashboard/Báo cáo/tablet không đổi quy tắc.
- Đã kiểm1440/1024/768/390/375, body không tràn ngang; preview desktop258×558 client (outer260×560); mobile dưới68vh. Nút mở, next, ArrowRight, zoom/kích thước gốc, cuộn và Escape hoạt động; ảnh375×812 gốc giữ nguyên. Chứng cứ `docs/phone-preview/`.
- Lint/TypeScript/production build local PASS. Local có bản Contact đang chờ duyệt; **chỉ stage/commit CSS và tài liệu task ảnh**, CI Linux sẽ build đúng committed source, không bao gồm Contact. Không sửa hoặc deploy QuánPilot, không schema/migration/flags.
- Trạng thái phát hành: **GO — đã chạy trên production và kiểm chứng** (chi tiết bên dưới).

## Kết quả CI và chuẩn bị production
- Source `40ea03d6eec4c250bf1c75f4a747c3ba691a5596`; build [40523265749](https://github.com/herry-huynhlong/qavio/actions/runs/40523265749) và review [40523739112](https://github.com/herry-huynhlong/qavio/actions/runs/40523739112) SUCCESS. CI checkout committed source chỉ CSS/tài liệu, không gồm bản sửa Contact đang local.
- Manifest SHA256 `86f8cb7e493fe7dc4b82a615b8205b6bfa9af304a2ca7fabdd09d8d9092f2a93`; artifact digest `sha256:e5278e7934f62500ab973bfdf0fc5d0e1a8af76642d868d118c18c1687db8d6f`; archive141.320.116bytes, image383.596.032bytes.
- Backup mới mã hóa/off-host và restore5migration trên database cô lập PASS, encrypted SHA256 `750cd0348932c440d5f2ae2dcaafe946f1f1c7d667896279d809b6ae1491f0c9`. Không restore production hoặc migration.
- Preflight free5.381.406.720bytes/79,39%, MemoryAvailable520.445.952bytes, giữ current/rollback. Không build/pull trên VPS; archive đúng release được gỡ sau load, không prune/log/volume.
- Dashboard trước/sau cùng1198×842px; không chịu CSS điện thoại. Cả10màn hình khách/phục vụ cùng258×558 client, khung outer260×560; mobile844px cao66,4%viewport. Lightbox scroll608/699px và ảnh375×812 gốc không bị crop.

## Production cuối — GO
- Image `qavio-web:40ea03d`, ID `sha256:4e8f2f2f71b18214745b6c2c0c5fd2d5668764189375da8bb862e90a9a3ba5e6`; chỉ recreate QAVIO web bằng image-only/no-build/pull-never/no-deps. Env/mounts và6container khác giữ nguyên. Không migration/ghi dữ liệu production.
- Lần1 tự rollback ứng dụng vì timeout HTTPS `/pricing` từ VPS. Diagnostic trên bản cũ cũng timeout20s, ngoài VPS trả200/3,2s; các endpoint khác200. Giữ nguyên snapshot gốc, lần2 dùng thư mục riêng `attempt2`, snapshot mới và bounded retry tối đa3lần cho HTTPS, không bỏ qua kiểm tra lỗi.
- Lần2 cutover HTTPS/health PASS. Outbound VPS→Cloudflare còn timeout ngắt quãng cả ảnh tĩnh `pro-orders.webp`, nên kiểm hậu phát hành tách riêng: origin loopback trên VPS26ảnh/hash+9trang+health+flags/container PASS; HTTPS từ máy ngoài26ảnh/hash+13endpoint+forms PASS. Không thay DNS/TLS/firewall hoặc code bảng giá. Không kết luận timeout đã hết hoàn toàn.
- Browser production: desktop/mobile frame260×560outer (client258×558); phone image gốc375×812 đầy đủ trong lightbox, scroll608/730px, Escape/zoom/navigation và console PASS. Ảnh Dashboard không đổi;26file ảnh public hash giữ nguyên. Ảnh trước/sau và nghiệm thu trong `docs/phone-preview/`.
- Cả7container running;4có healthcheck healthy,3không healthcheck kiểm running/HTTP tương ứng. Free disk sau smoke5.166.350.336bytes (~4,81GiB), RAMAvailable527.532.032bytes. Disk~80,2% ở mức cảnh báo theo runbook, vẫn vượt reserve yêu cầu; không xóa image rollback/log/volume/backup.
- Rollback ứng dụng: giữ image trước `sha256:b3c5a9b41c8b537982e4281977ee51b6759b71d280820998f9da182661f5aa49`; phục hồi `.env` từ `/opt/websites/qavio/.runtime/phone-preview-release-20261027/attempt2/snapshot/environment.private`, chạy model `snapshot/rollback.private.json` bằng `docker compose --project-directory /opt/websites/qavio -p qavio -f <model> up -d --no-build --pull never --no-deps web`. Không restore database cho thay đổi CSS.
- Bản Contact local vẫn chưa commit/push/deploy; HTTP Contact production giữ cấu trúc cũ và API CONTACT=true/QUOTE=false/newsletter=false/SMTP=false. Đây chỉ là phát hành preview ảnh.
