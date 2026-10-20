import Link from 'next/link';
import { FaqList, PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/faq');
export default function FaqPage() {
  return <PublicPage path="/faq" eyebrow="THÔNG TIN HỮU ÍCH" title="Những điều bạn có thể đang quan tâm." intro="Tìm hiểu về QuánPilot và những thông tin cần làm rõ trước khi bắt đầu cùng QAVIO.">
    <section className="section"><div className="container faq-layout"><div><h2>Hiểu rõ trước<br/>khi lựa chọn.</h2><p>Phạm vi tính năng, gói dịch vụ và thiết bị thực tế sẽ được trao đổi trước khi triển khai.</p><Link href="/contact" className="text-link">Chuẩn bị nội dung liên hệ →</Link></div><FaqList extended /></div></section>
  </PublicPage>;
}
