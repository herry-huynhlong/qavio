import Link from 'next/link';
import {publishedContent} from '@/server/public-content';
import { InquiryForm } from '@/components/inquiry-form';
import { PublicPage } from '@/components/public-page';
import {cmsMetadata} from '@/server/cms-seo';

export async function generateMetadata(){return cmsMetadata('/contact','CONTACT','company');}
export default async function ContactPage() {
  const channels=(await publishedContent('CONTACT','company'))?.data as {email?:string;phone?:string;address?:string;social?:{label:string;url:string}[]}|undefined;
  return <PublicPage path="/contact" eyebrow="CÙNG KIẾN TẠO GIÁ TRỊ" title="Kết nối với QAVIO." intro="Bạn đang tìm hiểu giải pháp công nghệ, quan tâm QuánPilot hoặc mong muốn trao đổi cơ hội hợp tác? Hãy chuẩn bị nhu cầu để bắt đầu một cuộc trò chuyện phù hợp.">
    <section className="section"><div className="container form-layout"><aside className="form-context"><span className="eyebrow">MỖI KẾT NỐI ĐỀU CÓ MỘT ĐIỂM BẮT ĐẦU</span><h2>Chia sẻ bài toán.<br/>Tìm hiểu khả năng.</h2><p>{channels?.email&&<><a href={`mailto:${channels.email}`}>{channels.email}</a><br/></>}{channels?.phone&&<><a href={`tel:${channels.phone}`}>{channels.phone}</a><br/></>}{channels?.address&&<>{channels.address}<br/></>}{channels?.social?.map(link=><a key={link.url} href={link.url} rel="noopener noreferrer">{link.label} </a>)}{!channels&&'Kênh liên hệ chính thức đang được chuẩn bị. Email, hotline, địa chỉ và mạng xã hội sẽ được bổ sung khi được xác nhận.'}</p><h3>Bạn có thể chuẩn bị</h3><ul><li>Sản phẩm hoặc lĩnh vực quan tâm.</li><li>Mô hình kinh doanh và quy trình hiện tại.</li><li>Vấn đề cần cải thiện và ưu tiên của bạn.</li></ul><Link href="/faq" className="text-link">Xem câu hỏi thường gặp →</Link></aside><InquiryForm kind="contact" /></div></section>
  </PublicPage>;
}
