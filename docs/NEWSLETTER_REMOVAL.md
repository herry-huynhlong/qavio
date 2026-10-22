# Ngừng newsletter QAVIO — 22/10/2026

Yêu cầu trực tiếp: gỡ giao diện newsletter, giữ dữ liệu cũ, kiểm thử rồi commit/push/deploy riêng QAVIO. Bản bảng giá đang chờ duyệt được giữ riêng, không nằm trong đợt phát hành này. Không sửa source/schema/database Restaurant.

## Thay đổi

- `/subscribe` permanent redirect308 về `/`; bỏ khỏi publicPages/sitemap và footer.
- Trang tin tức không còn CTA nhận tin; thay bằng khám phá QuánPilot. Xóa nhánh form email newsletter, resend và CSS thừa. Không còn hướng dẫn xác nhận trên trang công khai.
- Admin bỏ menu Người theo dõi và card số người xác nhận; bookmark `/admin/subscribers` vẫn qua kiểm tra quyền rồi về dashboard. API quản trị dữ liệu lịch sử giữ phân quyền cũ cho việc xử lý khi cần.
- CTA CMS mới không được chọn `/subscribe`; CTA cũ trỏ newsletter bị bỏ qua khi render và link newsletter cũ trong HTML CMS được lọc. Không sửa record CMS trong PostgreSQL.
- POST subscribe/resend/confirm trả410 NEWSLETTER_RETIRED không truy vấn/ghi database, bất kể cờ hoặc SMTP. `/api/forms/status` newsletterEnabled=false.
- Link confirm cũ có trang thông báo dừng và link Liên hệ; không tiếp tục xác nhận. Link unsubscribe cũ vẫn xác thực token, origin, rate limit, hạn dùng và replay; hoạt động ngay cả khi intake/SMTP đóng. Không có thao tác hủy qua GET. Trang lỗi hướng về liên hệ thay vì trang đăng ký đã gỡ.
- Không drop bảng, migration, xóa subscriber/token/consent/outbox cũ; schema và file migration giữ nguyên. Internal legacy services chỉ giữ cho dữ liệu cũ và fixture test, không còn public enrollment. Worker/SMTP/flags không đổi trong đợt này.

## Kiểm thử local

Worktree phát hành tách khỏi bảng giá chưa duyệt; chạy bản production build tại loopback3101, PostgreSQL qavio_test cô lập55432.

- Lint, TypeScript, production build PASS.
- Retirement tests PASS:410 với flags/SMTP bật hoặc tắt; không thêm/sửa subscriber/token/event/outbox; giữ record cũ; unsubscribe hợp lệ khi intake/SMTP tắt; token sai và replay bị chặn.
- CMS validation và lọc link cũ PASS; HTTP thử CTA cũ chỉ trong fixture QA, không thay record production.
- General integration29, contact14, Admin31, visual CMS13 ca PASS. Legacy newsletter lifecycle tạo fixture qua internal service để giữ kiểm thử lịch sử; không dùng API public đã ngừng.
- Compiled Admin HTTP15 checks PASS, gồm quyền, redirect bookmark, không menu/card newsletter, notification, CMS và contact settings. Đã sửa route kiểm chứng CTA sang /about vì /solutions hiện dùng TrialBanner cố định.
- Public13 trang/341link nội bộ, SEO/sitemap/404/logo PASS; /subscribe308; không còn href /subscribe hoặc nhãn khuyến khích nhận tin.
- Domain/origin/cookie boundary và visible-poll regression PASS.
- Browser Admin: không menu/subscriber metric; chuông còn; logout PASS. Screenshot local trong docs/newsletter-removal/.
- Fixture user/lead/subscriber/outbox QA đã dọn theo đúng ID của fixture, không reset database.

## Backup và triển khai

Trước phát hành: VPS df71%, còn6.9G; current QAVIO d590b1c, Restaurant3574ce4. Backup mới chỉ QAVIO database/media, mã hóa và tải off-host; restore trên DB local riêng đạt5migration, DB restore và plaintext tạm đã dọn. Ciphertext SHA256:68467e86fd67799bc49075f536f5f2c2968fb46ab36ce16c004391ffa6b0c3c2.

CI/Linux build ở GitHub Actions; không build VPS. Quy trình deploy kiểm tra artifact/image revision/checksum/config/layers, disk, snapshot runtime và rollback d590b1c; chỉ recreate qavio-web. Không migrate, đổi env hoặc bật indexing/email. Kiểm tra fingerprint các bảng newsletter trước/sau và container không liên quan.

## Phát hành đã hoàn tất

- Source commit: `5f10868c4121391c76320fae157b111b2301cf52`, đã push main.
- GitHub Actions [39713925910](https://github.com/herry-huynhlong/qavio/actions/runs/39713925910): SUCCESS, gồm PostgreSQL regression và Linux image build bên ngoài VPS.
- Image đang chạy: `qavio-web:5f10868`, id `sha256:3d5f062bffe8ee2f4db2466334dee8ac356f8b3b1ea563207ad4ec3db156fad5`. Artifact ZIP digest `sha256:dc73081c84e3537611b73526f2ae13a08fb78f020631076220d2242e4949d978`; archive, revision, config digest và rootfs layers đã kiểm tra khớp.
- Lần thay đầu tự rollback vì NODE_VERSION từ base image mới khác snapshot cũ. Đã xác minh đây là khóa duy nhất khác; lần cuối so sánh toàn bộ cấu hình ứng dụng/secret giữ nguyên và kiểm tra NODE_VERSION trùng image đã xác minh cùng binary Node thực tế. Các kiểm tra này đạt, không đổi flag/secret thủ công.
- Chỉ recreate qavio-web; web HEALTHY. Sáu container còn lại giữ nguyên ID/start/restart count, gồm Restaurant app3574ce4, hai PostgreSQL, hai worker và Portfolio.
- Không migration; QAVIO vẫn5 migration. Trước/sau triển khai và sau HTTP smoke, count+fingerprint NewsletterSubscriber/NewsletterToken/NewsletterConsentEvent khớp. Không xóa/sửa dữ liệu khách hàng cũ, không truy vấn/sửa database Restaurant trong đợt này.
- Flags giữ nguyên: Contact/DEMO và trial bật; quota100; SMTP/email, QUOTE và indexing đóng. Không mở Google flow hay tạo quán/lead QA production.
- Production HTTPS:14 trang (gồm bài CMS hiện có `/news/cnm`),439 liên kết được duyệt, không newsletter CTA/href; sitemap không /subscribe; legacy308 về /; subscribe/resend/confirm410; hai trang token200/noindex; unsubscribe input rỗng422; Contact/DEMO input rỗng422; Admin auth guard/API notification401; QuánPilot login200. Không gửi thông tin cá nhân thử vào production.
- Browser production desktop/mobile375: footer không còn liên kết newsletter, không lỗi console; mobile không tràn ngang. Admin UI đã kiểm chứng bằng phiên QA local, production kiểm tra guard và image tương ứng, không đăng nhập bằng tài khoản khách để kiểm thử.
- Sau dọn đúng archive của release: df73%, còn6.5G (6.918.811.648 bytes free), từ71%/6.9G trước release. Giữ image cũ d590b1c và các rollback/container/volume; không prune/down-v.
- Rollback: snapshot `.env` trong `/opt/websites/qavio/.runtime/newsletter-release-20261022/snapshot/qavio.env`, image `qavio-web:d590b1c`, compose up riêng web `--no-build --no-deps`; không restore đè DB vì không có migration/dữ liệu nghiệp vụ bị đổi.

Bằng chứng: docs/newsletter-removal/production-http.json, production-deploy.json, production-before.json, production-final.json, image-integrity.json và ảnh footer/mobile. Backup off-host giữ mã hóa; DB restore và plaintext tạm đã dọn. Archive image đã load được dọn, rollback image và backup giữ nguyên.
