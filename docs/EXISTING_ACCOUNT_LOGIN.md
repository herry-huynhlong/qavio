# QuánPilot — đăng nhập tài khoản hiện có

Ngày thực hiện: 21/10/2026. Phạm vi attachment943a7817. Không triển khai production trong lượt này.

## Luồng

- QAVIO có liên kết Đăng nhập tại header desktop/mobile (và trang chủ qua header), footer và hai card trên `/trial` trước xác nhận Google.
- URL tập trung tại `site.quanpilotLoginUrl`: origin từ `QUANPILOT_PUBLIC_URL`, mặc định hostname đã được chủ dự án xác nhận `https://admin.qavio.site`, đường dẫn `/restaurant-login`.
- QAVIO chỉ điều hướng. Email/mật khẩu, cookie, session đều do NextAuth Credentials hiện có trên QuánPilot xử lý. Không có form mật khẩu QuánPilot, cookie chung domain hay lưu mật khẩu trên QAVIO.
- QuánPilot `/restaurant-login` hiển thị email/mật khẩu khi chưa có phiên; phiên hợp lệ chuyển theo membership. Callback cố định `/restaurant-entry` không nhận callback tùy ý từ query. Không đi vào Platform Admin qua entry này, kể cả tài khoản có platform role.
- Một membership hợp lệ đi vào luồng theo role hiện có; OWNER/MANAGER tới dashboard. Nhiều membership dùng `/select-restaurant` hiện có. Tenant guards hiện có vẫn kiểm tra quyền, trạng thái và gói. Tài khoản bị vô hiệu hóa hoặc đã xóa không được dùng JWT cũ để tiếp tục qua entry.
- Trang login tenant kiểm tra phiên và membership đúng slug trước khi bỏ qua form. Không chuyển sang tenant mà người dùng không thuộc về.
- Sau đăng ký trial, nút “Đăng nhập và bắt đầu sử dụng” dùng nguyên URL tenant thực tế mà API trả về; không hardcode slug.
- Không thêm Quên mật khẩu vì chưa có cơ chế thật. Không thay Google OAuth, TTL phiên, cookie settings, DB schema hoặc subscription.

## Kiểm thử

- QAVIO lint, TypeScript, production build đạt; public regression14trang/377liên kết, SEO/sitemap/404/logo đạt.
- QuánPilot lint, TypeScript và production build đạt. Build cuối dùng cấu hình DB test cô lập, không còn cảnh báo thiếu DATABASE_URL của lần chạy đầu.
- `Restaurant/scripts/restaurant-login-integration.ts` kiểm HTTP NextAuth thật trên loopback3200/DB `restaurant_trial_test`: anonymous, sai/đúng mật khẩu, còn phiên, login đúng slug, tenant khác bị chặn, nhiều membership, logout/relogin, token hết hạn, verification cookie không phải session. Đếm TrialRegistration/SubscriptionRequest/Entitlement không đổi. Fixture tự dọn đúng prefix UUID, không sửa quán Long Phụng.
- Regression trial22ca đạt: Google claims/nonce/audience/ownership, provisioning/idempotency, BASIC guards, quota/rate limit, rollback transaction và password login. Đây là adapter cô lập, không phải một lần đăng nhập Google thật mới. Dòng QA forced failure là ca rollback có chủ đích và đạt.
- Không gửi dữ liệu QA hoặc đăng nhập thử vào production. Không thay dữ liệu nhà hàng production.
- Browser: form email/mật khẩu QuánPilot và lỗi đăng nhập sai hiển thị đúng; QAVIO có hai card trước xác minh Google, menu mobile có Đăng nhập, Roboto đã áp dụng. Desktop1280 và mobile390 không tràn ngang; các URL đăng nhập đều trỏ hostname đã xác nhận. Kiểm thử HTTP chạy lại sau xử lý JWT trỏ tài khoản đã xóa/vô hiệu hóa và đạt. Phiên Google thật không cần xác minh lại vì không thay OAuth; regression dùng adapter nêu trên.

## Kế hoạch deploy và rollback

1. Build Linux bằng hai workflow dispatch hiện có ngoài VPS, kiểm tra SHA/image/checksum. Push Git không tự deploy vì workflows chỉ dispatch.
2. Kiểm tra dung lượng và health, giữ image đang chạy để rollback: QAVIOcf2a207, QuánPilot2e8d0b1. Không build nặng trên VPS, không prune chung hoặc xóa volume.
3. Phát hành QuánPilot trước để `/restaurant-login` và `/restaurant-entry` sẵn sàng. Smoke anonymous/session/tenant trên origin thật trước khi phát hành link QAVIO.
4. Phát hành QAVIO sau. Giữ mọi env/flags/contact/trial/mail/indexing hiện tại. Không migration, không đổi OAuth callback hay Nginx.
5. Nếu lỗi, rollback web QAVIO trước, rồi app QuánPilot về image cũ. PostgreSQL/worker/Restaurant data/Portfolio không recreate hoặc restore.

Bản nâng cấp hình ảnh đang làm riêng ở working tree, chưa được duyệt commit/deploy theo yêu cầu hình ảnh. Commit đăng nhập không bao gồm các file hình ảnh/CMS/font đó.
