// The fallback is the domain explicitly confirmed by the project owner.
function publicUrl(value: string | undefined, fallback?: string) {
  if (!value) return fallback;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Public website URLs must be HTTP(S), without credentials, query or hash.');
  }
  return url.href.replace(/\/$/, '');
}

export const site = {
  name: 'QAVIO',
  url: publicUrl(process.env.SITE_URL, 'https://qavio.site')!,
  indexingEnabled: process.env.SITE_INDEXING_ENABLED === 'true',
  brandImage: '/brand/Qavio.png',
  // Product hostname explicitly confirmed by the project owner.
  quanpilotUrl: publicUrl(process.env.QUANPILOT_PUBLIC_URL),
  quanpilotLoginUrl: new URL('/restaurant-login', publicUrl(process.env.QUANPILOT_PUBLIC_URL, 'https://admin.qavio.site')!).href,
} as const;

export const publicPages = {
  '/': { title: 'Công nghệ kiến tạo giá trị', description: 'QAVIO hướng đến những giải pháp công nghệ thiết thực, đồng hành cùng hoạt động kinh doanh và quản lý doanh nghiệp.' },
  '/about': { title: 'Về QAVIO', description: 'Tìm hiểu định hướng, sứ mệnh, tầm nhìn và năm giá trị thương hiệu QAVIO: chất lượng, thẩm mỹ, tầm nhìn, đổi mới và bản sắc.' },
  '/solutions': { title: 'Giải pháp công nghệ', description: 'Khám phá cách QAVIO tiếp cận số hóa vận hành, quản lý tập trung, trải nghiệm khách hàng và nền tảng có khả năng mở rộng.' },
  '/products': { title: 'Sản phẩm từ QAVIO', description: 'Khám phá hệ sinh thái sản phẩm QAVIO, bắt đầu với QuánPilot — nền tảng hỗ trợ quản lý nhà hàng, quán ăn và quán nước.' },
  '/products/quanpilot': { title: 'QuánPilot — Nền tảng quản lý nhà hàng', description: 'Menu QR, quản lý bàn, đơn hàng và phối hợp phục vụ, bếp, thu ngân. Tìm hiểu QuánPilot và chuẩn bị nhu cầu tư vấn.' },
  '/pricing': { title: 'Gói dịch vụ và báo giá', description: 'Tìm hiểu định hướng gói BASIC và PRO cho QuánPilot, thời hạn 3, 6, 12 tháng. Giá chính thức cần được QAVIO xác nhận theo nhu cầu.' },
  '/request-quote': { title: 'Yêu cầu báo giá QuánPilot', description: 'Chia sẻ gói BASIC, PRO hoặc nhu cầu chưa xác định, thời hạn và số cơ sở để QAVIO tiếp nhận yêu cầu báo giá.' },
  '/news': { title: 'Tin tức và góc nhìn', description: 'Nơi chia sẻ tin tức QAVIO, thông tin sản phẩm, công nghệ, kiến thức quản lý và chuyển đổi số khi bài viết được xuất bản.' },
  '/contact': { title: 'Kết nối với QAVIO', description: 'Chuẩn bị nội dung trao đổi về sản phẩm, giải pháp, báo giá hoặc hợp tác cùng QAVIO. Tình trạng tiếp nhận được hiển thị tại biểu mẫu.' },
  '/trial': { title: 'Dùng thử QuánPilot miễn phí trong 1 tháng', description: 'Tự đăng ký nhà hàng QuánPilot với TRAIN, quyền BASIC trong một tháng lịch. Xác nhận email qua Google, không cần thanh toán trước.' },
  '/request-demo': { title: 'Đăng ký tư vấn và demo', description: 'Chuẩn bị nhu cầu tư vấn hoặc demo QuánPilot cho nhà hàng, quán ăn và quán nước. Tình trạng tiếp nhận được hiển thị tại biểu mẫu.' },
  '/subscribe': { title: 'Theo dõi QAVIO', description: 'Tìm hiểu kênh nhận thông tin sản phẩm và kiến thức từ QAVIO. Đăng ký có cơ chế xác nhận và hủy qua email khi tính năng được mở.' },
  '/faq': { title: 'Câu hỏi thường gặp', description: 'Giải đáp những câu hỏi về QAVIO, QuánPilot, gọi món QR, phân quyền nhân viên và thông tin gói dịch vụ.' },
  '/privacy': { title: 'Thông tin liên hệ và bảo mật', description: 'QAVIO sử dụng họ tên, số điện thoại và lời nhắn để tiếp nhận yêu cầu và liên hệ tư vấn.' },
  '/terms': { title: 'Điều khoản sử dụng — Bản dự thảo', description: 'Bản dự thảo điều khoản sử dụng website QAVIO. Cần rà soát và xác nhận trước khi công bố áp dụng chính thức.' },
} as const;
export type PublicPath = keyof typeof publicPages;
