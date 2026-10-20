import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('crm');return <AdminTable resource="leads" title="Khách hàng tiềm năng" description="Theo dõi yêu cầu gốc, phân công và lưu lịch sử xử lý."/>;}
