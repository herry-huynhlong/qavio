import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('accounts');return <AdminTable resource="accounts" title="Tài khoản quản trị" description="Cấp quyền và thu hồi truy cập theo trách nhiệm."/>;}
