import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('settings');return <AdminTable resource="content" title="Thông tin & chính sách" description="Thông tin công ty và chính sách cần rà soát trước khi công bố." contentKinds={[["CONTACT", "Thông tin liên hệ"], ["PRIVACY", "Bảo mật"], ["TERMS", "Điều khoản"]]}/>;}
