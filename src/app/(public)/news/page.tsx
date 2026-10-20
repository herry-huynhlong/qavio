import Link from 'next/link';
import { ArrowUpRight, Layers3 } from 'lucide-react';
import { PublicPage } from '@/components/public-page';
import { pageMetadata } from '@/lib/seo';
import {publishedList} from '@/server/public-content';

export const metadata = pageMetadata('/news');
export default async function NewsPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const raw=(await searchParams).page||'1',page=/^[1-9]\d{0,3}$/.test(raw)?Number(raw):1;
  const collection=await publishedList('POST',page);
  return <PublicPage path="/news" eyebrow="GÓC NHÌN QAVIO" title="Ý tưởng được chia sẻ. Giá trị được nối dài." intro="Tin tức sản phẩm, kiến thức công nghệ và góc nhìn về vận hành doanh nghiệp sẽ được chia sẻ khi có nội dung được xuất bản.">
    <section className="section"><div className="container">{collection.total>0?<><div className="content-cards news-cards">{collection.rows.map(row=><article key={row.id}>{row.category&&<span className="eyebrow">{row.category.name}</span>}<h2><Link href={`/news/${row.slug}`}>{row.title}</Link></h2><p>{row.summary}</p><Link href={`/news/${row.slug}`} className="text-link">Đọc bài viết <ArrowUpRight size={17}/></Link></article>)}</div><nav className="form-actions" aria-label="Phân trang tin tức">{page>1&&<Link href={`/news?page=${page-1}`}>← Trang trước</Link>}<span>Trang {page}</span>{page*12<collection.total&&<Link href={`/news?page=${page+1}`}>Trang sau →</Link>}</nav></>:<><ul className="topic-list" aria-label="Các chủ đề dự kiến">{['Tin tức QAVIO', 'Sản phẩm', 'Công nghệ', 'Kiến thức quản lý', 'Chuyển đổi số'].map(topic=><li key={topic}>{topic}</li>)}</ul><div className="empty-state"><Layers3 size={40} strokeWidth={1}/><h2>Chưa có bài viết được xuất bản.</h2><p>QAVIO đang chuẩn bị nội dung. Các chủ đề phía trên là định hướng biên tập, chưa phải bộ lọc bài viết.</p><Link href="/subscribe" className="text-link">Tìm hiểu kênh nhận thông tin <ArrowUpRight size={17}/></Link></div></>}</div></section>
  </PublicPage>;
}
