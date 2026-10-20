import Link from 'next/link';
import {pageActor} from '@/server/admin/page-auth';
import {AdminTable} from '@/components/admin/table';
export default async function Page(){await pageActor('settings');return <><section className="admin-card"><h2>Thông tin liên hệ</h2><p>Nhập hoặc sửa số điện thoại, Zalo và các nút liên hệ trên website.</p><Link className="admin-button" href="/admin/settings/contact">Mở thông tin liên hệ</Link></section><AdminTable resource="content" title="Thông tin & chính sách" description="Thông tin công ty và chính sách cần rà soát trước khi công bố." contentKinds={[["CONTACT", "Thông tin liên hệ"], ["PRIVACY", "Bảo mật"], ["TERMS", "Điều khoản"]]}/></>;}
