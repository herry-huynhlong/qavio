import Link from 'next/link';
export default function ForbiddenPage(){return <main id="main-content" className="admin-denied"><span className="admin-eyebrow">QUYỀN TRUY CẬP</span><h1>Chưa được cấp quyền.</h1><p>Liên hệ người quản trị tài khoản nếu công việc của bạn cần quyền này.</p><Link href="/admin" className="admin-button">Về tổng quan</Link></main>;}
