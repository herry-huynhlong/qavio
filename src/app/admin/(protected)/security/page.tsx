import {pageActor} from '@/server/admin/page-auth';
import {AdminSecurity} from '@/components/admin/security';
export default async function Page(){await pageActor();return <AdminSecurity/>;}
