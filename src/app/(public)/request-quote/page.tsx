import {InquiryForm} from '@/components/inquiry-form';
import {PublicPage} from '@/components/public-page';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('/request-quote');
export default function QuotePage(){return <PublicPage path="/request-quote" eyebrow="BÁO GIÁ QUÁNPILOT" title="Trao đổi gói phù hợp với quán." intro="Chia sẻ gói quan tâm, thời hạn và số cơ sở để QAVIO tiếp nhận nhu cầu báo giá."><section className="section"><div className="container form-layout"><aside className="form-context"><h2>Bắt đầu từ nhu cầu thực tế.</h2><p>Giá và điều kiện triển khai sẽ được xác nhận riêng. Việc gửi yêu cầu chưa tạo hợp đồng, tài khoản, lịch hẹn hoặc nghĩa vụ thanh toán.</p><p>Bạn có thể chọn BASIC, PRO hoặc chưa xác định. Website không tự tính giá dịch vụ.</p></aside><InquiryForm kind="quote"/></div></section></PublicPage>;}
