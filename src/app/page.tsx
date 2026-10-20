import Link from "next/link";
import { BrandImage } from "@/components/brand-image";
import { pageMetadata } from "@/lib/seo";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, ChartNoAxesCombined, Check, ChevronDown, CircleHelp, Layers3, MonitorCog, ScanLine, Sparkles, UtensilsCrossed, Workflow } from "lucide-react";
import { ProductExplorer } from "@/components/product-explorer";
import { faqs, values } from "@/content/vi";

const solutions = [
  { number: "01", icon: Workflow, title: "Số hóa quy trình", text: "Giảm thao tác thủ công, tập trung thông tin và kết nối công việc giữa các bộ phận.", detail: "Từ quy trình thực tế đến trải nghiệm số." },
  { number: "02", icon: MonitorCog, title: "Quản lý tập trung", text: "Hướng đến một góc nhìn thống nhất về hoạt động, giúp thông tin rõ ràng và dễ theo dõi.", detail: "Thông tin đúng chỗ. Quyết định có cơ sở." },
  { number: "03", icon: Sparkles, title: "Trải nghiệm thuận tiện", text: "Đưa công nghệ đến gần hơn với người dùng qua những tương tác đơn giản và nhất quán.", detail: "Ít trở ngại hơn trong mỗi điểm chạm." },
];

export const metadata = pageMetadata("/");

export default function Home() {
  return <main id="main-content">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-layout"><div className="hero-copy">
        <div className="eyebrow"><span className="status-dot"/> CÔNG NGHỆ TỪ NHU CẦU THỰC TẾ</div>
        <h1 id="hero-title">Công nghệ<br/>kiến tạo <span>giá trị.</span></h1>
        <p className="hero-subtitle">Giải pháp đồng hành cùng doanh nghiệp.</p>
        <p className="hero-description">Những giải pháp số được xây dựng để đơn giản hóa vận hành, kết nối con người và mở ra khả năng phát triển bền vững.</p>
        <div className="hero-actions"><Link className="button" href="/solutions">Khám phá giải pháp <ArrowUpRight size={18}/></Link><Link className="text-link" href="/contact">Liên hệ tư vấn <ArrowRight size={17}/></Link></div>
        <Link className="scroll-cue" href="#about"><span><ArrowDown size={15}/></span> Cùng khám phá QAVIO</Link>
      </div>
      <div className="hero-brand"><BrandImage priority /></div></div>
      <div className="brand-values-strip"><div className="container">{values.map(value => <span key={value.name}>{value.name}<span className="strip-dot">·</span></span>)}</div></div>
    </section>

    <section id="about" className="section section-light about-section"><div className="container">
      <div className="section-meta"><span className="eyebrow">01 — VỀ QAVIO</span><span className="section-side-note">Từ thấu hiểu đến giải pháp</span></div>
      <div className="about-layout"><h2>Công nghệ được<br/>xây dựng từ<br/><span className="muted-heading">nhu cầu thực tế.</span></h2><div className="about-copy"><p className="lead">Công nghệ hiệu quả bắt đầu từ việc thấu hiểu những điều doanh nghiệp thực sự cần.</p><p>QAVIO là thương hiệu công nghệ định hướng phát triển các giải pháp phần mềm phục vụ hoạt động kinh doanh và quản lý doanh nghiệp.</p><p>Chúng tôi chú trọng trải nghiệm trực quan, quy trình rõ ràng và khả năng phát triển bền vững — để công nghệ trở thành một phần hữu ích trong công việc mỗi ngày.</p><Link href="/about" className="text-link dark-link">Khám phá tư duy QAVIO <ArrowDownRight size={19}/></Link></div></div>
      <div className="philosophy-line"><span><span className="mini-line"/> TRIẾT LÝ SẢN PHẨM</span><p>Đẹp trong thiết kế. Rõ ràng trong trải nghiệm. Thiết thực trong vận hành.</p></div>
    </div></section>

    <section id="solutions" className="section solutions-section"><div className="container">
      <div className="section-meta"><span className="eyebrow">02 — ĐỊNH HƯỚNG GIẢI PHÁP</span><span className="section-side-note">Đơn giản hóa để tiến xa hơn</span></div>
      <div className="section-heading"><h2>Giải quyết điều thiết thực.<br/><span className="muted-heading">Mở ra điều có thể.</span></h2><p>Ba hướng tiếp cận QAVIO theo đuổi khi xây dựng giải pháp cho hoạt động kinh doanh.</p></div>
      <div className="solutions-grid">{solutions.map(({ number, icon: Icon, title, text, detail }) => <article className="solution-card" key={number}><div className="solution-top"><Icon size={30} strokeWidth={1.2}/><span>{number}</span></div><h3>{title}</h3><p>{text}</p><div className="solution-detail">{detail}<ArrowUpRight size={17}/></div></article>)}</div>
      <p className="section-footnote">Các hướng tiếp cận trên thể hiện định hướng phát triển. Phạm vi giải pháp cụ thể được trao đổi theo nhu cầu của từng doanh nghiệp.</p>
    </div></section>

    <section id="products" className="section product-section"><div className="container">
      <div className="section-meta"><span className="eyebrow">03 — HỆ SINH THÁI SẢN PHẨM</span><span className="section-side-note">Bắt đầu từ vận hành mỗi ngày</span></div>
      <div className="product-layout"><div className="product-copy"><span className="product-badge"><UtensilsCrossed size={14}/> SẢN PHẨM ĐẦU TIÊN TỪ QAVIO</span><h2>QuánPilot<span className="gold-period">.</span></h2><p className="product-tagline">Quản lý quán thuận tiện hơn.<br/>Kết nối mọi bộ phận.</p><p>Từ khách hàng quét QR gọi món, phục vụ và bếp phối hợp xử lý đơn, đến thu ngân thanh toán và chủ quán theo dõi hoạt động — trên một hệ thống thống nhất.</p>
        <ul className="feature-list">{["Menu QR và đặt món tại bàn", "Quản lý bàn, đơn hàng và nhân viên", "Phối hợp phục vụ, bếp và thu ngân", "Thanh toán, hóa đơn và báo cáo"].map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>
        <Link href="/products/quanpilot" className="button">Tìm hiểu QuánPilot <ArrowUpRight size={18}/></Link><p className="product-note">Tính năng và thiết bị được đối chiếu theo gói và điều kiện triển khai thực tế.</p>
      </div><ProductExplorer /></div>
      <div className="ecosystem-note"><Blocks size={22} strokeWidth={1.3}/><p><strong>Một khởi đầu. Một tầm nhìn dài hạn.</strong><span>QuánPilot là bước đầu trong định hướng xây dựng hệ sinh thái giải pháp công nghệ QAVIO.</span></p><ArrowUpRight size={24} aria-hidden="true"/></div>
    </div></section>

    <section id="values" className="section section-light values-section"><div className="container"><div className="section-meta"><span className="eyebrow">04 — GIÁ TRỊ THƯƠNG HIỆU</span><span className="section-side-note">Năm giá trị. Một tinh thần QAVIO.</span></div><div className="section-heading"><h2>Những điều chúng tôi<br/>đặt vào mỗi sản phẩm.</h2><p>Không chỉ là tên gọi. Đó là những giá trị định hướng cách QAVIO tư duy, thiết kế và phát triển.</p></div><div className="values-grid">{values.map(value => <article key={value.name}><span className="value-letter">{value.letter}<span>·</span></span><span className="value-name">{value.name}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}</div></div></section>

    <section className="section process-section"><div className="container"><div className="section-meta"><span className="eyebrow">05 — CÙNG QAVIO BẮT ĐẦU</span><span className="section-side-note">Lắng nghe trước. Xây dựng sau.</span></div><div className="section-heading"><h2>Mỗi giải pháp tốt<br/>bắt đầu bằng một cuộc trò chuyện.</h2><p>Quy trình hợp tác dự kiến, từ chia sẻ nhu cầu đến tìm hiểu phương án triển khai phù hợp.</p></div><ol className="process-grid">{[
      ["Chia sẻ nhu cầu", "Cho QAVIO biết mô hình kinh doanh và những điều bạn muốn cải thiện."],
      ["Cùng trao đổi", "Làm rõ quy trình, ưu tiên và bối cảnh vận hành thực tế."],
      ["Khám phá giải pháp", "Đối chiếu sản phẩm, phạm vi tính năng và phương án phù hợp."],
      ["Triển khai & đồng hành", "Thống nhất điều kiện và lộ trình trước khi bắt đầu triển khai."],
    ].map(([title, text], i) => <li key={title}><div className="process-number"><span>0{i + 1}</span><ArrowRight size={18}/></div><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>

    <section id="pricing" className="pricing-section"><div className="container pricing-inner"><div><span className="eyebrow">GÓI DỊCH VỤ QUÁNPILOT</span><h2>Phù hợp với cách<br/>quán của bạn vận hành.</h2><p>Liên hệ QAVIO để nhận thông tin gói dịch vụ phù hợp.<br/>Phạm vi tính năng và chi phí được xác nhận trước khi triển khai.</p><Link href="/contact" className="text-link">Trao đổi nhu cầu & nhận báo giá <ArrowUpRight size={18}/></Link></div><div className="plan-pair"><div><ScanLine size={24}/><h3>BASIC</h3><p>Khám phá nhu cầu<br/>vận hành thiết yếu.</p><span>Thời hạn 3 / 6 / 12 tháng</span></div><div><ChartNoAxesCombined size={24}/><h3>PRO</h3><p>Trao đổi về quy trình<br/>và phối hợp theo vai trò.</p><span>Thời hạn 3 / 6 / 12 tháng</span></div></div></div></section>

    <section id="news" className="section section-light news-section"><div className="container"><div className="section-meta"><span className="eyebrow">06 — GÓC NHÌN QAVIO</span><span className="section-side-note">Sản phẩm · Công nghệ · Chuyển đổi số</span></div><div className="news-layout"><h2>Ý tưởng được chia sẻ.<br/><span className="muted-heading">Giá trị được nối dài.</span></h2><div className="empty-news"><span className="empty-news-icon"><Layers3 size={24} strokeWidth={1.2}/></span><div><h3>Những câu chuyện đang được chuẩn bị</h3><p>Bài viết về sản phẩm, công nghệ và kiến thức quản lý sẽ xuất hiện tại đây khi được xuất bản.</p></div></div></div></div></section>

    <section id="faq" className="section faq-section"><div className="container faq-layout"><div><span className="eyebrow">THÔNG TIN HỮU ÍCH</span><h2>Bạn có thể<br/>đang quan tâm.</h2><p>Tìm hiểu thêm trước khi bắt đầu với QuánPilot.</p><CircleHelp size={34} className="faq-icon" strokeWidth={1}/></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div></div></section>

    <section id="subscribe" className="newsletter-section"><div className="container newsletter-inner"><div><span className="eyebrow">GIỮ KẾT NỐI</span><h2>Đồng hành cùng sự phát triển của QAVIO.</h2><p>Thông tin mới về sản phẩm, giải pháp và những bài viết hữu ích.</p></div><div className="newsletter-status"><span className="status-pill">Sắp mở đăng ký</span><p>Kênh nhận tin sẽ được mở khi có thể gửi email xác nhận và hỗ trợ hủy đăng ký.</p></div></div></section>

    <section id="contact" className="contact-section"><div className="container"><span className="eyebrow">CÙNG KIẾN TẠO GIÁ TRỊ</span><h2>Bước tiếp theo của doanh nghiệp,<br/><span>bắt đầu từ một kết nối.</span></h2><div className="contact-bottom"><p>Chia sẻ nhu cầu, khám phá khả năng.<br/>QAVIO sẵn sàng tìm hiểu bài toán của bạn.</p><div className="contact-availability"><span className="status-dot"/><div><strong>Kênh tư vấn đang được chuẩn bị</strong><span>Thông tin liên hệ chính thức sẽ được cập nhật tại đây.</span></div></div></div></div></section>
  </main>;
}
