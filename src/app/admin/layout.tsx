import type {Metadata} from 'next';
import './admin.css';
export const metadata:Metadata={title:{absolute:'QAVIO Admin'},robots:{index:false,follow:false},alternates:{canonical:null},referrer:'same-origin'};
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="admin-root">{children}</div>;}
