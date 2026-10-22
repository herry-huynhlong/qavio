import Link from 'next/link';
export const metadata={title:{absolute:'Thông tin liên kết | QAVIO'},robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default function ConfirmPage(){return <main id="main-content"><section className="section"><div className="container legal-document"><h1>Chức năng nhận tin đã ngừng hoạt động.</h1><p>Liên kết này không còn dùng để xác nhận đăng ký. Nếu cần hỗ trợ thông tin đã lưu, vui lòng liên hệ QAVIO.</p><Link className="button" href="/contact">Liên hệ QAVIO</Link></div></section></main>;}
