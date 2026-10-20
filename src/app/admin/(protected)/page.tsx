import {pageActor} from '@/server/admin/page-auth';
import {AdminDashboard} from '@/components/admin/dashboard';
export default async function Page(){await pageActor();return <AdminDashboard/>;}
