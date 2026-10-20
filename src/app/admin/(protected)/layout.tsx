import {pageActor} from '@/server/admin/page-auth';
import {AdminShell} from '@/components/admin/shell';
import {mailConfigured} from '@/server/config';
export const dynamic='force-dynamic';
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const auth=await pageActor();return <AdminShell {...auth} emailConfigured={mailConfigured()} dataProcessApproved={process.env.QAVIO_ADMIN_DATA_REQUESTS_APPROVED==='true'} legalApproved={process.env.QAVIO_LEGAL_PUBLICATION_APPROVED==='true'} local={process.env.QAVIO_DEPLOYMENT_ENV!=='production'}>{children}</AdminShell>;}
