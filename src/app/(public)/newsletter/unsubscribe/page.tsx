import {NewsletterAction} from '@/components/newsletter-action';
export const metadata={title:{absolute:'Hủy nhận tin | QAVIO'},alternates:{canonical:'/newsletter/unsubscribe'},robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default function UnsubscribePage(){return <main id="main-content"><section className="section"><div className="container legal-document"><h1>Quản lý lựa chọn nhận tin</h1><NewsletterAction/></div></section></main>;}
