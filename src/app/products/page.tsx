import Link from 'next/link';
import { ArrowUpRight, Blocks, UtensilsCrossed } from 'lucide-react';
import { ProductExplorer } from '@/components/product-explorer';
import { ConsultationCta, PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/products');
export default function ProductsPage() {
  return <PublicPage path="/products" eyebrow="HỆ SINH THÁI QAVIO" title="Sản phẩm thiết thực. Giá trị bền lâu." intro="QAVIO định hướng phát triển những sản phẩm công nghệ giải quyết nhu cầu thực tế, bắt đầu từ hoạt động vận hành nhà hàng.">
    <section className="section"><div className="container product-layout"><div className="product-copy"><span className="product-badge"><UtensilsCrossed size={16} /> SẢN PHẨM ĐẦU TIÊN</span><h2>QuánPilot<span className="gold-period">.</span></h2><p className="product-tagline">Kết nối mọi bộ phận trong một hệ thống.</p><p>Nền tảng hỗ trợ quản lý nhà hàng, quán ăn và quán nước: từ thực đơn QR và gọi món tại bàn đến phục vụ, bếp, thanh toán và báo cáo.</p><ul className="feature-list"><li>Menu, bàn và đơn hàng</li><li>Phân quyền theo vai trò</li><li>Doanh thu từ hóa đơn đã thanh toán</li></ul><Link href="/products/quanpilot" className="button">Tìm hiểu QuánPilot <ArrowUpRight size={18} /></Link></div><ProductExplorer /></div></section>
    <section className="section section-light"><div className="container editorial-grid"><div><Blocks size={35} strokeWidth={1} /><h2 className="block-heading">Hệ sinh thái bắt đầu<br/>từ một nền tảng.</h2></div><div><p className="lead">QuánPilot là bước đầu, không phải toàn bộ bản sắc của QAVIO.</p><p>QAVIO hướng đến việc phát triển thêm sản phẩm và giải pháp có giá trị thực tiễn. Thông tin về sản phẩm tiếp theo sẽ được giới thiệu khi có kế hoạch được xác nhận.</p></div></div></section><ConsultationCta />
  </PublicPage>;
}
