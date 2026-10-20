import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ConsultationCta, PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/solutions');
const solutions = [
  { title: 'Số hóa vận hành', problem: 'Thông tin rời rạc, thao tác thủ công lặp lại và khó theo dõi trạng thái công việc.', approach: 'Làm rõ quy trình hiện tại, xác định những điểm cần số hóa và xây dựng luồng thao tác phù hợp với người sử dụng.', benefit: 'Giảm thao tác lặp, thông tin rõ ràng hơn và thuận tiện trong phối hợp.', related: 'QuánPilot: gọi món QR, bàn và đơn hàng.' },
  { title: 'Quản lý công việc và thông tin', problem: 'Các bộ phận có thể cập nhật khác nhau hoặc mất thời gian tìm kiếm thông tin cần thiết.', approach: 'Tổ chức thông tin theo vai trò, trạng thái và phạm vi truy cập trên một hệ thống thống nhất.', benefit: 'Dễ theo dõi công việc và làm rõ trách nhiệm trong từng bước.', related: 'QuánPilot: phối hợp phục vụ, bếp và thu ngân.' },
  { title: 'Trải nghiệm khách hàng', problem: 'Nhiều bước trung gian có thể gây bất tiện khi khách tìm thông tin hoặc gửi yêu cầu.', approach: 'Thiết kế những tương tác trực quan, dễ tiếp cận và nhất quán với quy trình phục vụ.', benefit: 'Mang đến cách tiếp cận thông tin và dịch vụ thuận tiện hơn.', related: 'QuánPilot: thực đơn QR và yêu cầu tại bàn.' },
  { title: 'Nền tảng có khả năng mở rộng', problem: 'Quy trình và nhu cầu quản lý thay đổi khi doanh nghiệp phát triển.', approach: 'Xác định cấu trúc dữ liệu, nội dung và quyền sử dụng phù hợp ngay từ bước thiết kế.', benefit: 'Tạo cơ sở để cân nhắc mở rộng theo nhu cầu và điều kiện thực tế.', related: 'QuánPilot: dữ liệu và quyền truy cập phân tách theo nhà hàng.' },
];
export default function SolutionsPage() {
  return <PublicPage path="/solutions" eyebrow="ĐỊNH HƯỚNG GIẢI PHÁP" title="Giải pháp phù hợp với bài toán của bạn." intro="QAVIO bắt đầu bằng việc thấu hiểu nhu cầu vận hành, sau đó mới lựa chọn cách ứng dụng công nghệ.">
    <section className="section"><div className="container"><div className="notice"><strong>Những hướng tiếp cận QAVIO theo đuổi</strong><p>Các nội dung dưới đây là định hướng và lợi ích kỳ vọng. Phạm vi dịch vụ, tính năng và điều kiện triển khai cần được trao đổi cụ thể; đây chưa phải cam kết cung cấp mọi dịch vụ.</p></div><div className="solution-stories">{solutions.map((item, i) => <article key={item.title}><div className="story-title"><span className="eyebrow">0{i + 1}</span><h2>{item.title}</h2></div><div className="story-body"><h3>Vấn đề thường gặp</h3><p>{item.problem}</p><h3>Cách tiếp cận</h3><p>{item.approach}</p><h3>Lợi ích kỳ vọng</h3><p>{item.benefit}</p><Link href="/products/quanpilot" className="related-product">{item.related}<ArrowUpRight size={17} /></Link><Link href="/contact" className="text-link">Trao đổi nhu cầu <ArrowUpRight size={16} /></Link></div></article>)}</div></div></section><ConsultationCta />
  </PublicPage>;
}
