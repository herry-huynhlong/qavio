import { BrandImage } from '@/components/brand-image';
import { ConsultationCta, PublicPage } from '@/components/public-page';
import { values } from '@/content/vi';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/about');
export default function AboutPage() {
  return <PublicPage path="/about" eyebrow="THƯƠNG HIỆU QAVIO" title="Công nghệ từ thấu hiểu. Giá trị từ thực tiễn." intro="Kiến tạo giải pháp công nghệ bằng chất lượng, thẩm mỹ và tư duy đổi mới.">
    <section className="section"><div className="container editorial-grid"><BrandImage priority /><div><span className="eyebrow">QAVIO LÀ AI?</span><h2>Một tư duy sản phẩm.<br/>Một định hướng dài hạn.</h2><p>QAVIO là thương hiệu công nghệ định hướng phát triển các giải pháp phần mềm phục vụ hoạt động kinh doanh và quản lý doanh nghiệp.</p><p>Chúng tôi lựa chọn cách tiếp cận lấy nhu cầu thực tế làm trung tâm, chú trọng trải nghiệm người dùng, tính minh bạch trong vận hành và khả năng mở rộng của sản phẩm.</p><p>QuánPilot là sản phẩm đầu tiên trong định hướng xây dựng hệ sinh thái giải pháp QAVIO.</p></div></div></section>
    <section className="section section-light"><div className="container"><div className="two-columns"><article><span className="eyebrow">SỨ MỆNH</span><h2>Đơn giản hóa<br/>những điều phức tạp.</h2><p>Bằng công nghệ dễ tiếp cận, góp phần giúp doanh nghiệp vận hành hiệu quả hơn.</p></article><article><span className="eyebrow">TẦM NHÌN</span><h2>Phát triển cùng<br/>doanh nghiệp.</h2><p>Phát triển QAVIO thành một hệ sinh thái giải pháp công nghệ có giá trị thực tiễn, đồng hành cùng sự phát triển của các doanh nghiệp.</p></article></div><div className="philosophy-line"><span>TRIẾT LÝ SẢN PHẨM</span><p>Đẹp trong thiết kế. Rõ ràng trong trải nghiệm. Thiết thực trong vận hành.</p></div></div></section>
    <section className="section"><div className="container"><span className="eyebrow">NĂM GIÁ TRỊ CỐT LÕI</span><h2 className="block-heading">Định hướng cách chúng tôi xây dựng.</h2><div className="brand-value-cards">{values.map(value => <article key={value.name}><span>{value.name}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}</div></div></section><ConsultationCta />
  </PublicPage>;
}
