# Kiểm tra Lưu nháp / Xuất bản ảnh — 28/10/2026

## Kết luận và phạm vi

Đã xác định các điều kiện khóa trong source, tái hiện lỗi ảnh mặc định trên QA và hoàn thiện bản sửa. **Ngày 28/10/2026, chủ dự án đã duyệt push và tiếp tục yêu cầu deploy; source `78553bae43eccb5c24bd19d829feb50fbfe6096d` đã chạy trên production. Không upload/xuất bản bất kỳ ảnh nào trên production.**

Browser production mở `https://qavio.site/admin/visuals` nhưng chuyển về `/admin/login`. Đã đề nghị chủ dự án đăng nhập trong trình duyệt kết nối; đến lúc lập báo cáo chưa có phiên đăng nhập. Vì vậy chưa xác nhận quyền, slot, bản nháp hay lỗi API trong chính phiên production của chủ dự án. Không coi kết quả QA là bằng chứng đã thao tác thành công trên production.

## 1. Nguyên nhân đã chứng minh

Component: `src/components/admin/visuals.tsx`, `VisualCard`.

| Nút / trạng thái cũ | Điều kiện thực tế |
| --- | --- |
| Lưu nháp | Disabled khi `!id || alt.trim().length < 5 || caption.trim().length < 5`; fieldset cha cũng disabled khi busy. Không dựa vào dirty để khóa nút lưu. |
| Xuất bản ảnh | Disabled khi `!canPublish || !row.draft || dirty`; fieldset cha disabled khi busy. |
| Quyền xuất bản | ADMIN và SUPER_ADMIN; EDITOR chỉ lưu nháp. API kiểm tra lại quyền độc lập UI. |
| Ảnh mặc định | Có preview từ `defaultVisuals()` nhưng `id` trống vì ảnh chưa là MediaAsset. Vì thế dù sửa alt/chú thích hợp lệ, Lưu nháp vẫn bị khóa. Đã tái hiện bằng browser QA. |
| Dirty mặc định | So sánh alt/caption/origin khởi tạo từ fallback với `initial?.title/summary/data.origin` là undefined khi chưa có entry, nên đánh dấu dirty ngay cả khi chưa sửa. |
| Thông báo sau lưu | Key component chứa version của draft/live; refresh đổi key và remount thẻ, làm mất state thông báo thành công. |
| Đã xuất bản | Draft vẫn tồn tại sau publish. Bản cũ không so sánh nội dung draft/live, nên có thể tiếp tục xuất bản lại nội dung giống nhau. |

Đây là logic form và dữ liệu nguồn, không phải lỗi CSS. Trong QA không phát hiện hydration error. Không thể loại trừ lỗi quyền/API riêng production khi chưa đăng nhập được.

## 2. Bản sửa local

- Baseline form dùng đúng metadata hiện hành của draft/live/default; dirty so sánh nội dung đã trim.
- Chưa thay đổi: Lưu nháp tắt và hiển thị **“Chưa có thay đổi để lưu”**.
- Chọn ảnh thư viện hoặc upload thành công: Lưu nháp bật khi metadata hợp lệ; không bắt upload lại ảnh đã có.
- Alt/chú thích của ảnh mặc định có thể lưu: API nhận `useDefault: true`, chỉ lấy file mặc định được định nghĩa trong code, đưa vào kho media riêng và lưu draft trong transaction. Không nhận đường dẫn/URL tùy ý, không ghi đè file trong public hoặc thay ảnh công khai trước publish.
- Tái sử dụng kiểm tra ảnh, dung lượng, quota, quyền và audit của upload hiện có; file stage bị dọn nếu transaction thất bại. Không migration/schema mới.
- Hiện lỗi ngay tại trường alt/chú thích; nguồn screenshot được giữ đúng loại cho các slot phần mềm. Validation server vẫn là lớp bắt buộc.
- Nút / fieldset có trạng thái đang lưu, đang xuất bản, đang upload; khóa chống double-click bằng ref trong thời gian request.
- API trả metadata/version đã lưu; thẻ cập nhật snapshot trực tiếp và giữ thông báo thành công, không remount theo version.
- Publish chỉ bật khi có draft đã lưu, hợp lệ, không còn thay đổi chưa lưu, khác nội dung live và đúng quyền. Backend chặn publish trùng bằng `VISUAL_ALREADY_PUBLISHED`.
- Lỗi API không reset form; thử lỗi kết nối và lưu lại sau khi phục hồi thành công, không nhập lại hoặc reload. Không lưu dữ liệu form vào localStorage.

## 3. Kiểm thử thực tế

Môi trường: Windows local, `http://127.0.0.1:3105`, PostgreSQL **qavio_test** loopback55432, media `.runtime/media`, email/forms đóng. Tài khoản ADMIN/EDITOR tổng hợp; mật khẩu ngẫu nhiên được giữ trong runtime private, không đưa vào báo cáo/Git. Không dùng credential production. Không tạo fixture Lead/CRM/Restaurant.

| Trường hợp | Kết quả |
| --- | --- |
| Bản cũ: sửa alt ảnh mặc định | Tái hiện: Lưu nháp vẫn disabled |
| Chưa sửa gì | Hai nút có lý do rõ; không tạo phiên bản thừa |
| Sửa alt ảnh mặc định, không upload | Lưu draft thành công cả dev và standalone build |
| Upload WebP mới → lưu nháp | Thành công; chọn đúng media mới |
| Chọn ảnh có sẵn từ thư viện → lưu nháp | Thành công, không upload lại |
| Chỉ sửa alt | Lưu được và giữ cùng media |
| Chỉ sửa chú thích | Lưu và publish được |
| Draft → publish | Nút publish bật sau save; thông báo thành công giữ trên thẻ |
| Sửa ảnh đã publish → publish phiên bản mới | Thành công; fresh public SSR dùng media mới, anonymous media HTTP200 |
| Reload Admin | Draft, lựa chọn thư viện và metadata đã lưu vẫn còn |
| Draft giống live sau publish | Publish disabled; gọi API lặp bị409 |
| Alt quá ngắn / chú thích không hợp lệ | Hiện lỗi trường, khóa lưu; backend422 |
| File sai định dạng / >5MiB | Client báo rõ; backend độc lập422/413 |
| API mất kết nối | Input vẫn nguyên; nút lưu cho retry; khôi phục server QA rồi lưu lại thành công trên production build không có hot reload |
| EDITOR | Lưu draft được; publish disabled có lý do; backend403 |
| Anonymous / CSRF / origin giả | Bị401/403 |
| Version cũ | Bị409, không ghi đè dữ liệu mới |
| Default + media đồng thời / trường path giả | Bị422 |
| Import mặc định gặp lỗi quota | Transaction rollback, không thêm MediaAsset hoặc bỏ lại file stage |

Kết quả tự động:

- ESLint toàn repo: **PASS**.
- TypeScript `tsc --noEmit`: **PASS**; Next production build cũng kiểm tra TypeScript đạt.
- Production build Next16.4.2: **PASS**. Có một lần build đầu bị Windows khóa DLL của server local cũ; dừng đúng server local giữ DLL và build lại thành công. Không thao tác VPS.
- `scripts/integration-visuals.ts`: **21 ca PASS**, gồm hồi quy14 ca cũ và7 ca mới. [Log](admin-visuals-button-audit/integration-results.txt).
- `scripts/visual-editor-state-checks.ts`: **PASS**. [Log](admin-visuals-button-audit/state-results.txt).
- HTTP public QA: **14 trang, 367 liên kết**, metadata/canonical/sitemap/404/logo PASS; 26 ảnh gallery/hash PASS.
- Browser: 1180/768/390/375px không tràn ngang; không hydration error. Lỗi fetch được gây ra có chủ đích trong ca mất mạng, không nhầm với lỗi ứng dụng ngoài ca này. [Kết quả](admin-visuals-button-audit/browser-results.json).
- Fixture tài khoản/media/content/audit của ca browser và integration đã dọn đúng theo actor IDs. Dữ liệu test tồn tại trước đó không bị reset hoặc xóa.

Chưa chạy GitHub CI/Linux vì chưa commit/push và chưa được duyệt phát hành.

## 4. Cache và hiển thị công khai

`GET /api/admin/visuals` trả no-store; client gọi qua Admin API wrapper với `cache: no-store`. `publishedVisuals()` gọi `connection()` và đọc dữ liệu cho request hiện tại; React `cache()` chỉ gom đọc trong request, không giữ bản publish cũ giữa các request.

Sau publish trên QA, fresh HTTP request trang chủ thấy alt mới và `/media/<id mới>` ngay, không cần restart. Media ID mới dùng URL mới; file cũ không bị ghi đè. Media đã công khai có max-age3600 nhưng không làm URL mới trỏ về ảnh cũ. Tab công khai đã mở sẵn cần tải lại để nhận HTML mới; không bổ sung cơ chế live push ngoài phạm vi.

## 5. File thay đổi trong task này

- `src/components/admin/visuals.tsx`: trạng thái, validation, lý do disabled, upload, thông báo và giữ dữ liệu.
- `src/lib/visual-editor-state.ts`: baseline/dirty/so sánh draft-live/validation dùng chung.
- `src/server/admin/visuals.ts`: lưu metadata default an toàn, entry/version phản hồi, chặn publish trùng.
- `src/server/admin/media.ts`: tách stage/commit/discard, giữ quota/validation/audit cũ.
- `src/components/admin/shell.tsx`: thêm nhãn lỗi riêng ảnh; không đổi authentication hoặc quyền.
- `scripts/integration-visuals.ts`, `scripts/visual-editor-state-checks.ts` và báo cáo/bằng chứng này.

Các thay đổi Contact, ảnh thiết kế hero và PWA Restaurant đã có từ task trước không nằm trong phạm vi phát hành này. Không sửa bảng giá/OAuth/trial/Lead/CRM hoặc source/database Restaurant trong task này.

## 6. Ảnh trước/sau

Các ảnh dưới đây là QA, không phải production của chủ dự án.

![Trước sửa: hai nút mờ không giải thích](admin-visuals-button-audit/before-qa.jpg)
![Sau sửa: nháp đã lưu, publish bật và thông báo thành công](admin-visuals-button-audit/after-qa.jpg)

Thêm bằng chứng: [quyền Editor](admin-visuals-button-audit/editor-qa.jpg), [lỗi mạng giữ nguyên input](admin-visuals-button-audit/network-error-qa.jpg).

## 7. Có cần deploy không?

**Đã phát hành** frontend + backend ảnh cùng nhau sau yêu cầu trực tiếp “deloy đi chứ”. Không migration, không đổi ảnh hoặc feature flags production.

Phiên production trong trình duyệt kết nối vẫn chuyển về login, nên chưa kiểm chứng các nút trong phiên cá nhân của chủ dự án. Quy trình ghi dữ liệu đã kiểm thử trên QA; production chỉ kiểm tra chỉ đọc. Chủ dự án tự chọn ảnh, lưu nháp và xuất bản nội dung mong muốn.

## 8. Phát hành production — 28/10/2026

- Source `78553bae43eccb5c24bd19d829feb50fbfe6096d`; [CI Linux 40690993510](https://github.com/herry-huynhlong/qavio/actions/runs/40690993510) và [review 40691470310](https://github.com/herry-huynhlong/qavio/actions/runs/40691470310) SUCCESS. Kiểm thử PostgreSQL cô lập, lint, TypeScript và Docker build chạy trên GitHub-hosted runner.
- Image `qavio-web:78553ba`, ID `sha256:e3409082a3816d9514e5587e57c2e046daf35cafcc0e83c73f30fad85c336dfe`. Manifest SHA256 `2275fbee75dba0c65247a7f72511bf3e732fe1e4fda718c90d95856df8b17684`; GitHub artifact digest, archive checksum, config/rootfs và source revision đều xác minh PASS.
- Backup DB/media mới, mã hóa và tải off-host; restore database cô lập thành công, đủ 5 migration. Database restore tạm và các bản giải mã được dọn sau kiểm chứng. Không restore production.
- Preflight còn 4.590.051.328 byte disk và 490.164.224 byte RAM khả dụng; gate dự trù 600 MiB cộng reserve 2.610.569.625 byte PASS. Kích thước image/layer thực tế 393.680.384 byte, kiểm lại gate trước load PASS. Sau deploy còn 4.354.535.424 byte (~4,06 GiB), RAM khả dụng 534.433.792 byte. Disk trên 80% nên tiếp tục theo dõi, không tự prune/xóa backup/volume.
- Chỉ recreate QAVIO `web` bằng image ID pin, `--no-build --pull never --no-deps`. Không build trên VPS, không migration, không restart PostgreSQL/worker/Docker Engine. Env và mounts web giữ nguyên; 6 container khác giữ ID/image/startedAt. Tổng 7/7 container chạy; web, worker QAVIO và hai PostgreSQL healthy, ba container không cấu hình healthcheck vẫn running.
- Readiness và HTTPS `/`, `/admin/login`, `/products/quanpilot`, `/contact`, `/api/ready`, QuánPilot `/restaurant-login` PASS. Browser reload trang sản phẩm hiển thị bình thường; `/admin/visuals` chuyển về login khi chưa có phiên. Không tuyên bố đã nghiệm thu thao tác ghi trong phiên Admin production.
- Hash nội dung visual + MediaAsset và danh sách URL ảnh SSR trang chủ/trang sản phẩm không đổi trước/sau. Không upload/publish QA hoặc thay ảnh hero/sản phẩm.
- Bằng chứng an toàn tại [deployment](admin-visuals-button-audit/deployment/): build, CI review, artifact, backup restore, deploy và smoke. Không chứa credential/private runtime model.
- Rollback giữ image trước `qavio-web:eaae2b4`, ID `sha256:40aac20c462f5531d14a2ee5a98c1afc7c0642068443084e30e1f52ad2322c86`; private snapshot `/opt/websites/qavio/.runtime/visual-buttons-release-20261028/snapshot/`. Khi cần, khôi phục `.env` từ `environment.private`, chạy Compose project `qavio` với `rollback.private.json`, `up -d --no-build --pull never --no-deps web`, rồi kiểm readiness/HTTPS. Không restore DB để đảo code. Archive image mới đã được bỏ sau load; image rollback còn giữ.
