import Link from 'next/link';
import {publishedContent} from '@/server/public-content';
import {contactChannels} from '@/lib/contact-settings';
import {ContactActions} from '@/components/contact-actions';
import {InquiryForm} from '@/components/inquiry-form';
import {PublicPage} from '@/components/public-page';
import {cmsMetadata} from '@/server/cms-seo';
export async function generateMetadata(){return cmsMetadata('/contact','CONTACT','company');}
export default async function ContactPage(){
 const channels=contactChannels((await publishedContent('CONTACT','company'))?.data);
 return <PublicPage path="/contact" eyebrow="CÙNG KIẾN TẠO GIÁ TRỊ" title="Liên hệ QAVIO" intro="Bạn đang tìm hiểu giải pháp công nghệ hoặc muốn được tư vấn về QuánPilot? Hãy để lại thông tin, QAVIO sẽ liên hệ với bạn.">
  <section className="section"><div className="container form-layout"><aside className="form-context"><span className="eyebrow">TRAO ĐỔI CÙNG QAVIO</span><h2>Một lời nhắn.<br/>Bắt đầu kết nối.</h2><p>Chọn kênh liên hệ phù hợp hoặc để lại họ tên và số điện thoại trong biểu mẫu. Bạn không cần cung cấp email.</p><ContactActions channels={channels}/>{channels.phone&&<p>Số điện thoại: <a href={`tel:${channels.phone.replace(/[^+0-9]/g,'')}`}>{channels.phoneDisplay||channels.phone}</a></p>}{channels.email&&<p><a href={`mailto:${channels.email}`}>{channels.email}</a></p>}{channels.address&&<p>{channels.address}</p>}{channels.social?.map(item=><p key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a></p>)}<Link href="/faq" className="text-link">Xem câu hỏi thường gặp →</Link></aside><InquiryForm kind="contact"/></div></section>
 </PublicPage>;
}