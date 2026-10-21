import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProductExplorer } from '@/components/product-explorer';
import { ConsultationCta, FaqList, PublicPage } from '@/components/public-page';
import {cmsMetadata} from '@/server/cms-seo';
import { site } from '@/lib/site-config';
import {publishedContent} from '@/server/public-content';
import {CmsBody} from '@/components/cms-body';

export async function generateMetadata(){return cmsMetadata('/products/quanpilot','PRODUCT','quanpilot');}
const features = [
  ['Gọi món bằng QR', 'Khách quét mã tại bàn, xem thực đơn, chọn món và theo dõi những món đã gọi bằng trình duyệt.'],
  ['Quản lý bàn và đơn hàng', 'Theo dõi phiên bàn, đơn mới, trạng thái phục vụ và yêu cầu từ khách.'],
  ['Phục vụ và bếp', 'Tiếp nhận món, cập nhật chế biến, hoàn thành và phối hợp phục vụ theo vai trò.'],
  ['Thu ngân và thanh toán', 'Xem tạm tính, xác nhận thanh toán, đóng phiên bàn và hỗ trợ in hóa đơn theo thiết bị được kiểm tra.'],
  ['Quản lý thực đơn', 'Tổ chức danh mục, món ăn, giá bán và thông tin hiển thị cho khách.'],
  ['Quản lý nhân viên', 'Phân quyền chủ quán, quản lý, phục vụ, bếp và thu ngân; quản lý quyền và thiết bị nhân viên.'],
  ['Báo cáo kinh doanh', 'Theo dõi doanh thu từ hóa đơn đã thanh toán, lịch sử thanh toán và món bán chạy.'],
  ['Nhiều nhà hàng', 'Cấu trúc dữ liệu và quyền truy cập được phân tách theo từng nhà hàng.'],
];
export default async function QuanpilotPage() {
  const entry=await publishedContent('PRODUCT','quanpilot');
  const entries=(entry?.data as {items:{title:string;text:string}[]}|undefined)?.items;
  const shownFeatures=entries?.length?entries.map(v=>[v.title,v.text]):features;
  return <PublicPage path="/products/quanpilot" eyebrow="SẢN PHẨM ĐẦU TIÊN TỪ QAVIO" title={entry?.title||"QuánPilot — kết nối mọi bộ phận trong quán."} intro={entry?.summary||"Quản lý quán thuận tiện hơn, từ khách gọi món đến phối hợp phục vụ, bếp, thu ngân và theo dõi hoạt động kinh doanh."}>
    {entry&&<section className="section"><div className="container legal-document"><CmsBody html={entry.bodyHtml}/></div></section>}<section className="section"><div className="container product-layout"><div className="product-copy"><h2>Mỗi vai trò,<br/>một luồng công việc rõ ràng.</h2><p className="spaced-copy">Khám phá cách các bộ phận phối hợp trong một phiên phục vụ. Minh họa bên cạnh mô tả quy trình, không phải ảnh chụp màn hình sản phẩm.</p><div className="stacked-actions"><Link href="/trial" className="button">Đăng ký dùng thử <ArrowUpRight size={18} /></Link><Link href="/pricing" className="text-link">Tìm hiểu gói dịch vụ <ArrowUpRight size={17} /></Link></div>{site.quanpilotUrl && <a href={site.quanpilotUrl} className="text-link" rel="noopener noreferrer" target="_blank">Truy cập QuánPilot <span className="sr-only">(mở tab mới)</span><ArrowUpRight size={16} /></a>}</div><ProductExplorer /></div></section>
    <section className="section section-light"><div className="container"><span className="eyebrow">CÁC NHÓM TÍNH NĂNG</span><h2 className="block-heading">Từ thực đơn đến góc nhìn kinh doanh.</h2><div className="content-cards">{shownFeatures.map(([title, description], i) => <article key={title}><span className="eyebrow">0{i + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="section-footnote">Tính năng cụ thể phụ thuộc gói và điều kiện triển khai. Chưa cam kết offline hoàn toàn, uptime, thời gian hỗ trợ hoặc tương thích mọi máy in.</p></div></section>
    <section className="section"><div className="container faq-layout"><div><span className="eyebrow">TRƯỚC KHI BẮT ĐẦU</span><h2>Điều bạn cần biết.</h2><p>Thông tin gói, mô hình quán và thiết bị được trao đổi trước khi triển khai.</p><Link href="/faq" className="text-link">Xem tất cả câu hỏi <ArrowUpRight size={17} /></Link></div><FaqList /></div></section><ConsultationCta />
  </PublicPage>;
}
