import Link from 'next/link';
import {ArrowUpRight,Check} from 'lucide-react';
import {PublicPage,FaqList} from './public-page';
import {ProductExplorer} from './product-explorer';
import {VisualFigure} from './visual-media';
import {ScreenshotViewer} from './screenshot-viewer';
import {TrialLink,TrialBanner} from './trial-cta';
import {RestaurantFlow} from './restaurant-flow';
import {ProductDemoGallery} from './product-demo-gallery';
import {publishedContent} from '@/server/public-content';
import {publishedVisuals} from '@/server/visuals';
import {CmsBody} from './cms-body';
import type {VisualSlot} from '@/lib/visuals';
import {site} from '@/lib/site-config';
const stories:{photo:VisualSlot;shot:VisualSlot;title:string;text:string;benefits:string[]}[]=[
 {photo:'qr',shot:'menu-screen',title:'Khách quét QR. Tự chọn món tại bàn.',text:'Một lượt quét mở thực đơn trên điện thoại. Khách xem món, lựa chọn và gửi yêu cầu ngay trên trình duyệt.',benefits:['Không cần cài thêm ứng dụng.','Thực đơn được cập nhật từ hệ thống quán.','Theo dõi các món đã gọi trong phiên bàn.']},
 {photo:'service',shot:'service-screen',title:'Phục vụ nắm bắt yêu cầu.',text:'Nhân viên theo dõi bàn, đơn hàng và yêu cầu từ khách để phối hợp công việc trong ca phục vụ.',benefits:['Thông tin tập trung theo bàn.','Tài khoản phục vụ theo vai trò.','Theo dõi các trạng thái công việc.']},
 {photo:'kitchen',shot:'kitchen-screen',title:'Bếp rõ món. Phục vụ rõ tiến độ.',text:'Màn hình bếp riêng giúp tiếp nhận món và cập nhật quá trình chuẩn bị.',benefits:['Món chờ làm, đang làm và hoàn thành.','Phân quyền cho nhân viên bếp.','Phối hợp với bộ phận phục vụ.']},
 {photo:'cashier',shot:'cashier-screen',title:'Thu ngân tập trung thanh toán.',text:'Màn hình làm việc riêng cho thu ngân, theo dõi yêu cầu và xử lý phiên thanh toán.',benefits:['Xem tạm tính và yêu cầu thanh toán.','Xác nhận giao dịch, đóng phiên bàn.','Khả năng in cần kiểm tra với thiết bị thực tế.']},
 {photo:'owner',shot:'reports-screen',title:'Chủ quán nhìn rõ hoạt động.',text:'Theo dõi doanh thu từ hóa đơn đã thanh toán và xem lại các giao dịch của quán.',benefits:['Báo cáo và lịch sử thanh toán.','Theo dõi món bán chạy.','Quản lý thông tin trên một hệ thống.']},
 {photo:'tables',shot:'tables-screen',title:'Bàn, thực đơn và nhân viên. Cùng một nơi.',text:'Tổ chức bàn, danh mục món và quyền truy cập phù hợp với mô hình vận hành.',benefits:['Quản lý bàn và phiên phục vụ.','Cập nhật thực đơn và giá bán.','Dữ liệu phân tách theo từng nhà hàng.']},
];
export async function MarketingProduct(){const [images,entry]=await Promise.all([publishedVisuals(),publishedContent('PRODUCT','quanpilot')]);const cmsFeatures=(entry?.data as {items?:{title:string;text:string}[]}|undefined)?.items;
 return <PublicPage path="/products/quanpilot" eyebrow="QUÁNPILOT / TỪ QAVIO" title={entry?.title||'Kết nối mọi bộ phận. Thuận tiện từng ngày.'} intro={entry?.summary||'Từ khách quét QR đến chủ quán theo dõi hoạt động. Một nền tảng giúp các bộ phận làm việc cùng nhau.'} visual={<div className="product-hero-media"><VisualFigure image={images.qr} priority/><ScreenshotViewer image={images['menu-screen']} title="Menu QR" phone/></div>}>
 <section className="visual-intro-strip"><div className="container"><p><strong>QuánPilot.</strong> Dành cho nhà hàng, quán ăn và quán cà phê.</p><div className="visual-product-actions">{site.quanpilotUrl&&<a href={site.quanpilotUrl} className="text-link" target="_blank" rel="noopener noreferrer">Truy cập QuánPilot <span className="sr-only">(mở tab mới)</span><ArrowUpRight size={16}/></a>}<TrialLink/></div></div></section>
 {entry?.bodyHtml&&<section className="section"><div className="container legal-document"><CmsBody html={entry.bodyHtml}/></div></section>}
 <RestaurantFlow/>
 <ProductDemoGallery images={images}/>
 {stories.map((s,i)=><section key={s.photo} className={`section visual-story ${i%2?'visual-story-tint':''}`}><div className={`container visual-split ${i%2?'reverse':''}`}><div className="visual-story-images"><VisualFigure image={images[s.photo]} showCaption={false}/><ScreenshotViewer image={images[s.shot]} title={s.title}/>{i===5&&<ScreenshotViewer image={images['menu-admin-screen']} title="Quản lý thực đơn"/>}{i===0&&<ScreenshotViewer image={images['cart-screen']} title="Giỏ hàng" phone/>}</div><div className="visual-copy"><span className="eyebrow">0{i+1} / TRẢI NGHIỆM SẢN PHẨM</span><h2>{s.title}</h2><p>{s.text}</p><ul className="visual-benefits">{s.benefits.map(b=><li key={b}><Check size={17}/>{b}</li>)}</ul>{i===4&&<ScreenshotViewer image={images['dashboard-screen']} title="Dashboard chủ quán"/>}</div></div></section>)}
 <section className="section"><div className="container"><div className="visual-section-top"><span className="eyebrow">KHÁM PHÁ THEO VAI TRÒ</span><h2>Mỗi người một nhiệm vụ.<br/>Cùng một quy trình.</h2></div><ProductExplorer images={images}/></div></section>
 {cmsFeatures?.length&&<section className="section"><div className="container"><h2>Thông tin tính năng từ QAVIO</h2><div className="visual-mini-cards">{cmsFeatures.map(f=><article key={f.title}><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></div></section>}
 <section className="section"><div className="container faq-layout"><div><span className="eyebrow">CHỌN ĐÚNG PHẠM VI</span><h2>BASIC hay PRO?</h2><p className="spaced-copy">Dùng thử TRAIN có quyền BASIC. Màn hình bếp, thu ngân riêng và vai trò quản lý thuộc PRO. Không có cam kết tương thích mọi máy in hoặc hoạt động offline hoàn toàn.</p><Link href="/pricing" className="text-link">Tìm hiểu gói dịch vụ <ArrowUpRight size={17}/></Link></div><FaqList/></div></section><TrialBanner/>
 </PublicPage>;
}
