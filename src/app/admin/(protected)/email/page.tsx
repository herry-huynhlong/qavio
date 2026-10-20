import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('email');return <AdminTable resource="email" title="Hàng đợi email" description="Trạng thái thực tế và retry từng email theo quyền."/>;}
