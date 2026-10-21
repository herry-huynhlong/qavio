import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { JsonLd } from '@/lib/seo';
import { publicPages, site, type PublicPath } from '@/lib/site-config';
import { faqs } from '@/content/vi';
import {publishedContent} from '@/server/public-content';

export function PublicPage({ path, eyebrow, title, intro, children }: {
  path: PublicPath; eyebrow: string; title: string; intro: string; children: React.ReactNode;
}) {
  const crumbs = [{ name: 'Trang chủ', path: '/' }, ...(path === '/products/quanpilot' ? [{ name: 'Sản phẩm', path: '/products' }] : []), { name: publicPages[path].title, path }];
  return <main id="main-content">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: new URL(item.path, site.url).href })) }} />
    <section className="page-hero"><div className="container"><nav aria-label="Đường dẫn trang" className="breadcrumbs"><ol>{crumbs.map((item, i) => <li key={item.path}>{i < crumbs.length - 1 ? <><Link href={item.path}>{item.name}</Link><ArrowRight size={12} aria-hidden="true" /></> : <span aria-current="page">{item.name}</span>}</li>)}</ol></nav><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div></section>
    {children}
  </main>;
}

export async function ConsultationCta() {
  const entry=await publishedContent('CTA','consultation'),data=entry?.data as {label:string;href:string}|undefined;
  return <section className="inner-cta"><div className="container"><div><span className="eyebrow">BẮT ĐẦU TỪ NHU CẦU THỰC TẾ</span><h2>{entry?.title||<>Cùng tìm hiểu điều phù hợp<br/>với doanh nghiệp của bạn.</>}</h2><p>{entry?.summary||'Chuẩn bị nhu cầu để cuộc trao đổi có điểm bắt đầu rõ ràng.'}</p></div><Link className="button" href={data?.href||'/trial'}>{data?.label||'Đăng ký dùng thử'} <ArrowUpRight size={18} /></Link></div></section>;
}

export async function FaqList({ extended = false }: { extended?: boolean }) {
  const entry=await publishedContent('FAQ','faq'),data=entry?.data as {items:{question:string;answer:string}[]}|undefined;
  const items = data?.items?.length?data.items.map(item=>[item.question,item.answer]):extended ? [...faqs,
    ['Chủ quán quản lý nhân viên như thế nào?', 'QuánPilot phân quyền theo vai trò chủ quán, quản lý, phục vụ, bếp và thu ngân; hỗ trợ đăng ký và thu hồi thiết bị nhân viên. Quyền cụ thể phụ thuộc gói và cấu hình triển khai.'],
    ['QuánPilot có hoạt động offline hoàn toàn không?', 'QAVIO chưa công bố khả năng offline hoàn toàn. Kết nối mạng và điều kiện sử dụng cần được đối chiếu khi tư vấn triển khai.'],
    ['Có thể sử dụng với mọi loại máy in không?', 'Chưa có cam kết tương thích mọi loại máy in. Khả năng in và khổ giấy cần được kiểm tra với thiết bị thực tế trước khi triển khai.'],
    ['Tôi có thể gửi đăng ký ngay trên website không?', 'Tình trạng tiếp nhận được hiển thị ở từng biểu mẫu. Khi tính năng đang mở, yêu cầu hợp lệ được lưu tại QAVIO; nhận tin cần xác nhận email riêng. Production chỉ mở thu thập sau khi chính sách dữ liệu được phê duyệt.'],
  ] : faqs;
  return <div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>;
}

export function DraftNotice() {
  return <aside className="notice draft-notice"><strong>Bản dự thảo — cần rà soát trước khi công bố chính thức</strong><p>Nội dung dưới đây chưa phải chính sách hoặc điều khoản đã có hiệu lực. Thông tin đơn vị vận hành, đầu mối liên hệ, thời hạn lưu trữ và điều kiện áp dụng cần được xác nhận trước khi kích hoạt việc tiếp nhận yêu cầu.</p></aside>;
}
