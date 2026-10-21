import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page({searchParams}:{searchParams:Promise<{status?:string}>}){await pageActor('crm');const {status}=await searchParams;return <AdminTable key={status==='NEW'?'new':'all'} resource="leads" initialStatus={status==='NEW'?'NEW':''} title="Liên hệ khách hàng" description="Theo dõi yêu cầu gốc, phân công và lưu lịch sử xử lý."/>;}
