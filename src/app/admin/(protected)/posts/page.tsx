import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('content');return <AdminTable resource="content" title="Bài viết" description="Biên tập bản nháp, xem trước và xuất bản tin tức." kind="POST"/>;}
