import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {PublicPage,FaqList} from './public-page';
import {ScreenshotViewer} from './screenshot-viewer';
import {TrialLink,TrialBanner} from './trial-cta';
import {RestaurantFlow} from './restaurant-flow';
import {ProductDemoGallery} from './product-demo-gallery';
import {publishedContent} from '@/server/public-content';
import {publishedVisuals} from '@/server/visuals';
import {CmsBody} from './cms-body';
import {site} from '@/lib/site-config';
export async function MarketingProduct(){const [images,entry]=await Promise.all([publishedVisuals(),publishedContent('PRODUCT','quanpilot')]);const cmsFeatures=(entry?.data as {items?:{title:string;text:string}[]}|undefined)?.items;
 return <PublicPage path="/products/quanpilot" eyebrow="QUÁNPILOT / TỪ QAVIO" title={entry?.title||'Kết nối mọi bộ phận. Thuận tiện từng ngày.'} intro={entry?.summary||'Từ khách quét QR đến chủ quán theo dõi hoạt động. Một nền tảng giúp các bộ phận làm việc cùng nhau.'} visual={<div className="product-hero-media"><ScreenshotViewer image={images['dashboard-screen']} title="Quản lý hoạt động nhà hàng"/><ScreenshotViewer image={images['menu-screen']} title="Menu QR" phone/></div>}>
 <section className="visual-intro-strip"><div className="container"><p><strong>QuánPilot.</strong> Dành cho nhà hàng, quán ăn và quán cà phê.</p><div className="visual-product-actions">{site.quanpilotUrl&&<a href={site.quanpilotUrl} className="text-link" target="_blank" rel="noopener noreferrer">Truy cập QuánPilot <span className="sr-only">(mở tab mới)</span><ArrowUpRight size={16}/></a>}<TrialLink/></div></div></section>
 {entry?.bodyHtml&&<section className="section"><div className="container legal-document"><CmsBody html={entry.bodyHtml}/></div></section>}
 <RestaurantFlow/>
 <ProductDemoGallery images={images}/>

 {cmsFeatures?.length&&<section className="section"><div className="container"><h2>Thông tin tính năng từ QAVIO</h2><div className="visual-mini-cards">{cmsFeatures.map(f=><article key={f.title}><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></div></section>}
 <section className="section"><div className="container faq-layout"><div><span className="eyebrow">CHỌN ĐÚNG PHẠM VI</span><h2>Chọn gói phù hợp với quán.</h2><p className="spaced-copy">Khám phá đầy đủ chức năng của QuánPilot, rồi so sánh quyền lợi và giá dịch vụ để chọn gói phù hợp với cách vận hành của bạn.</p><Link href="/pricing" className="text-link">Tìm hiểu gói dịch vụ <ArrowUpRight size={17}/></Link></div><FaqList/></div></section><TrialBanner/>
 </PublicPage>;
}
