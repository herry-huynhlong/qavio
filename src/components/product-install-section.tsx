import Link from 'next/link';
import {ArrowUpRight, Monitor, Smartphone, Tablet} from 'lucide-react';
import {ScreenshotViewer} from './screenshot-viewer';
import {TrialLink} from './trial-cta';
import type {VisualImages} from '@/lib/visuals';

export function ProductInstallSection({images}:{images:VisualImages}) {
 return <section className="section product-install" aria-labelledby="product-install-title"><div className="container product-install-layout">
  <div><span className="eyebrow">QUÁNPILOT TRÊN THIẾT BỊ CỦA BẠN</span><h2 id="product-install-title">Quản lý thuận tiện ngay trên thiết bị của bạn.</h2>
   <p>Cài QuánPilot trực tiếp từ website lên điện thoại, tablet hoặc máy tính nếu thiết bị và trình duyệt hỗ trợ. Mở nhanh từ màn hình chính để theo dõi bàn, xử lý đơn hàng và quản lý hoạt động nhà hàng.</p>
   <ul className="install-benefits"><li><Smartphone aria-hidden="true"/>Mở nhanh từ màn hình chính.</li><li><Tablet aria-hidden="true"/>Giao diện gọn gàng, phù hợp từng thiết bị.</li><li><Monitor aria-hidden="true"/>Dữ liệu đồng bộ khi có kết nối mạng.</li></ul>
   <div className="hero-actions"><TrialLink/><Link className="text-link" href="/products/quanpilot/install">Cách cài QuánPilot <ArrowUpRight size={17}/></Link></div>
  </div>
  <div className="install-product-preview"><ScreenshotViewer image={images['service-ready-screen']} title="QuánPilot trên điện thoại" phone/><p className="install-image-caption">Giao diện QuánPilot với dữ liệu minh họa.</p></div>
 </div></section>;
}
