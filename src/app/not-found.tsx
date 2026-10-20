import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() { return <main id="main-content" className="state-page container"><span className="eyebrow">404 — KHÔNG TÌM THẤY TRANG</span><h1>Có thể bạn đã đi<br/>xa hơn một chút.</h1><p>Trang này không tồn tại hoặc đã được chuyển đến địa chỉ khác.</p><Link href="/" className="button"><ArrowLeft size={18}/> Trở về QAVIO</Link></main>; }
