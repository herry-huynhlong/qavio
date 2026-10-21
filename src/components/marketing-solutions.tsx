import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {PublicPage} from './public-page';
import {VisualFigure} from './visual-media';
import {TrialBanner} from './trial-cta';
import {publishedVisuals} from '@/server/visuals';
const stories=[['solutions','Số hóa vận hành','Từ những thao tác rời rạc đến một luồng công việc rõ ràng.','Bắt đầu bằng việc hiểu cách quán tiếp nhận món, phối hợp phục vụ và xử lý thông tin.'],['service','Quản lý công việc','Thông tin đúng chỗ. Dễ theo dõi hơn.','Tổ chức công việc theo vai trò và trạng thái để mỗi bộ phận nắm được phần việc cần làm.'],['qr','Trải nghiệm khách hàng','Ít bước trung gian. Thêm sự thuận tiện.','Từ menu QR đến yêu cầu tại bàn: tương tác trực quan, phù hợp với thói quen dùng điện thoại.'],['owner','Nền tảng mở rộng','Có cơ sở cho bước phát triển tiếp theo.','Thiết kế cấu trúc thông tin và quyền truy cập phù hợp, cân nhắc mở rộng theo nhu cầu thực tế.']] as const;
export async function MarketingSolutions(){const images=await publishedVisuals();return <PublicPage path="/solutions" eyebrow="TƯ DUY GIẢI PHÁP" title="Công nghệ gần hơn với công việc mỗi ngày." intro="Thấu hiểu quy trình trước. Lựa chọn cách ứng dụng công nghệ sau." visual={<VisualFigure image={images.solutions} priority/>}>
 <div className="container"><p className="visual-context-note">Những hướng tiếp cận QAVIO theo đuổi. Phạm vi và điều kiện triển khai được trao đổi theo từng nhu cầu; không phải cam kết cung cấp mọi dịch vụ.</p></div>
 {stories.map(([slot,title,lead,text],i)=><section className={`section ${i%2?'visual-story-tint':''}`} key={slot}><div className={`container visual-split ${i%2?'reverse':''}`}><VisualFigure image={images[slot]}/><div className="visual-copy"><span className="eyebrow">0{i+1} / {title.toUpperCase()}</span><h2>{lead}</h2><p>{text}</p><Link className="text-link" href="/products/quanpilot">Khám phá qua QuánPilot <ArrowUpRight size={18}/></Link></div></div></section>)}<TrialBanner/>
 </PublicPage>;}
