import Link from 'next/link';
import {Monitor, Smartphone, Tablet} from 'lucide-react';
import {PublicPage} from '@/components/public-page';
import {TrialLink} from '@/components/trial-cta';
import {pageMetadata} from '@/lib/seo';
import {site} from '@/lib/site-config';

export const metadata=pageMetadata('/products/quanpilot/install');
export default function InstallGuide(){return <PublicPage path="/products/quanpilot/install" eyebrow="HƯỚNG DẪN QUÁNPILOT" title="Cách cài QuánPilot trên thiết bị của bạn" intro="Mở nhanh nhà hàng từ màn hình chính. Tùy thiết bị và trình duyệt, bạn có thể cài ứng dụng từ website hoặc thêm lối tắt.">
 <section className="section"><div className="container install-guide">
  <aside className="notice"><h2>Bắt đầu từ nhà hàng của bạn</h2><p>Đăng nhập QuánPilot, mở đúng nhà hàng và màn hình làm việc của bạn, rồi thực hiện hướng dẫn bên dưới. Tên và biểu tượng ứng dụng có thể theo thương hiệu của nhà hàng.</p><div className="hero-actions"><a href={site.quanpilotLoginUrl} className="button">Đăng nhập QuánPilot</a><TrialLink className="text-link"/></div></aside>
  <div className="install-guide-grid">
   <article><Smartphone aria-hidden="true"/><h2>Android</h2><ol><li>Mở nhà hàng bằng Chrome hoặc trình duyệt hỗ trợ cài ứng dụng.</li><li>Nếu có nút <strong>Cài App</strong> và hộp cài đặt hiện ra, làm theo hướng dẫn.</li><li>Hoặc mở menu trình duyệt, tìm <strong>Cài ứng dụng</strong> hay <strong>Thêm vào màn hình chính</strong>, rồi xác nhận.</li></ol></article>
   <article><Tablet aria-hidden="true"/><h2>iPhone / iPad</h2><ol><li>Mở nhà hàng bằng <strong>Safari</strong>.</li><li>Mở menu <strong>Chia sẻ</strong> và chọn <strong>Thêm vào Màn hình chính</strong>.</li><li>Nếu có tùy chọn <strong>Mở dưới dạng ứng dụng web</strong>, bật tùy chọn này rồi nhấn <strong>Thêm</strong>.</li></ol><p>Vị trí menu có thể khác theo phiên bản iOS/iPadOS.</p></article>
   <article><Monitor aria-hidden="true"/><h2>Máy tính</h2><ol><li>Mở nhà hàng bằng Chrome hoặc Edge.</li><li>Dùng biểu tượng cài ứng dụng trên thanh địa chỉ nếu xuất hiện; hoặc tìm tùy chọn cài trang web thành ứng dụng trong menu trình duyệt.</li><li>Xác nhận cài đặt và mở lại từ danh sách ứng dụng của máy.</li></ol><p>Tên menu phụ thuộc trình duyệt và phiên bản.</p></article>
  </div>
  <div className="install-guide-notes"><h2>Nếu chưa thấy tùy chọn cài</h2><p>Hãy thử trình duyệt hỗ trợ ở trên thay vì trình duyệt bên trong ứng dụng khác. Chế độ riêng tư, chính sách thiết bị hoặc ứng dụng đã được cài có thể khiến tùy chọn không xuất hiện. Bạn vẫn có thể sử dụng QuánPilot qua website.</p><h2>Sau khi cài</h2><p>Mở biểu tượng của nhà hàng từ màn hình chính hoặc danh sách ứng dụng. Có thể cần đăng nhập lại, tùy thiết bị và phiên hiện tại. QuánPilot cần kết nối mạng để tải và đồng bộ dữ liệu; việc cài ứng dụng không thay đổi quyền truy cập hay thời hạn phiên đăng nhập.</p><p>Hướng dẫn trình duyệt: <a href="https://support.google.com/chrome/answer/9658361?hl=vi" target="_blank" rel="noopener noreferrer">Chrome</a>, <a href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios" target="_blank" rel="noopener noreferrer">Safari trên iPhone</a>, <a href="https://support.microsoft.com/en-us/edge/install-manage-or-uninstall-apps-in-microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a>.</p><Link className="text-link" href="/products/quanpilot">← Khám phá QuánPilot</Link></div>
 </div></section>
 </PublicPage>;}
