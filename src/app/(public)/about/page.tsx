import { BrandImage } from '@/components/brand-image';
import { ConsultationCta, PublicPage } from '@/components/public-page';
import { ShieldCheck, Sparkles, Telescope, Lightbulb, Fingerprint } from 'lucide-react';
import '../../about.css';

const aboutValues = [
  {name:'QUALITY',title:'Chất lượng',text:'Đặt sự ổn định, chính xác và tính hữu ích làm nền tảng cho từng giải pháp.',icon:ShieldCheck},
  {name:'AESTHETIC',title:'Thẩm mỹ',text:'Kết hợp thiết kế tinh tế với trải nghiệm trực quan, dễ tiếp cận.',icon:Sparkles},
  {name:'VISION',title:'Tầm nhìn',text:'Phát triển công nghệ có khả năng thích ứng và đồng hành lâu dài cùng doanh nghiệp.',icon:Telescope},
  {name:'INNOVATION',title:'Đổi mới',text:'Liên tục cải tiến và tìm kiếm cách giải quyết vấn đề hiệu quả hơn.',icon:Lightbulb},
  {name:'ORIGINALITY',title:'Bản sắc',text:'Giữ tư duy sáng tạo riêng, xây dựng sản phẩm xuất phát từ nhu cầu thực tế.',icon:Fingerprint},
];
import {cmsMetadata} from '@/server/cms-seo';
import {publishedContent} from '@/server/public-content';
import {CmsBody} from '@/components/cms-body';
import {publishedVisuals} from '@/server/visuals';
import {VisualFigure} from '@/components/visual-media';

export async function generateMetadata(){return cmsMetadata('/about','COMPANY','about');}
export default async function AboutPage() {
  const [company,mission,vision,brandValues]=await Promise.all([publishedContent('COMPANY','about'),publishedContent('MISSION','mission'),publishedContent('VISION','vision'),publishedContent('VALUES','values')]);
  const valueItems=(brandValues?.data as {items:{title:string;text:string}[]}|undefined)?.items;
  const images=await publishedVisuals();
  return <PublicPage path="/about" eyebrow="THƯƠNG HIỆU QAVIO" title="Công nghệ từ thấu hiểu. Giá trị từ thực tiễn." intro="Kiến tạo giải pháp công nghệ bằng chất lượng, thẩm mỹ và tư duy đổi mới." visual={<div className="about-hero-media"><VisualFigure image={images.about} priority showCaption={false}/><span className="about-hero-signature">Technology with Purpose</span></div>}>
    <section className="section"><div className="container editorial-grid"><BrandImage priority /><div><span className="eyebrow">QAVIO LÀ AI?</span><h2>{company?.title||<>Một tư duy sản phẩm.<br/>Một định hướng dài hạn.</>}</h2>{company?<CmsBody html={company.bodyHtml}/>:<><p>QAVIO là thương hiệu công nghệ định hướng phát triển các giải pháp phần mềm phục vụ hoạt động kinh doanh và quản lý doanh nghiệp.</p><p>Chúng tôi lựa chọn cách tiếp cận lấy nhu cầu thực tế làm trung tâm, chú trọng trải nghiệm người dùng, tính minh bạch trong vận hành và khả năng mở rộng của sản phẩm.</p><p>QuánPilot là sản phẩm đầu tiên trong định hướng xây dựng hệ sinh thái giải pháp QAVIO.</p></>}</div></div></section>
    <section className="section section-light"><div className="container"><div className="two-columns"><article><span className="eyebrow">SỨ MỆNH</span><h2>{mission?.title||<>Đơn giản hóa<br/>những điều phức tạp.</>}</h2>{mission?<CmsBody html={mission.bodyHtml}/>:<p>Bằng công nghệ dễ tiếp cận, góp phần giúp doanh nghiệp vận hành hiệu quả hơn.</p>}</article><article><span className="eyebrow">TẦM NHÌN</span><h2>{vision?.title||<>Phát triển cùng<br/>doanh nghiệp.</>}</h2>{vision?<CmsBody html={vision.bodyHtml}/>:<p>Phát triển QAVIO thành một hệ sinh thái giải pháp công nghệ có giá trị thực tiễn, đồng hành cùng sự phát triển của các doanh nghiệp.</p>}</article></div><div className="philosophy-line"><span>TRIẾT LÝ SẢN PHẨM</span><p>Đẹp trong thiết kế. Rõ ràng trong trải nghiệm. Thiết thực trong vận hành.</p></div></div></section>
    <section className="section about-values" aria-labelledby="about-values-heading"><div className="container"><div className="about-values-intro"><span className="eyebrow">GIÁ TRỊ CỐT LÕI</span><h2 id="about-values-heading">Giá trị tạo nên QAVIO</h2><p>Năm giá trị định hướng cách chúng tôi thiết kế sản phẩm, phát triển công nghệ và tạo ra những trải nghiệm có ý nghĩa.</p></div><div className="about-value-grid">{aboutValues.map((value,i) => {const Icon=value.icon; const content=valueItems?.[i]||value; return <article className="about-value-card" key={value.name}><div className="about-value-top"><span>{String(i+1).padStart(2,'0')}</span><Icon size={28} strokeWidth={1.4} aria-hidden="true"/></div><span className="about-value-name">{value.name}</span><h3>{content.title}</h3><p>{content.text}</p></article>;})}</div></div></section><ConsultationCta />
  </PublicPage>;
}
