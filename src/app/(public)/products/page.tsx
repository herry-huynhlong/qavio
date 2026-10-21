import Link from 'next/link';
import {publishedList} from '@/server/public-content';
import { ArrowUpRight, Blocks, UtensilsCrossed } from 'lucide-react';
import { ProductExplorer } from '@/components/product-explorer';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';
import {publishedVisuals} from '@/server/visuals';
import {VisualFigure} from '@/components/visual-media';
import {ScreenshotViewer} from '@/components/screenshot-viewer';
import {TrialBanner} from '@/components/trial-cta';

export const metadata = pageMetadata('/products');
export default async function ProductsPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const params=await searchParams,page=Math.max(1,Math.min(9999,Number(params.page)||1));
  const products=await publishedList('PRODUCT',Math.floor(page));
  const images=await publishedVisuals();
  return <PublicPage path="/products" eyebrow="HỆ SINH THÁI QAVIO" title="Sản phẩm thiết thực. Giá trị bền lâu." intro="Công nghệ phục vụ nhu cầu thực tế. Bắt đầu từ vận hành nhà hàng." visual={<div className="product-hero-media"><VisualFigure image={images.qr} priority/><ScreenshotViewer image={images['menu-screen']} title="Menu QuánPilot · BASIC" phone/></div>}>
    <section className="section"><div className="container product-layout"><div className="product-copy"><span className="product-badge"><UtensilsCrossed size={16} /> SẢN PHẨM ĐẦU TIÊN</span><h2>QuánPilot<span className="gold-period">.</span></h2><p className="product-tagline">Kết nối mọi bộ phận trong một hệ thống.</p><p>Từ thực đơn QR và gọi món tại bàn đến phối hợp phục vụ, bếp, thanh toán và báo cáo. Tính năng cụ thể theo gói.</p><ul className="feature-list"><li>Menu, bàn và đơn hàng</li><li>Phân quyền theo vai trò</li><li>Doanh thu từ hóa đơn đã thanh toán</li></ul><Link href="/products/quanpilot" className="button">Tìm hiểu QuánPilot <ArrowUpRight size={18} /></Link></div><ProductExplorer images={images}/></div></section>
    {products.rows.filter(row=>row.slug!=='quanpilot').length>0&&<section className="section"><div className="container"><h2>Sản phẩm QAVIO</h2><div className="card-grid">{products.rows.filter(row=>row.slug!=='quanpilot').map(row=><article className="info-card" key={row.id}><h3>{row.title}</h3><p>{row.summary}</p><Link href={`/products/${row.slug}`} className="text-link">Tìm hiểu sản phẩm →</Link></article>)}</div></div></section>}
    {products.total>12&&<nav className="container" aria-label="Phân trang sản phẩm">{page>1&&<Link href={`/products?page=${page-1}`}>← Trang trước </Link>}{page*12<products.total&&<Link href={`/products?page=${page+1}`}>Trang sau →</Link>}</nav>}
    <section className="section section-light"><div className="container editorial-grid"><div><Blocks size={35} strokeWidth={1} /><h2 className="block-heading">Hệ sinh thái bắt đầu<br/>từ một nền tảng.</h2></div><div><p className="lead">QuánPilot là bước đầu, không phải toàn bộ bản sắc của QAVIO.</p><p>QAVIO hướng đến việc phát triển thêm sản phẩm và giải pháp có giá trị thực tiễn. Thông tin về sản phẩm tiếp theo sẽ được giới thiệu khi có kế hoạch được xác nhận.</p></div></div></section><TrialBanner/>
  </PublicPage>;
}
