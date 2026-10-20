# YÊU CẦU XÂY DỰNG WEBSITE CÔNG TY QAVIO

## 1. Tổng quan dự án

Tôi muốn xây dựng một website chính thức cho công ty mang thương hiệu **QAVIO**.

Đây là dự án mới, hoạt động độc lập với hệ thống QuánPilot đang phát triển tại `D:\anh\Restaurant`.

Website QAVIO là nơi khách hàng tìm hiểu công ty, khám phá sản phẩm, dịch vụ, đăng ký tư vấn, yêu cầu báo giá, theo dõi thông tin và liên hệ hợp tác.

Yêu cầu xây dựng một website thực sự có thể đưa vào hoạt động kinh doanh, không phải một landing page minh họa hoặc chỉ có giao diện tĩnh.

### Định vị thương hiệu

- Tên thương hiệu: QAVIO
- Định hướng: Công ty công nghệ cung cấp giải pháp số cho doanh nghiệp.
- Sản phẩm đầu tiên: QuánPilot — nền tảng quản lý nhà hàng, quán ăn và quán nước.
- Định hướng dài hạn: Phát triển hệ sinh thái sản phẩm và giải pháp công nghệ QAVIO.
- Phong cách: Sang trọng, đáng tin cậy, tinh tế, hiện đại, công nghệ cao.
- Ngôn ngữ chính: Tiếng Việt.
- Kiến trúc sẵn sàng mở rộng tiếng Anh trong tương lai.

Logo được cung cấp riêng dưới dạng hình ảnh `Qavio.png`.

Logo có biểu tượng chữ Q/A cách điệu màu vàng kim, chữ QAVIO và thông điệp:

**QUALITY · AESTHETIC · VISION · INNOVATION · ORIGINALITY**

Không tự ý thay đổi logo chính thức.

Không tự tạo thông tin pháp lý, địa chỉ, số điện thoại, khách hàng, chứng nhận, đối tác hoặc thành tích chưa được xác minh.

---

# 2. Nguyên tắc triển khai

Trước khi viết code:

1. Kiểm tra repository hiện tại, cấu trúc thư mục và các file cấu hình.
2. Xác định công nghệ đang sử dụng và những chức năng đã có.
3. Đề xuất cấu trúc phù hợp trước khi triển khai.
4. Không xóa hoặc ghi đè mã nguồn không liên quan.
5. Không sao chép toàn bộ hệ thống QuánPilot sang QAVIO.
6. Không kết nối database của QAVIO trực tiếp với database vận hành nhà hàng.
7. Không đưa secret hoặc thông tin nhạy cảm vào repository.
8. Không thực hiện deploy production khi chưa được xác nhận.

Nếu repository `qavio` đang trống thì khởi tạo một dự án mới.

Ưu tiên công nghệ:

- Next.js với App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- React Hook Form và Zod
- Hệ thống gửi email thông qua nhà cung cấp có cấu hình
- Docker để triển khai
- Kiến trúc modular dễ bảo trì

Không cần microservices hoặc hạ tầng phức tạp ở giai đoạn đầu.

Website public và hệ thống admin có thể nằm trong cùng ứng dụng nhưng phải phân tách quyền truy cập, route, logic và dữ liệu phù hợp.

---

# 3. Thiết kế thương hiệu QAVIO

## 3.1. Bộ màu

Dựa trên logo được cung cấp:

- Navy tối: `#081320`
- Navy: `#101F31`
- Navy sáng: `#1A2B40`
- Vàng kim: `#D4AF67`
- Vàng sáng: `#F0D69B`
- Trắng: `#FFFFFF`
- Trắng ngà: `#F5F3EE`
- Xám chữ phụ: `#A9B3C1`

Đây là màu tham khảo; có thể tinh chỉnh để phù hợp với hình ảnh logo thực tế.

Website không được sử dụng màu vàng kim quá nhiều. Màu vàng chỉ dùng để nhấn mạnh các thành phần quan trọng.

## 3.2. Phong cách thiết kế

Tạo cảm giác một công ty công nghệ cao cấp:

- Bố cục rộng rãi.
- Typography hiện đại, dễ đọc tiếng Việt.
- Khoảng trắng cân đối.
- Card thanh lịch.
- Đường viền mảnh.
- Hiệu ứng hover nhẹ nhàng.
- Animation tinh tế.
- Nền navy và các khu vực sáng xen kẽ hợp lý.
- Icon đồng nhất.
- Hình minh họa sản phẩm rõ ràng.
- Không sử dụng hiệu ứng 3D hoặc animation nặng gây chậm website.

Ưu tiên tính thẩm mỹ nhưng không đánh đổi tốc độ và khả năng sử dụng.

## 3.3. Logo

Logo gốc có thể được sử dụng tại hero hoặc các khu vực thương hiệu.

Tuy nhiên, hình ảnh gốc có nền và họa tiết trang trí. Không sử dụng nguyên ảnh đó làm logo nhỏ trong navigation nếu nó khiến chữ khó đọc.

Cần chuẩn bị các biến thể:

- Logo đầy đủ.
- Logo dùng trên nền tối.
- Logo dùng trên nền sáng.
- Biểu tượng QAVIO riêng cho favicon.
- Logo phù hợp màn hình mobile.

Chỉ được tách hoặc xử lý từ tài sản thương hiệu được cung cấp nếu chất lượng bảo đảm. Không tự suy diễn hoặc vẽ lại biểu tượng sai hình dạng.

Nếu thiếu tài sản phù hợp, tạo vị trí thay thế rõ ràng và yêu cầu cung cấp file logo chuẩn.

---

# 4. Cấu trúc website

Thiết kế các trang sau:

| Đường dẫn | Chức năng |
|---|---|
| `/` | Trang chủ |
| `/about` | Giới thiệu QAVIO |
| `/solutions` | Giải pháp công nghệ |
| `/products` | Danh sách sản phẩm |
| `/products/quanpilot` | Chi tiết QuánPilot |
| `/pricing` | Gói dịch vụ và báo giá |
| `/news` | Tin tức và kiến thức |
| `/news/[slug]` | Chi tiết bài viết |
| `/contact` | Liên hệ |
| `/request-demo` | Đăng ký tư vấn / demo |
| `/subscribe` | Đăng ký nhận thông tin |
| `/faq` | Câu hỏi thường gặp |
| `/privacy` | Chính sách bảo mật |
| `/terms` | Điều khoản sử dụng |
| `/admin` | Khu vực quản trị riêng |

Có thể dùng URL nội bộ không dấu, tên hiển thị tiếng Việt.

Thêm trang 404, trang lỗi và các trạng thái loading cần thiết.

---

# 5. Trang chủ QAVIO

Đây là trang quan trọng nhất.

## 5.1. Header

Header có:

- Logo QAVIO.
- Trang chủ.
- Về QAVIO.
- Giải pháp.
- Sản phẩm.
- Bảng giá.
- Tin tức.
- Liên hệ.
- Nút **Đăng ký tư vấn**.

Header sticky, chuyển trạng thái phù hợp khi scroll.

Mobile có menu dễ thao tác.

## 5.2. Hero

Thiết kế hero cao cấp sử dụng màu navy và logo vàng kim.

Nội dung đề xuất:

**QAVIO**

**Công nghệ kiến tạo giá trị. Giải pháp đồng hành cùng doanh nghiệp.**

"QAVIO hướng đến việc phát triển những giải pháp công nghệ hiện đại, giúp doanh nghiệp đơn giản hóa hoạt động, nâng cao hiệu quả quản lý và tạo ra trải nghiệm tốt hơn cho khách hàng."

Hai nút:

- Khám phá giải pháp
- Liên hệ tư vấn

Bên dưới có dòng:

**QUALITY · AESTHETIC · VISION · INNOVATION · ORIGINALITY**

Hero phải đẹp trên màn hình desktop lẫn điện thoại.

## 5.3. Giới thiệu ngắn về QAVIO

Tiêu đề:

**QAVIO — Công nghệ được xây dựng từ nhu cầu thực tế**

Nội dung:

"Chúng tôi tin rằng công nghệ hiệu quả không chỉ nằm ở những tính năng tiên tiến, mà còn ở khả năng giải quyết những vấn đề thực tế trong hoạt động kinh doanh.

QAVIO tập trung xây dựng các sản phẩm có trải nghiệm trực quan, quy trình rõ ràng và khả năng phát triển bền vững cùng doanh nghiệp."

Nút: **Tìm hiểu về QAVIO**

## 5.4. Giá trị thương hiệu

Thiết kế 5 khối giá trị tương ứng logo:

**Quality — Chất lượng**

Chú trọng tính ổn định, sự chính xác và chất lượng trong từng giải pháp.

**Aesthetic — Thẩm mỹ**

Đề cao trải nghiệm trực quan, sự tinh tế và tính dễ sử dụng.

**Vision — Tầm nhìn**

Xây dựng các nền tảng có khả năng thích ứng với nhu cầu phát triển lâu dài.

**Innovation — Đổi mới**

Liên tục cải tiến công nghệ và phương pháp giải quyết vấn đề.

**Originality — Bản sắc**

Phát triển sản phẩm có tư duy riêng, hướng đến những nhu cầu thực tế của người sử dụng.

## 5.5. Sản phẩm nổi bật

Tiêu đề:

**Giải pháp công nghệ từ QAVIO**

Giới thiệu QuánPilot:

**QuánPilot — Quản lý nhà hàng thông minh, vận hành thuận tiện hơn**

"QuánPilot là nền tảng hỗ trợ quản lý nhà hàng, quán ăn và quán nước trên một hệ thống thống nhất. Từ khách hàng quét mã QR để gọi món, nhân viên tiếp nhận và xử lý đơn, đến thu ngân thanh toán và chủ quán theo dõi hoạt động kinh doanh."

Các điểm nổi bật:

- Menu QR và đặt món tại bàn.
- Quản lý bàn và đơn hàng.
- Phối hợp phục vụ, bếp và thu ngân.
- Thanh toán và in hóa đơn.
- Quản lý nhân viên.
- Báo cáo doanh thu.
- Quản lý nhiều nhà hàng.

Nút:

- Tìm hiểu QuánPilot
- Đăng ký trải nghiệm

Không đưa các tính năng chưa hoàn thiện vận hành vào nhóm cam kết tuyệt đối.

Có thể giới thiệu khu vực "Sản phẩm tiếp theo" nhưng không tự tạo sản phẩm giả.

## 5.6. Giải pháp cho doanh nghiệp

Tiêu đề:

**Giải pháp phù hợp với nhu cầu vận hành thực tế**

Ba hướng nội dung ban đầu:

1. **Số hóa quy trình:** Giảm các thao tác thủ công, tập trung thông tin và cải thiện sự phối hợp giữa các bộ phận.
2. **Quản lý tập trung:** Theo dõi hoạt động kinh doanh từ một hệ thống thống nhất.
3. **Nâng cao trải nghiệm khách hàng:** Ứng dụng công nghệ để mang lại trải nghiệm thuận tiện, nhất quán và hiện đại.

Các giải pháp ngoài QuánPilot nên được trình bày là định hướng hoặc lĩnh vực QAVIO quan tâm, không khẳng định đã triển khai cho khách hàng.

## 5.7. Quy trình hợp tác

Tiêu đề:

**Bắt đầu cùng QAVIO thật đơn giản**

Bốn bước:

1. Gửi yêu cầu tư vấn.
2. Trao đổi nhu cầu.
3. Khám phá giải pháp phù hợp.
4. Triển khai và đồng hành.

Đây là quy trình dự kiến, có thể chỉnh sửa trong admin.

## 5.8. Tin tức

Hiển thị ba bài viết mới nhất đã xuất bản.

Các danh mục:

- Tin tức QAVIO.
- Sản phẩm.
- Công nghệ.
- Kiến thức quản lý.
- Chuyển đổi số.

## 5.9. Đăng ký nhận thông tin

Tiêu đề:

**Đồng hành cùng sự phát triển của QAVIO**

Nội dung:

"Đăng ký nhận những thông tin mới về sản phẩm, giải pháp và các bài viết hữu ích từ QAVIO."

Form:

- Email.
- Tùy chọn tên.
- Đồng ý nhận thông tin.
- Nút đăng ký.

Phải có cơ chế xác nhận email và hủy đăng ký.

## 5.10. CTA cuối trang

**Sẵn sàng tìm kiếm một giải pháp phù hợp cho doanh nghiệp của bạn?**

"Hãy chia sẻ nhu cầu của bạn. QAVIO sẵn sàng tìm hiểu và trao đổi về những khả năng ứng dụng công nghệ phù hợp."

Nút:

- Yêu cầu tư vấn
- Liên hệ QAVIO

---

# 6. Trang giới thiệu công ty

Đường dẫn `/about`.

Tiêu đề:

**Về QAVIO**

Phụ đề:

**Kiến tạo giải pháp công nghệ bằng chất lượng, thẩm mỹ và tư duy đổi mới.**

Các khu vực:

### QAVIO là ai?

"QAVIO là thương hiệu công nghệ định hướng phát triển các giải pháp phần mềm phục vụ hoạt động kinh doanh và quản lý doanh nghiệp.

Chúng tôi lựa chọn cách tiếp cận lấy nhu cầu thực tế làm trung tâm, chú trọng trải nghiệm người dùng, tính minh bạch trong vận hành và khả năng mở rộng của sản phẩm."

### Sứ mệnh

"Đơn giản hóa những quy trình phức tạp bằng công nghệ dễ tiếp cận, góp phần giúp doanh nghiệp vận hành hiệu quả hơn."

### Tầm nhìn

"Phát triển QAVIO thành một hệ sinh thái giải pháp công nghệ có giá trị thực tiễn, đồng hành cùng sự phát triển của các doanh nghiệp."

### Triết lý sản phẩm

"Đẹp trong thiết kế. Rõ ràng trong trải nghiệm. Thiết thực trong vận hành."

### Giá trị cốt lõi

Sử dụng năm giá trị QUALITY, AESTHETIC, VISION, INNOVATION, ORIGINALITY.

Không tự đưa các con số như số năm hoạt động, số lượng khách hàng, đội ngũ, tỷ lệ tăng trưởng hoặc quy mô công ty khi chưa có dữ liệu xác minh.

---

# 7. Trang sản phẩm QuánPilot

Đường dẫn `/products/quanpilot`.

Đây là trang giới thiệu sản phẩm chính, giúp chuyển đổi người xem thành khách hàng tiềm năng.

## Hero

**QuánPilot**

**Quản lý quán thuận tiện hơn, kết nối mọi bộ phận trong một hệ thống.**

"QuánPilot hỗ trợ số hóa quy trình phục vụ, đặt món, quản lý bàn, xử lý đơn hàng, thanh toán và theo dõi kinh doanh cho nhà hàng, quán ăn và quán nước."

Nút:

- Đăng ký tư vấn
- Yêu cầu demo

## Các nhóm tính năng

### Khách hàng gọi món bằng QR

Khách quét mã tại bàn, xem menu, chọn món, gửi yêu cầu và theo dõi các món đã gọi.

### Quản lý bàn và đơn hàng

Theo dõi phiên bàn, trạng thái phục vụ, đơn mới và các yêu cầu từ khách.

### Phối hợp giữa phục vụ và bếp

Nhân viên phục vụ và bộ phận bếp tiếp nhận, cập nhật và xử lý công việc theo vai trò.

### Thu ngân và thanh toán

Hỗ trợ xem tạm tính, xác nhận thanh toán, đóng bàn và in hóa đơn theo khả năng tích hợp thiết bị thực tế.

### Quản lý thực đơn

Tạo danh mục, món ăn, giá bán và thông tin hiển thị cho khách.

### Quản lý nhân viên

Phân quyền chủ quán, quản lý, phục vụ, bếp, thu ngân; hỗ trợ quản lý quyền và thiết bị nhân viên.

### Báo cáo kinh doanh

Theo dõi doanh thu từ các hóa đơn đã thanh toán, lịch sử thanh toán và món bán chạy.

### Hệ thống nhiều nhà hàng

Cấu trúc dữ liệu và quyền truy cập phân tách theo nhà hàng.

## Hình ảnh sản phẩm

Không dùng dashboard giả rồi trình bày như ảnh hệ thống thật.

Nếu có thể truy cập `D:\anh\Restaurant`, kiểm tra xem có screenshot hoặc tài sản giao diện nào được phép sử dụng.

Nếu chưa có thì xây dựng khu vực mockup với nhãn minh họa, chờ screenshot thật.

## Câu hỏi thường gặp

- QuánPilot phù hợp với mô hình quán nào?
- Khách hàng có cần cài đặt ứng dụng không?
- Chủ quán quản lý nhân viên như thế nào?
- Có thể quản lý nhiều cơ sở không?
- Làm thế nào để đăng ký tư vấn?
- Làm sao để nhận thông tin về gói dịch vụ?

Không cam kết tính năng offline hoàn toàn, uptime, thời gian hỗ trợ hoặc tương thích mọi loại máy in nếu chưa kiểm chứng.

## Đăng ký trải nghiệm

Form đăng ký có thông tin:

- Họ tên.
- Số điện thoại.
- Email.
- Tên nhà hàng hoặc quán.
- Loại hình kinh doanh.
- Số cơ sở (tùy chọn).
- Nhu cầu chính.
- Lời nhắn.
- Đồng ý chính sách bảo mật.

Dữ liệu đưa về hệ thống quản trị QAVIO.

Không tự động tạo tài khoản QuánPilot ở giai đoạn này nếu chưa có tích hợp an toàn và chính thức.

---

# 8. Trang bảng giá

Đường dẫn `/pricing`.

Thiết kế trang bảng giá linh hoạt theo sản phẩm.

Riêng QuánPilot:

- Có các gói BASIC và PRO.
- Có lựa chọn thời hạn 3, 6, 12 tháng.
- Giá, tính năng và điều kiện phải được quản lý từ nguồn dữ liệu có thẩm quyền.
- Không tự suy diễn mức giá.
- Không sao chép các giá chưa được xác minh từ môi trường khác.

Nếu chưa có bảng giá chính thức, hiển thị thông điệp:

**Liên hệ QAVIO để nhận thông tin gói dịch vụ phù hợp.**

Các nút:

- Nhận tư vấn
- Yêu cầu báo giá

Không xây dựng thanh toán gói subscription trực tiếp trên website QAVIO trong giai đoạn này.

Thanh toán và quản lý subscription của QuánPilot vẫn thuộc hệ thống QuánPilot riêng.

---

# 9. Trang giải pháp

Đường dẫn `/solutions`.

Trang trình bày cách QAVIO tiếp cận các nhu cầu chuyển đổi số.

Các chủ đề:

1. Số hóa vận hành.
2. Quản lý công việc và thông tin.
3. Tối ưu trải nghiệm khách hàng.
4. Xây dựng nền tảng có khả năng mở rộng.

Mỗi mục có:

- Vấn đề phổ biến.
- Phương pháp tiếp cận.
- Lợi ích kỳ vọng.
- Sản phẩm QAVIO liên quan (nếu có).
- Nút liên hệ tư vấn.

Không công bố những dịch vụ mà QAVIO chưa xác nhận sẽ cung cấp như các cam kết thương mại chính thức.

---

# 10. Trang liên hệ

Đường dẫn `/contact`.

Thiết kế đẹp, đầy đủ thông tin và thân thiện.

Tiêu đề:

**Kết nối với QAVIO**

Nội dung:

"Bạn đang tìm hiểu một giải pháp công nghệ, quan tâm đến QuánPilot hoặc mong muốn trao đổi cơ hội hợp tác? Hãy gửi thông tin để QAVIO có thể tiếp nhận yêu cầu của bạn."

Form:

- Họ và tên.
- Email.
- Số điện thoại.
- Công ty hoặc nhà hàng (tùy chọn).
- Chủ đề liên hệ.
- Nội dung.
- Đồng ý xử lý dữ liệu theo chính sách bảo mật.

Chủ đề gồm:

- Tìm hiểu sản phẩm.
- Đăng ký tư vấn.
- Yêu cầu báo giá.
- Hỗ trợ.
- Hợp tác.
- Khác.

Sau khi gửi:

- Hiển thị thông báo thành công.
- Lưu dữ liệu vào PostgreSQL.
- Tạo thông báo cho quản trị viên.
- Gửi email thông báo nếu dịch vụ email đã cấu hình.
- Không làm lộ thông tin hệ thống nếu gửi thất bại.

Thông tin liên hệ phải lấy từ cấu hình quản trị:

- Email.
- Hotline.
- Địa chỉ.
- Giờ làm việc.
- Facebook.
- Zalo.
- LinkedIn.
- Các kênh khác.

Nếu chưa được cấu hình thì ẩn thông tin tương ứng, không tạo dữ liệu giả.

Không tự thêm bản đồ địa chỉ chưa được xác minh.

---

# 11. Hệ thống thu thập khách hàng tiềm năng

Xây dựng luồng lead management thực sự.

Các nguồn lead:

- Form liên hệ.
- Đăng ký tư vấn.
- Đăng ký demo QuánPilot.
- Yêu cầu báo giá.
- Form đăng ký từ trang sản phẩm.

Mỗi lead gồm:

- ID.
- Họ tên.
- Email.
- Số điện thoại.
- Tên doanh nghiệp.
- Sản phẩm quan tâm.
- Chủ đề.
- Nội dung.
- Nguồn đăng ký.
- Thời gian tạo.
- Trạng thái xử lý.
- Ghi chú nội bộ.
- Nhân viên phụ trách nếu có.
- Thời gian cập nhật.

Trạng thái:

- NEW.
- CONTACTED.
- QUALIFIED.
- CONVERTED.
- CLOSED.
- SPAM.

Admin có thể:

- Xem danh sách.
- Tìm kiếm.
- Lọc theo trạng thái.
- Xem chi tiết.
- Đánh dấu đã liên hệ.
- Ghi chú.
- Phân công xử lý nếu có nhiều tài khoản admin.
- Xuất CSV theo quyền.

Không làm mất lịch sử xử lý khi đổi trạng thái.

Cần có audit log đối với thao tác quan trọng.

---

# 12. Đăng ký theo dõi QAVIO

Xây dựng hệ thống newsletter.

Khách hàng có thể:

- Đăng ký email.
- Xác nhận qua email.
- Nhận thông tin về sản phẩm và tin tức.
- Hủy đăng ký bằng liên kết riêng.
- Đăng ký lại khi có nhu cầu.

Dữ liệu cần có:

- Email.
- Tên.
- Trạng thái chờ xác nhận / đang đăng ký / hủy đăng ký.
- Nguồn đăng ký.
- Thời gian.
- Bằng chứng đồng ý nhận thông tin ở mức cần thiết.
- Lịch sử xác nhận hoặc hủy.

Yêu cầu:

- Không gửi email marketing trước khi xác nhận đăng ký.
- Token xác nhận có hạn sử dụng.
- Token hủy đăng ký phải an toàn.
- Không lộ danh sách email người dùng.
- Không tạo bản ghi trùng.
- Có chính sách chống spam.
- Hỗ trợ export dữ liệu theo quyền.

Có trang admin quản lý danh sách người theo dõi.

Chỉ xây dựng chức năng gửi chiến dịch newsletter khi có hệ thống email và cơ chế kiểm soát tần suất phù hợp.

---

# 13. Tin tức và bài viết

Xây dựng một CMS nhỏ trong admin.

Mỗi bài viết gồm:

- Tiêu đề.
- Slug.
- Tóm tắt.
- Nội dung.
- Ảnh đại diện.
- Danh mục.
- Tác giả hiển thị.
- Meta title.
- Meta description.
- Ảnh chia sẻ.
- Trạng thái nháp / xuất bản.
- Thời gian đăng.
- Thời gian chỉnh sửa.

Chức năng:

- Tạo bài.
- Chỉnh sửa.
- Xem trước.
- Lưu nháp.
- Xuất bản.
- Gỡ xuất bản.
- Xóa theo cơ chế phù hợp.
- Tìm kiếm và lọc.

Trang `/news` có phân trang và bộ lọc danh mục.

Trang bài viết có:

- Nội dung dễ đọc.
- Mục lục nếu cần.
- Bài viết liên quan.
- Nút chia sẻ.
- CTA liên hệ hoặc tìm hiểu sản phẩm.

Xử lý nội dung để ngăn XSS. Không cho phép HTML tùy ý nguy hiểm từ editor.

Có thể tạo 3–5 bài nháp mẫu mang tính giới thiệu, nhưng không tự xuất bản các thông tin sự kiện hoặc thành tích chưa được xác minh.

---

# 14. Hệ thống quản trị QAVIO

Đường dẫn `/admin`.

Giao diện admin sử dụng thiết kế hiện đại, dễ thao tác.

## Dashboard

Hiển thị:

- Tổng lead.
- Lead mới.
- Lead đang xử lý.
- Tổng người theo dõi đã xác nhận.
- Số bài viết đã xuất bản.
- Số yêu cầu demo.
- Thống kê lead theo ngày hoặc tháng.

## Menu quản trị

- Tổng quan.
- Khách hàng tiềm năng.
- Đăng ký demo.
- Người theo dõi.
- Bài viết.
- Sản phẩm.
- Nội dung website.
- Thông tin công ty.
- Tài khoản quản trị.
- Nhật ký hoạt động.
- Cài đặt.

## Quản lý nội dung website

Admin cần có thể chỉnh sửa:

- Nội dung hero.
- Giới thiệu công ty.
- Sứ mệnh và tầm nhìn.
- Các CTA.
- Thông tin sản phẩm.
- Hình ảnh nội dung.
- FAQ.
- Footer.
- Thông tin liên hệ.
- Liên kết mạng xã hội.
- SEO mặc định.

Không cần tạo page builder phức tạp.

Ưu tiên CMS theo các section có cấu trúc rõ ràng, validation tốt và dễ duy trì.

## Phân quyền

Tối thiểu:

**SUPER_ADMIN**

Toàn quyền, bao gồm quản lý tài khoản admin và cấu hình hệ thống.

**ADMIN**

Quản lý nội dung, lead, bài viết và các cấu hình kinh doanh được phép.

**EDITOR**

Quản lý bài viết và nội dung được phân quyền, không truy cập cài đặt bảo mật và quản lý admin.

Tất cả quyền phải kiểm tra ở backend, không chỉ ẩn nút trên frontend.

Tài khoản admin đầu tiên phải được tạo bằng quy trình bootstrap an toàn, không sử dụng mật khẩu cố định trong code.

---

# 15. Database

Sử dụng PostgreSQL độc lập.

Các model dự kiến:

- AdminUser.
- AdminSession / tài nguyên xác thực phù hợp.
- Lead.
- LeadActivity.
- DemoRequest (hoặc Lead với loại riêng, tránh trùng dữ liệu).
- NewsletterSubscriber.
- NewsletterConsentEvent.
- BlogPost.
- BlogCategory.
- Product.
- ProductFeature.
- WebsiteContent.
- CompanySettings.
- MediaAsset.
- AuditLog.

Codex tự thiết kế quan hệ và schema tối ưu, tránh tạo model trùng lặp không cần thiết.

Yêu cầu:

- Unique constraints.
- Foreign keys.
- Index cho danh sách lớn.
- createdAt / updatedAt.
- Migration có thể tái lập.
- Seed an toàn.
- Không chứa dữ liệu khách hàng giả trong production.
- Cơ chế backup và restore được tài liệu hóa.

---

# 16. SEO và khả năng tìm kiếm Google

Website phải được thiết kế chuẩn SEO.

Bao gồm:

- Semantic HTML.
- Metadata riêng cho từng trang.
- Canonical URL.
- Open Graph.
- Twitter/X card.
- Sitemap.xml.
- Robots.txt.
- Structured data JSON-LD phù hợp.
- Breadcrumb cho các trang chi tiết.
- Slug thân thiện.
- Trang 404.
- Nội dung render phù hợp với công cụ tìm kiếm.

Các từ khóa định hướng:

- QAVIO.
- Công ty công nghệ QAVIO.
- QuánPilot.
- Phần mềm quản lý nhà hàng.
- Phần mềm quản lý quán ăn.
- Phần mềm quản lý quán nước.
- Menu QR.
- Quản lý đơn hàng nhà hàng.
- Giải pháp chuyển đổi số doanh nghiệp.

Không nhồi nhét từ khóa.

Không tạo review, rating, FAQ schema hay thông tin doanh nghiệp giả.

Dùng domain qua biến môi trường hoặc cấu hình khi domain chính thức chưa có.

---

# 17. Bảo mật

Bảo mật là yêu cầu bắt buộc.

- Validate dữ liệu tại backend.
- Chống SQL injection thông qua ORM và truy vấn an toàn.
- Chống XSS.
- Bảo vệ CSRF phù hợp với cơ chế xác thực.
- Rate limiting cho login, contact, demo và newsletter.
- Chống spam và bot.
- Session/cookie bảo mật.
- Hash mật khẩu bằng thuật toán phù hợp.
- Không đưa secret ra client.
- Không ghi mật khẩu hoặc token nhạy cảm vào log.
- Kiểm tra quyền trên mọi thao tác admin.
- Audit log cho hành động quan trọng.
- Giới hạn kích thước và loại file upload.
- Bảo vệ khỏi việc upload file nguy hiểm.
- Không tiết lộ danh sách subscriber qua public API.
- Có cơ chế xử lý dữ liệu cá nhân và yêu cầu xóa dữ liệu theo chính sách áp dụng.

Không tự khẳng định website đạt chứng nhận bảo mật hoặc tuân thủ pháp lý khi chưa được đánh giá.

---

# 18. Hiệu năng và trải nghiệm

Website cần:

- Responsive hoàn chỉnh.
- Mobile-first.
- Tối ưu ảnh.
- Lazy loading hợp lý.
- Font hỗ trợ tiếng Việt.
- Giao diện hoạt động bằng bàn phím.
- Hỗ trợ screen reader.
- Đảm bảo contrast dễ đọc.
- Animation tôn trọng `prefers-reduced-motion`.
- Tránh layout shift.
- Không có horizontal overflow trên mobile.
- Loading / empty / error / success states đầy đủ.
- Form có thông báo lỗi rõ ràng.

Mục tiêu Lighthouse tốt, đặc biệt ở Performance, Accessibility, Best Practices và SEO; cần đo bằng bản build production thực tế, không tự tuyên bố đạt điểm tuyệt đối.

---

# 19. Footer

Footer thiết kế navy đậm, có đường nhấn vàng kim.

Cột 1:

**QAVIO**

"Công nghệ kiến tạo giá trị. Giải pháp đồng hành cùng doanh nghiệp."

Cột 2 — Khám phá:

- Giới thiệu.
- Giải pháp.
- Sản phẩm.
- Tin tức.

Cột 3 — Hỗ trợ:

- Liên hệ.
- Đăng ký tư vấn.
- Câu hỏi thường gặp.

Cột 4 — Pháp lý:

- Chính sách bảo mật.
- Điều khoản sử dụng.

Thông tin:

- Email.
- Hotline.
- Địa chỉ.
- Mạng xã hội.

Chỉ hiển thị những trường đã được cấu hình hợp lệ.

Copyright:

**© QAVIO. All rights reserved.**

Không tự khẳng định QAVIO đã là pháp nhân đăng ký kinh doanh nếu chưa có thông tin pháp lý.

---

# 20. Email và thông báo

Thiết kế email template theo thương hiệu QAVIO.

Các email cần hỗ trợ:

1. Thông báo admin có lead mới.
2. Xác nhận đã nhận yêu cầu liên hệ.
3. Xác nhận đăng ký newsletter.
4. Xác nhận đăng ký newsletter thành công.
5. Thông báo trạng thái hủy newsletter.

Dùng email provider được cấu hình qua environment variables.

Nếu chưa có API key hoặc thông tin SMTP:

- Không giả lập là đã gửi thành công.
- Dữ liệu form vẫn có thể được ghi nhận an toàn.
- Báo trạng thái email chính xác.
- Có log phục vụ kiểm tra.
- Không làm website crash.

Cân nhắc outbox và retry cho email để tránh mất thông báo.

---

# 21. Triển khai và môi trường

Chuẩn bị:

- `.env.example`.
- Dockerfile.
- Docker Compose phù hợp.
- Prisma migrations.
- Hướng dẫn development.
- Hướng dẫn production deployment.
- Health check.
- Log an toàn.
- Cấu hình domain qua environment.
- HTTPS tại reverse proxy.
- Cơ chế backup PostgreSQL.

Không hardcode domain, tài khoản, mật khẩu hoặc thông tin ngân hàng.

Website QAVIO không sử dụng database QuánPilot.

Nếu cùng một VPS với QuánPilot, phải tách container, database, môi trường và cấu hình để tránh ảnh hưởng hệ thống đang vận hành.

Không tự ý chỉnh sửa hoặc restart container của QuánPilot.

---

# 22. Kiểm thử

Yêu cầu tối thiểu:

### Kiểm thử giao diện

- Desktop.
- Tablet.
- Mobile.
- Menu.
- Header và footer.
- Các trang công khai.
- Form.
- Responsive.

### Kiểm thử nghiệp vụ

- Gửi liên hệ thành công.
- Validate form.
- Tạo lead.
- Chống tạo trùng khi submit lặp.
- Phân quyền admin.
- Thay đổi trạng thái lead.
- Ghi chú lead.
- Tạo và xuất bản bài viết.
- Đăng ký email.
- Xác nhận email.
- Hủy đăng ký email.
- Không gửi email marketing cho người chưa xác nhận.

### Kiểm thử bảo mật

- User chưa đăng nhập không truy cập admin.
- Editor không thể thực hiện quyền admin.
- API không bị vượt quyền.
- Rate limiting.
- XSS.
- Upload validation.
- Không lộ secret.

### Kiểm thử kỹ thuật

- Typecheck.
- Lint.
- Unit test.
- Integration test.
- Production build.
- Kiểm tra migrations với database test riêng.

---

# 23. Các giai đoạn thực hiện

Không viết toàn bộ hệ thống một cách vội vàng rồi bỏ qua kiểm tra.

Chia thành các giai đoạn:

## Giai đoạn A — Nền tảng và thiết kế

- Kiểm tra repository.
- Khởi tạo dự án.
- Thiết lập TypeScript, Next.js, Tailwind.
- Xây dựng design system.
- Xử lý tài sản logo.
- Header/footer.
- Responsive.
- Trang chủ giao diện hoàn chỉnh.

## Giai đoạn B — Nội dung công khai

- About.
- Solutions.
- Products.
- QuánPilot.
- Pricing.
- Contact.
- FAQ.
- Privacy.
- Terms.
- SEO cơ bản.

## Giai đoạn C — Database và lead

- PostgreSQL.
- Prisma.
- Lead management.
- Contact form.
- Demo request.
- Newsletter và xác nhận email.
- Kiểm thử.

## Giai đoạn D — Admin và CMS

- Authentication.
- Authorization.
- Dashboard.
- Quản lý lead.
- Quản lý subscriber.
- Blog CMS.
- Nội dung website.
- Cài đặt công ty.
- Audit log.

## Giai đoạn E — Hoàn thiện

- Email.
- SEO nâng cao.
- Security.
- Performance.
- Test.
- Docker.
- Tài liệu deploy.
- Chuẩn bị staging.

Sau mỗi giai đoạn phải báo cáo:

- Những gì đã hoàn thành.
- Những file chính đã thay đổi.
- Migration mới.
- Kết quả test.
- Tính năng chưa hoàn thiện.
- Các thông tin còn cần tôi cung cấp.

Không tuyên bố hoàn thành khi chưa thực sự build và kiểm thử.

---

# 24. Những điều không được làm

1. Không sửa trực tiếp dự án `D:\anh\Restaurant` nếu tôi chưa yêu cầu.
2. Không đưa source QuánPilot vào repository QAVIO.
3. Không kết nối hoặc thay đổi database QuánPilot.
4. Không tạo logo mới khác với thương hiệu được cung cấp.
5. Không tạo công ty, địa chỉ, hotline hoặc email giả.
6. Không tự đăng thông tin khách hàng, đối tác, đánh giá hay thành tích giả.
7. Không triển khai thanh toán hoặc webhook SePay vào website QAVIO lúc này.
8. Không đưa dữ liệu demo nhạy cảm lên môi trường thật.
9. Không đưa secret vào Git.
10. Không tự deploy lên production.
11. Không bỏ qua admin và backend để chỉ làm landing page tĩnh.
12. Không cài đặt dependency dư thừa hoặc tạo kiến trúc quá phức tạp.

---

# 25. Tiêu chí nghiệm thu

Website được xem là hoàn thành khi:

- Giao diện QAVIO đồng nhất theo thương hiệu navy/vàng kim.
- Các trang chính hiển thị đầy đủ.
- Responsive tốt.
- Menu và liên kết hoạt động.
- Form liên hệ lưu dữ liệu thật.
- Đăng ký demo tạo lead.
- Newsletter có xác nhận và hủy đăng ký.
- Admin đăng nhập an toàn.
- Admin xem và quản lý lead.
- Admin quản lý bài viết và nội dung.
- Có database và migrations.
- Có SEO cơ bản.
- Có chống spam và rate limiting.
- Có kiểm thử chức năng quan trọng.
- Build production thành công.
- Có hướng dẫn chạy local và deploy.
- Không ảnh hưởng QuánPilot.
- Không có thông tin doanh nghiệp giả được công bố.

---

# 26. Yêu cầu cuối cùng dành cho Codex

Hãy tiếp cận dự án như đang xây dựng website thương hiệu chính thức cho một công ty công nghệ có định hướng phát triển lâu dài.

Tôi cần một sản phẩm thực tế, đẹp, chuyên nghiệp, ổn định và có thể mở rộng.

Ưu tiên trải nghiệm khách hàng và khả năng chuyển đổi thành khách hàng tiềm năng.

**QAVIO phải là thương hiệu trung tâm; QuánPilot là sản phẩm đầu tiên, không phải toàn bộ bản sắc công ty.**

Trước tiên:

1. Đọc repository hiện tại.
2. Báo cáo cấu trúc đang có.
3. Đề xuất kiến trúc và kế hoạch triển khai.
4. Liệt kê thông tin/tài sản cần tôi cung cấp.
5. Triển khai Giai đoạn A sau khi đã xác định phạm vi an toàn.

Không thực hiện production deployment hoặc thay đổi hệ thống QuánPilot nếu chưa được tôi xác nhận.
