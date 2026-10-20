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

## Ngoại lệ Giai đoạn D — yêu cầu hiện tại
Chỉ triển khai D1–D5 và kiểm thử local. Người dùng ghi rõ: không tự commit/push/deploy, không thay đổi cấu hình VPS, không mở tiếp nhận production hoặc indexing. Quy định này ưu tiên hơn ủy quyền triển khai C và quy trình tự deploy trước đó. Không tạo admin mặc định; bootstrap bằng credential chủ dự án cung cấp qua CLI.

## Giai đoạn E — 20/10/2026
Được thực hiện E1–E4 và kiểm thử hạ tầng tại local/môi trường cô lập. Không tự commit/push/deploy, SSH, dùng credential thật, bật admin/forms/indexing production hoặc sửa VPS. Nếu cần truy cập VPS phải trình phương án và chờ xác nhận mới. Chủ dự án xác nhận chưa có SMTP/test mailbox; chuẩn bị cấu hình, không báo đã gửi thật. Không khởi động Docker Engine chung nếu có thể ảnh hưởng dịch vụ khác; Linux runtime chưa chạy phải đánh dấu chưa kiểm chứng. Backup/restore chỉ thử với dữ liệu tổng hợp trên database cô lập; không restore production.

## Cập nhật ủy quyền D/E — 20/10/2026
Sau báo cáo E, chủ dự án yêu cầu “oke push lên sever bắt đầu chạy lên web”. Được commit/push D/E, truy cập VPS, build và rehearsal Linux cô lập, sao lưu QAVIO và triển khai ứng viên sau kiểm tra đạt. Ngoại lệ không SSH/deploy D/E phía trên là lịch sử. Giữ admin/CMS/forms/policy/email/indexing production đóng trong lần phát hành này; chưa có credential bootstrap admin hoặc SMTP. Không restore production, không sửa Restaurant/portfolio, không thay Docker Engine chung. Lưu bằng chứng backup/restore cô lập, SHA, health/readiness và rollback image.

- D/E source `c205bbd` đã deploy, web/worker healthy, bốn migration; dùng cả ba Compose file gồm `compose.release-candidate.yaml`. Xem `docs/PHASE_DE_DEPLOYMENT.md` trước lần vận hành tiếp. Builder đã dừng, giới hạn trả về 512/1536 MiB.
- Host chỉ còn khoảng 2,3 GiB disk; một lần worker bảo trì Restaurant tự restart trong thời gian build, chưa xác định nguyên nhân. Không tiếp tục build lớn trên VPS chung 1 GB; chuẩn bị Linux build host/CI riêng và rà soát dung lượng QAVIO trước lần phát hành tiếp. Không tự sửa Restaurant, prune cache chung hoặc xóa rollback/volume.

## Kích hoạt Admin production — yêu cầu mới 20/10/2026
Chủ dự án yêu cầu audit read-only trước, không build hay phát triển D6. Proxy sai/DB sai/tài nguyên không đủ phải dừng báo cáo. Audit thấy đúng images c205bbd, bốn migration, AdminUser=0 nhưng thiếu proxy secret/header và upload limit1m. Chưa bootstrap hoặc thay cấu hình production. Xem `docs/ADMIN_PRODUCTION_ACTIVATION.md` và phương án chờ duyệt `docs/ADMIN_ACTIVATION_PLAN.md`.
- Mọi thay đổi production cần xác nhận thao tác cụ thể theo yêu cầu mới; phê duyệt sửa proxy/backup không tự bao gồm bootstrap hoặc bật flags.
- Phải dừng cho chủ dự án nhập email, tên và mật khẩu qua kênh CLI an toàn trước bootstrap; không hỏi password trong chat, tạo credential suy đoán hoặc dùng mật khẩu SSH cho admin. Chưa nhận input thì không bootstrap.
- Không publish QA public khi chưa duyệt nội dung/thời gian cụ thể. Forms/policy/email/indexing/legal/data-request vẫn đóng khi kích hoạt Admin/CMS. Không thay logo, thiết kế hoặc thêm page builder trong lần này.
- Chủ dự án đã chọn “Duyệt bước chuẩn bị proxy và backup”. Đã tạo/restore thử backup mới đủ4migration, sửa proxy QAVIO/secret/Cloudflare ingress/upload6m/safe access logs, graceful reload Nginx và recreate riêng web bằng image c205bbd. Admin/CMS vẫn false, AdminUser=0; các container khác không đổi trạng thái. Không suy diễn phê duyệt này thành bootstrap hoặc bật flag. Chờ phê duyệt bước tiếp và credential chủ dự án nhập qua CLI; xem `docs/ADMIN_BOOTSTRAP_HANDOFF.md`.
- Phê duyệt tiếp theo đã nhận: “Duyệt bootstrap và bật Admin/CMS”. Được bootstrap bằng credential chủ dự án tự nhập qua CLI; sau khi xác minh một SUPER_ADMIN và audit thành công, bật hai flag và recreate riêng web bằng image hiện có. Không cần hỏi lại quyền này. Hiện vẫn chờ input CLI, chưa bootstrap hoặc bật flag; không mở các flag khác hoặc publish QA.
- Đã hoàn tất bước này sau khi chủ dự án tự bootstrap qua Termius: metadata đúng một active SUPER_ADMIN và một audit bootstrap; Admin/CMS=true, chỉ web recreate bằng image c205bbd, worker/DB và container khác không đổi. Các flag khác vẫn đóng. Kiểm HTTP/cookie login/CSRF/anonymous denial/public pages PASS; chưa nghiệm thu đăng nhập/CMS/upload/publish. Không chạy lại bootstrap. Chờ chủ dự án đăng nhập trực tiếp, không hỏi password qua chat. Xem cập nhật đầu `docs/ADMIN_PRODUCTION_ACTIVATION.md`.
- Cập nhật nghiệm thu: chủ dự án đã đăng nhập và duyệt rõ bộ QA cùng quyền xuất bản riêng bài thử tối đa5phút rồi gỡ. Đã kiểm UI SUPER_ADMIN, danh mục, chín draft (post+tám nhóm), edit/preview/upload, publish35giây rồi unpublish (audit19:47:31–19:48:06), SEO/sitemap/media privacy, restart riêng web giữ dữ liệu/ảnh/phiên, audit và logout. Hiện published=0, activeSessions=0, logout audit=1. Không còn phiên để agent tiếp tục dùng; chủ dự án đăng nhập lại nếu cần. Không publish các draft thương hiệu QA hoặc tự bắt đầu D6. Báo cáo hiện tại `docs/ADMIN_PRODUCTION_ACTIVATION.md` thay thế trạng thái chờ nghiệm thu phía trên.

## Cải tiến liên hệ — yêu cầu mới

Chủ dự án giao cải tiến contact/demo ba trường, Lead/CRM không email outbox, cấu hình phone/Zalo trong CMS và cụm nổi. Tin nhắn kèm yêu cầu “xong push code thẳng lên web nhé” là phê duyệt commit/push/deploy sau kiểm tra, ưu tiên hơn câu chờ xác nhận trong attachment; không phải phê duyệt policy/intake/newsletter/indexing. Số chính thức0935269851, chưa có URL Zalo nên ẩn Zalo. Không xuất bản lại QA CONTACT/company; chỉ khởi tạo cấu hình số thật đã xác nhận, có audit. Migration5 chỉ cho Lead.email nullable, giữ dữ liệu. Build Linux bằng GitHub Actions ngoài VPS, không build VPS hoặc restart Docker Engine; chỉ recreate web và pin operations image c205bbd riêng, Prisma migration dùng thư mục prisma mount read-only. Xem `docs/CONTACT_UX_IMPROVEMENT.md` để phân biệt local PASS/CI/deploy.

- Đã deploy source9de5d5a qua CI39436892596 PASS; web9de5d5a/worker c205bbd/DB healthy, đủ5migration, backup mới và restore cô lập PASS. Số0935269851 xuất bản CONTACT/company version2 có audit, không xuất bản nội dung QA; Zalo ẩn. Forms/policy/newsletter/email/indexing/legal/data-request vẫn đóng, Admin/CMS bật. HTTP production và browser desktop/mobile PASS. Prisma public source phải dirs755/files644 để migration UID1000 đọc bind mount; env/secret vẫn private. Container Restaurant/portfolio không đổi. Bằng chứng và giới hạn tại docs/CONTACT_UX_IMPROVEMENT.md; các commit chỉ cập nhật tài liệu sau9de5d5a không cần rebuild image.

## Task hẹn giờ 23:58 ngày20/10/2026
Được hoàn thiện form/Admin theo attachment6055d0ee, kiểm thử rồi push/deploy theo yêu cầu trực tiếp đặt lịch. Thêm cài đặt contact riêng lưu public ngay với SUPER_ADMIN/audit/version lock; CRM đơn giản, copy/tel/đánh dấu đã liên hệ, menu ảnh dùng API hiện có. Không migration mới, không thay dữ liệu production. Policy chưa duyệt vẫn giữ intake/policy/email/newsletter/indexing/legal/data-request đóng. Không lặp automation sang ngày sau. Báo cáo docs/CONTACT_ADMIN_FINAL.md; build CI ngoài VPS, chỉ recreate web, giữ worker c205bbd và rollback9de5d5a.
