import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('content');return <AdminTable resource="categories" title="Danh mục" description="Phân loại nội dung với đường dẫn riêng."/>;}
