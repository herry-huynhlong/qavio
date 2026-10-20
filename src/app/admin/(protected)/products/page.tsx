import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('content');return <AdminTable resource="content" title="Sản phẩm" description="Giới thiệu sản phẩm của QAVIO, bao gồm QuánPilot." kind="PRODUCT"/>;}
