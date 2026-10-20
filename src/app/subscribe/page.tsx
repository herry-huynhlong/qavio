import { InquiryForm } from '@/components/inquiry-form';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/subscribe');
export default function SubscribePage() {
  return <PublicPage path="/subscribe" eyebrow="GIỮ KẾT NỐI" title="Đồng hành cùng sự phát triển của QAVIO." intro="Thông tin mới về sản phẩm, giải pháp và những bài viết hữu ích — với quyền chủ động lựa chọn nhận tin của bạn.">
    <section className="section"><div className="container form-layout"><aside className="form-context"><h2>Nhận thông tin<br/>theo lựa chọn của bạn.</h2><p>Kênh đăng ký chưa được mở. Khi hoạt động chính thức, bạn sẽ cần xác nhận qua email trước khi nhận thông tin marketing.</p><ol><li>Đăng ký email và thể hiện đồng ý.</li><li>Xác nhận bằng liên kết có thời hạn.</li><li>Hủy đăng ký qua liên kết riêng khi không còn nhu cầu.</li></ol><p>Hiện chưa có email xác nhận, bản ghi đăng ký hoặc email marketing nào được tạo từ giao diện này.</p></aside><InquiryForm kind="subscribe" /></div></section>
  </PublicPage>;
}
