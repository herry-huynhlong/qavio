# Chuyển QAVIO sang qavio.site — 21/10/2026

Đã hoàn tất chuyển phần QAVIO đang hoạt động sang domain mới và kiểm chứng production. Bản cuối image f891017. Tạm dừng phát triển tính năng khác theo yêu cầu chủ dự án.

Kiến trúc: một Next.js backend/frontend/Admin, một PostgreSQL QAVIO. Website https://qavio.site; Admin https://admin.qavio.site/admin, root302→/admin. API Admin và cookie ở hostname Admin, API Contact ở hostname public. Không thêm dịch vụ Admin, database hoặc thanh toán. Public /admin chuyển sang subdomain; public /api/admin không phục vụ Admin API. Không cần CORS chéo domain; trình duyệt gọi API tương đối cùng origin. Cookie __Host- HttpOnly/Secure/SameSite=Strict, Path=/, không có Domain. Đăng nhập lại tại hostname mới; không sao chép cookie domain cũ.

APP_ORIGIN=https://qavio.site; SITE_URL=https://qavio.site; QAVIO_ADMIN_ORIGIN=https://admin.qavio.site. Admin CSRF chỉ chấp nhận origin Admin, public form chỉ chấp nhận public origin. Fallback local vẫn cùng APP_ORIGIN nếu chưa đặt QAVIO_ADMIN_ORIGIN. Chặn origin cũ/ngoại lai. Metadata/canonical/OpenGraph/JSON-LD/sitemap/robots dùng SITE_URL; giữ noindex. Contact/DEMO giữ mở; trial, email, QUOTE/newsletter/indexing không bật.

Tất cả text/JSON PostgreSQL public schema đã được quét:0 bản ghi chứa qavio.longh.org. Không migration/UPDATE dữ liệu hoặc xóa tài khoản. URL email lấy APP_ORIGIN; provider disabled nên không gửi email. Google OAuth chưa có provider/client thật và trial đang tắt; callback Google nằm ở QuánPilot demo.longh.org, không chuyển domain QuánPilot. QuánPilot có biến QUANPILOT_TRIAL_QAVIO_ORIGIN cũ trong overlay tắt, cần đồng bộ cấu hình khi được phép cập nhật runtime QuánPilot; không mở trial.

Kế hoạch: backup config/env + dump/media mã hóa; cấp chứng chỉ SAN cho cả2hostname bằng webroot Certbot; Nginx chỉ graceful reload sau nginx -t. Build Linux qua CI ngoài VPS vì cần sửa Admin origin; giữ image41218f7 rollback. Dùng ứng viên tạm loopback để kiểm tra/switch upstream rồi recreate service web, tránh ngắt lưu lượng khi đổi container. Không build/prune/down -v/xóa volumes. Worker chỉ cập nhật runtime origin bằng image hiện có; PostgreSQL/Restaurant/Portfolio giữ nguyên.

Chỉ bật301 domain cũ sau public/Admin domain mới vượt qua HTTP/TLS/origin/cookie/health tests. Các deploy/qavio.longh.org.* là tham chiếu rollback lịch sử, không dùng cho domain mới. Tài liệu phase cũ và backup giữ hostname lịch sử, không sửa chứng cứ thành domain mới.

Cloudflare: chưa có quyền/API token, không đổi DNS hay SSL setting. Chủ dự án đã xác nhận trong chat “Đã đặt Full (strict)” cho zone qavio.site; origin TLS được kiểm bằng curl xác thực CA/hostname; agent không đọc được setting qua API/dashboard. Cần giữ kiểm Universal SSL bao phủ qavio.site và *.qavio.site. Không dùng Flexible. Cache Rules phải bypass /admin*, /api/*, /media/* trên admin hostname; không bật Cache Everything cho Admin/API. Tham khảo https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/ . Không tuyên bố đã xác minh mode khi chưa đọc được dashboard/API.

Chủ dự án đã xác nhận “Đăng nhập, dashboard và đăng xuất đều hoạt động” tại admin.qavio.site. Agent không biết mật khẩu Admin và không reset/bootstrap hoặc tạo QA production để thay thế. Test local có thể xác minh vòng đăng nhập/session/đăng xuất trên DB cô lập; chưa thay thế nghiệm thu tài khoản thật.

Bằng chứng production, SHA, disk/container, rollback và file thay đổi sẽ cập nhật sau rollout. Ngày21/10 chủ dự án xác nhận đã xóa DNS tên miền cũ và yêu cầu bỏ bước chờ DNS/redirect public; không khôi phục DNS hoặc coi NXDOMAIN cũ là blocker chuyển QAVIO nữa. Redirect301 đã kiểm chứng tại origin, nhưng domain cũ không thể redirect ngoài Internet khi DNS đã xóa.


## Kết quả phát hành thực tế

- Source/image cuối: `f891017a4e1792baa0e38c3c5b1ef9189d004c25` / `qavio-web:f891017`. CI Linux [39553453357](https://github.com/herry-huynhlong/qavio/actions/runs/39553453357) success; đợt chính2018147 qua CI39552559665 success, sau đó sửa nốt link quay về website trên login. Không build trên VPS.
- Artifact cuối ZIP SHA256 `c38b42ad46d4312f7af8aeb3f38bf0a3e484b131d510d40930c67bec0c9841c4`; OCI image ID `sha256:cf2bbdbc8f2dec95de073bf778f8e29108947a1d7dc6d6d8332d4cb15562fef2`; config `sha256:d28662a3705f3c32b54564b8aae8ccaad528768cfb521cf5a9c53fa6f2c54ba5`. ZIP digest, gzip checksum, OCI index/manifest/config/layers và revision đã đối soát trước rollout.
- Backup mới DB/media QAVIO mã hóa, SHA256 `ca6b51f8f33010a5f8c9bc1f14bb7b410ddf82647428e12786e0a308fc487f1a`. Đã lưu off-host và restore local loopback55432 thành công, đủ5migration. Bản sao plaintext/DB restore đã dọn; archive mã hóa và proof giữ trong `.runtime/domain-backup`. Không có migration dữ liệu, không đổi DB credential, không xóa hoặc bootstrap tài khoản.
- Đã dùng container ứng viên cùng image/config tại loopback3130 để chuyển upstream trước khi recreate web3100. Sau khi web chính ready, chuyển upstream về3100, xóa riêng container ứng viên. Nginx graceful reload sau kiểm tra cú pháp; không restart Docker Engine, không down -v hoặc prune. Worker QAVIO cập nhật origin mới bằng image hiện cóc205bbd; không gửi email. Không tạo dịch vụ Admin riêng.
- Production: `https://qavio.site`200; `https://admin.qavio.site/`302→`/admin`; Admin login200, chủ dự án xác nhận đăng nhập/dashboard/Liên hệ khách hàng/đăng xuất hoạt động. Link quay về website trên login và sidebar dùng domain public. Session cũ không chuyển giữahostname, cookie mới host-only Secure/HttpOnly/SameSiteStrict.
- 14 trang public, canonical/OpenGraph/sitemap/robots dùng qavio.site; noindex giữ nguyên; không mixed content. Contact/DEMO enabled, QUOTE/newsletter/mail/trial/indexing vẫn đóng. Origin cũ và origin Admin bị chặn ở API Contact. Anonymous Admin401, public hostname không phục vụ Admin API404; preauth CSRF cookie đúng thuộc tính và no-store. Không gửi Lead/PII QA production.
- Local lint, TypeScript, production build và runtime manifest PASS; Admin31/Contact14 hồi quy PASS; Admin31 chạy lại với origin Admin khác public origin PASS (DB test riêng). Bài kiểm tra origin/cookie/environment mới PASS, CI cũng chạy bài này. Browser production375/1280 không tràn ngang, menu mobile mở/đóng,0ảnh lỗi và không ghi nhận console error/warning. Screenshot `D:/anh/qavio/.runtime/domain-evidence/qavio-site.png`.
- Cert SAN mới bao phủ qavio.site + admin.qavio.site, CA Let's Encrypt, hết hạn19/01/2027. Edge HTTPS và origin HTTPS qua loopback/SNI đều xác thực CA/hostname thành công. Certbot timer enabled, Nginx active; hook renew đã hỗ trợ cert mới. Full(strict) do chủ dự án xác nhận đã đặt, không khẳng định agent đã đọc dashboard Cloudflare. Không thay DNS/Cloudflare bằng API.
- Redirect301 domain cũ đã cấu hình và kiểm qua origin với path/query được giữ: `/contact?from=old`→`https://qavio.site/contact?from=old`, `/admin/login`→`https://admin.qavio.site/admin/login`. Chủ dự án xác nhận đã xóa DNS cũ và yêu cầu bỏ bước này; public redirect không khả dụng khi không có DNS, được loại khỏi điều kiện hoàn tất theo chỉ đạo mới. Giữ cert/config cũ chỉ làm rollback/tham chiếu, không yêu cầu chủ dự án khôi phục.

## Container và dung lượng

- `qavio-web-1`: qavio-web:f891017, healthy.
- `qavio-worker-1`: qavio-operations:c205bbd, healthy, APP_ORIGIN/SITE_URL mới.
- `qavio-qavio-postgres-1`: postgres:16-alpine, healthy, container không đổi.
- `restaurant-app-1`, `restaurant-maintenance-worker-1`, `restaurant-postgres-1`, `longh-portfolio`: giữ nguyên container ID/thời điểm khởi động/image so với snapshot trước triển khai. Những container có healthcheck vẫn healthy; không tự gán healthy cho container chỉ có trạng thái Up.
- Disk trước:25GB, dùng16GB/66%, trống7.9GB. Sau bản cuối: dùng17GB/70%, trống7.0GB (snapshot freeBytes7489753088). Không xóa volume, container Restaurant/Portfolio hoặc cache chung.
- Portfolio public200. `demo.longh.org` trả NXDOMAIN từ local, resolver1.1.1.1 và VPS trong đợt kiểm tra; Restaurant HTTPS origin với SNI demo.longh.org vẫn200 và container không đổi. Đây là giới hạn kiểm chứng URL public Restaurant được báo riêng; không sửa DNS hoặc container của dự án đó.

## File và runtime đã thay đổi

Các file source/config: `.env.example`, `Dockerfile`, `.github/workflows/qavio-release.yml`, `deploy/runtime-environment.mjs`, `deploy/qavio-certbot-deploy-hook.sh`, `deploy/qavio.site.conf`, `src/server/config.ts`, `src/server/admin/auth.ts`, `src/server/admin/page-auth.ts`, `src/lib/site-config.ts`, `src/components/admin/shell.tsx`, `src/components/admin/login.tsx`, `scripts/check-domain-origins.ts`, `scripts/integration-operations.ts`. `.gitignore`/`.dockerignore` loại client_secret_*.json; không đọc/commit/upload file OAuth do người dùng thêm trong lúc task chạy. README/docs cập nhật trạng thái. Ba template deploy/qavio.longh.org.* được đánh dấu LEGACY rollback.

VPS: `.env`/`.env.production` đặt APP_ORIGIN/SITE_URL=https://qavio.site, QAVIO_ADMIN_ORIGIN=https://admin.qavio.site; pin imagef891017/operationsc205bbd. Nginx `/etc/nginx/sites-available/qavio-site.conf` mới và qavio.conf redirect cũ; symlink tương ứng trong sites-enabled. Cert mới `/etc/letsencrypt/live/qavio.site/`, renewal hook `/etc/letsencrypt/renewal-hooks/deploy/qavio-reload.sh`. Secrets/header proxy, role database, media/ops volume và flags nghiệp vụ giữ nguyên. Chỉ có private snapshot, không đưa secret vào Git hoặc log.

Các hostname cũ còn lại được phân loại: template/tài liệu/backup lịch sử để rollback; test cố ý từ chối origin cũ; cert cũ dùng redirect; cấu hình staging không chạy dùng khi rehearsal trước đây. Một biến QUANPILOT_TRIAL_QAVIO_ORIGIN cũ nằm trong runtime QuánPilot có trial=false; không chạm container Restaurant theo yêu cầu. Biến này cần đổi thành https://qavio.site khi được giao tiếp tục cấu hình Google/trial QuánPilot, không được bật trial với giá trị cũ. Không có OAuth/webhook QAVIO thật đang kích hoạt cần cập nhật bên provider trong đợt chuyển domain này.

## Rollback

Ưu tiên rollback riêng code f891017 về image2018147 (đã kiểm domain/Admin thành công), giữ APP_ORIGIN/SITE_URL/QAVIO_ADMIN_ORIGIN mới và worker hiện có; recreate riêng web thông qua container ứng viên/upstream để không ngắt lưu lượng. Không rollback PostgreSQL vì không có migration. Không dùng down -v.

Rollback toàn bộ chuyển domain chỉ khi chủ dự án yêu cầu: snapshot `.runtime/domain-qavio-site/before` có `.env`, `.env.production`, qavio.conf và inventory; image41218f7 còn giữ. Phải giữ một upstream khỏe khi đổi lại Nginx/env, nginx -t trước reload. Domain cũ đã bị chủ dự án xóa DNS nên rollback domain cũ cần chủ dự án chủ động khôi phục DNS; agent không tự làm. Bằng chứng build/backup/deploy/redirect nằm tại `/opt/websites/qavio/.runtime/domain-qavio-site`.

Đã kết thúc phần chuyển domain QAVIO. Các công việc Google OAuth/trial hoặc phát triển khác tiếp tục tạm dừng đến khi chủ dự án xác nhận bước tiếp theo.
