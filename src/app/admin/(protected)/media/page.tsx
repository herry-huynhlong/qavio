import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('content');return <AdminTable resource="media" title="Hình ảnh" description="Xem kho ảnh đã tải. Để tải và gắn ảnh vào nội dung, mở trình biên tập bài viết hoặc nội dung website."/>;}
