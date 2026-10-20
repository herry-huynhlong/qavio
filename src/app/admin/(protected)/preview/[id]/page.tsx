import {notFound} from 'next/navigation';
import Image from 'next/image';
import {pageActor} from '@/server/admin/page-auth';
import {contentDetail} from '@/server/admin/cms';
import {CmsStructured} from '@/components/cms-structured';
import {CmsBody} from '@/components/cms-body';
import {HttpError} from '@/server/http';
export default async function Preview({params}:{params:Promise<{id:string}>}){const auth=await pageActor('content'),{id}=await params;if(!/^[0-9a-f-]{36}$/.test(id))notFound();let entry;try{entry=await contentDetail(id,auth.user.role);}catch(error){if(error instanceof HttpError&&(error.status===403||error.status===404))notFound();throw error;}return <article className="admin-preview"><p className="admin-alert">Xem trước nội bộ · {entry.status} · Phiên bản {entry.version}. Bản nháp chưa được hiển thị công khai.</p><h1>{entry.title}</h1><p>{entry.summary}</p>{entry.featuredMedia&&<Image src={`/media/${entry.featuredMedia.id}`} alt={entry.featuredMedia.label} width={entry.featuredMedia.width} height={entry.featuredMedia.height} unoptimized/>}<CmsBody html={entry.bodyHtml}/><CmsStructured kind={entry.kind} data={entry.data}/></article>;}
