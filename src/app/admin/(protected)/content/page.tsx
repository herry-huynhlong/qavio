import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('content');return <AdminTable resource="content" title="Nội dung thương hiệu" description="Quản lý nội dung đã xác minh trước khi xuất bản." contentKinds={[["COMPANY", "Giới thiệu"], ["MISSION", "Sứ mệnh"], ["VISION", "Tầm nhìn"], ["VALUES", "Giá trị"], ["FAQ", "FAQ"], ["CTA", "CTA"]]}/>;}
