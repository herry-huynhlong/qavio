import Link from 'next/link';
import { InquiryForm } from '@/components/inquiry-form';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/request-demo');
export default function DemoPage() {
  return <PublicPage path="/request-demo" eyebrow="TÌM HIỂU QUÁNPILOT" title="Bắt đầu từ cách quán của bạn vận hành." intro="Chuẩn bị nhu cầu tư vấn hoặc demo để cùng khám phá cách QuánPilot có thể hỗ trợ quy trình thực tế của quán.">
    <section className="section"><div className="container form-layout"><aside className="form-context"><span className="eyebrow">TRƯỚC BUỔI TRAO ĐỔI</span><h2>Một nhu cầu rõ ràng.<br/>Một cuộc trao đổi hữu ích.</h2><p>Thông tin về mô hình quán, số cơ sở và nhu cầu chính giúp xác định những nội dung cần tìm hiểu trong buổi demo.</p><ol><li>Làm rõ quy trình hiện tại.</li><li>Đối chiếu nhóm tính năng phù hợp.</li><li>Trao đổi gói và điều kiện triển khai.</li></ol><p>Việc điền thông tin tại đây chưa đặt lịch, chưa tạo tài khoản QuánPilot và chưa phát sinh thanh toán.</p><Link href="/products/quanpilot" className="text-link">Tìm hiểu tính năng QuánPilot →</Link></aside><InquiryForm kind="demo" /></div></section>
  </PublicPage>;
}
