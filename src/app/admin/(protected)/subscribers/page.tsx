import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('subscribers');return <AdminTable resource="subscribers" title="Người theo dõi" description="Lịch sử đồng ý và yêu cầu quyền dữ liệu của người đăng ký."/>;}
