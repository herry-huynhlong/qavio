import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';
import {publishedVisuals} from '@/server/visuals';
import {VisualFigure} from '@/components/visual-media';
import {TrialBanner} from '@/components/trial-cta';

export const metadata = pageMetadata('/pricing');
export default async function PricingPage() {
  const images=await publishedVisuals();
  return <PublicPage path="/pricing" eyebrow="GÓI DỊCH VỤ QUÁNPILOT" title="Phù hợp với cách quán của bạn vận hành." intro="Liên hệ QAVIO để nhận thông tin gói dịch vụ phù hợp. Mức giá và điều kiện chính thức sẽ được xác nhận trước khi triển khai." visual={<VisualFigure image={images.owner} priority/>}>
    <section className="section"><div className="container"><div className="pricing-cards">{[
      ['BASIC', 'Trao đổi về nhu cầu vận hành thiết yếu', 'Làm rõ quy trình gọi món, bàn và đơn hàng, thanh toán và theo dõi hoạt động.'],
      ['PRO', 'Trao đổi về phối hợp theo vai trò', 'Làm rõ nhu cầu phối hợp quản lý, phục vụ, bếp và thu ngân theo quy trình của quán.'],
    ].map(([name, subtitle, text]) => <article key={name}><span className="eyebrow">QUÁNPILOT</span><h2>{name}</h2><h3>{subtitle}</h3><p>{text}</p><div className="price-contact">Liên hệ nhận báo giá</div><p>Thời hạn lựa chọn: 3, 6 hoặc 12 tháng.</p><Link href="/request-quote" className="button">Yêu cầu báo giá <ArrowUpRight size={17} /></Link></article>)}</div><aside className="notice"><strong>Thông tin gói cần được xác nhận</strong><p>Dùng thử TRAIN có quyền BASIC. Màn hình riêng cho bếp, thu ngân và vai trò quản lý thuộc PRO.</p><p>Trang này chưa công bố giá hoặc ma trận quyền chính thức. Các mô tả trên là nội dung trao đổi nhu cầu, không thay thế báo giá. Việc thanh toán và quản lý gói QuánPilot thuộc hệ thống QuánPilot riêng; website QAVIO không có checkout gói.</p></aside><div className="preparation"><h2>Chuẩn bị gì khi cần báo giá?</h2><ul><li>Mô hình nhà hàng, quán ăn hoặc quán nước.</li><li>Số cơ sở và các vai trò cần sử dụng.</li><li>Quy trình gọi món, phục vụ và thanh toán hiện tại.</li><li>Thiết bị đang có và nhu cầu triển khai.</li></ul><Link href="/trial" className="text-link">Trải nghiệm QuánPilot miễn phí 1 tháng <ArrowUpRight size={17} /></Link></div></div></section>
  <TrialBanner/></PublicPage>;
}
