import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('audit');return <AdminTable resource="audit" title="Nhật ký kiểm toán" description="Tra cứu thao tác trên dữ liệu và tài khoản."/>;}
