import Link from 'next/link';
import { ArrowUpRight, Layers3 } from 'lucide-react';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/news');
export default function NewsPage() {
  return <PublicPage path="/news" eyebrow="GÓC NHÌN QAVIO" title="Ý tưởng được chia sẻ. Giá trị được nối dài." intro="Tin tức sản phẩm, kiến thức công nghệ và góc nhìn về vận hành doanh nghiệp sẽ được chia sẻ khi có nội dung được xuất bản.">
    <section className="section"><div className="container"><ul className="topic-list" aria-label="Các chủ đề dự kiến">{['Tin tức QAVIO', 'Sản phẩm', 'Công nghệ', 'Kiến thức quản lý', 'Chuyển đổi số'].map(topic => <li key={topic}>{topic}</li>)}</ul><div className="empty-state"><Layers3 size={40} strokeWidth={1} /><h2>Chưa có bài viết được xuất bản.</h2><p>QAVIO đang chuẩn bị nội dung. Các chủ đề phía trên là định hướng biên tập, chưa phải bộ lọc bài viết.</p><Link href="/subscribe" className="text-link">Tìm hiểu kênh nhận thông tin <ArrowUpRight size={17} /></Link></div></div></section>
  </PublicPage>;
}
