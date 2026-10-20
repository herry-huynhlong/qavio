import Link from "next/link";
export function SiteFooter() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main"><div className="footer-brand"><Link className="wordmark" href="/" aria-label="QAVIO — Trang chủ">QAVIO<span className="brand-dot" /></Link><p>Công nghệ kiến tạo giá trị.<br/>Giải pháp đồng hành cùng doanh nghiệp.</p></div>
      <div><h2>Khám phá</h2><Link href="/#about">Về QAVIO</Link><Link href="/#solutions">Giải pháp</Link><Link href="/#products">Sản phẩm</Link><Link href="/#news">Tin tức</Link></div>
      <div><h2>Đồng hành</h2><Link href="/#contact">Liên hệ</Link><Link href="/#contact">Đăng ký tư vấn</Link><Link href="/#pricing">Gói dịch vụ</Link><Link href="/#faq">Câu hỏi thường gặp</Link></div>
      <div className="footer-philosophy"><h2>Tư duy sản phẩm</h2><p>Đẹp trong thiết kế.<br/>Rõ ràng trong trải nghiệm.<br/>Thiết thực trong vận hành.</p></div>
    </div><div className="footer-bottom"><span>© QAVIO. All rights reserved.</span><span>QUALITY · AESTHETIC · VISION · INNOVATION · ORIGINALITY</span></div>
  </div></footer>;
}
