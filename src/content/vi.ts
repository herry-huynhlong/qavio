// Structured Vietnamese content; a future CMS can validate and replace these sections.
// No unverifiable prices, customer claims, company contacts or legal identifiers.
export const navigation = [
  { label: "Về QAVIO", href: "/#about" },
  { label: "Giải pháp", href: "/#solutions" },
  { label: "Sản phẩm", href: "/#products" },
  { label: "Bảng giá", href: "/#pricing" },
  { label: "Tin tức", href: "/#news" },
  { label: "Liên hệ", href: "/#contact" },
] as const;
export const values = [
  { letter: "Q", name: "Quality", title: "Chất lượng", text: "Chú trọng tính ổn định, sự chính xác và chất lượng trong từng giải pháp." },
  { letter: "A", name: "Aesthetic", title: "Thẩm mỹ", text: "Đề cao trải nghiệm trực quan, sự tinh tế và tính dễ sử dụng." },
  { letter: "V", name: "Vision", title: "Tầm nhìn", text: "Xây dựng nền tảng có khả năng thích ứng cùng sự phát triển lâu dài." },
  { letter: "I", name: "Innovation", title: "Đổi mới", text: "Liên tục cải tiến công nghệ và cách giải quyết vấn đề." },
  { letter: "O", name: "Originality", title: "Bản sắc", text: "Tư duy sản phẩm riêng, bắt đầu từ nhu cầu thực tế của người sử dụng." },
] as const;
export const productRoles = [
  { id: "customer", label: "Khách hàng", title: "Gọi món ngay tại bàn", text: "Quét mã QR, khám phá thực đơn, chọn món và theo dõi các món đã gọi ngay trên trình duyệt.", steps: ["Quét mã tại bàn", "Xem menu & chọn món", "Gửi yêu cầu thanh toán"] },
  { id: "staff", label: "Phục vụ", title: "Phối hợp phục vụ rõ ràng", text: "Theo dõi bàn và yêu cầu của khách, thêm món trực tiếp và tiếp nhận món đã sẵn sàng để phục vụ.", steps: ["Tiếp nhận yêu cầu", "Theo dõi món sẵn sàng", "Phục vụ tại bàn"] },
  { id: "kitchen", label: "Bếp", title: "Mỗi món, một trạng thái rõ ràng", text: "Bộ phận bếp tiếp nhận món, cập nhật trạng thái đang làm và đánh dấu hoàn thành theo quyền được cấp.", steps: ["Tiếp nhận món", "Cập nhật đang làm", "Hoàn thành món"] },
  { id: "cashier", label: "Thu ngân", title: "Khép lại một phiên phục vụ", text: "Xem tạm tính, xác nhận thanh toán và đóng phiên bàn. Khả năng in hóa đơn cần đối chiếu với thiết bị thực tế.", steps: ["Kiểm tra tạm tính", "Xác nhận thanh toán", "Đóng phiên bàn"] },
  { id: "owner", label: "Chủ quán", title: "Theo dõi hoạt động tập trung", text: "Quản lý thực đơn, bàn, nhân viên và theo dõi doanh thu từ các hóa đơn đã thanh toán theo từng nhà hàng.", steps: ["Quản lý thực đơn & bàn", "Phân quyền nhân viên", "Theo dõi báo cáo"] },
] as const;
export const faqs = [
  ["QuánPilot phù hợp với mô hình nào?", "QuánPilot hướng đến nhà hàng, quán ăn và quán nước có nhu cầu số hóa việc gọi món, phối hợp phục vụ và quản lý hoạt động. Phạm vi triển khai sẽ được trao đổi theo quy trình thực tế của từng quán."],
  ["Khách hàng có cần cài đặt ứng dụng không?", "Luồng gọi món QR được thiết kế để khách mở thực đơn và đặt món bằng trình duyệt trên điện thoại, không cần cài ứng dụng riêng."],
  ["Có thể quản lý nhiều nhà hàng không?", "QuánPilot có cấu trúc phân tách dữ liệu và quyền truy cập theo nhà hàng. Cách quản lý nhiều cơ sở và gói phù hợp cần được xác nhận trong buổi tư vấn."],
  ["Làm sao để biết gói dịch vụ phù hợp?", "Bạn có thể chuẩn bị thông tin về mô hình kinh doanh, số cơ sở và quy trình phục vụ. QAVIO sẽ trao đổi phạm vi tính năng, thiết bị và điều kiện triển khai trước khi báo giá chính thức."],
] as const;
