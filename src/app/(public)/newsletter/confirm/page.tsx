import {NewsletterAction} from '@/components/newsletter-action';
export const metadata={title:{absolute:'Xác nhận nhận tin | QAVIO'},alternates:{canonical:'/newsletter/confirm'},robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default function ConfirmPage(){return <main id="main-content"><section className="section"><div className="container legal-document"><h1>Xác nhận nhận tin QAVIO</h1><NewsletterAction action="confirm"/></div></section></main>;}
