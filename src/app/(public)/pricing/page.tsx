import { PublicPage } from '@/components/public-page';
import { PricingTable } from '@/components/pricing-table';
import { TrialBanner } from '@/components/trial-cta';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site-config';
import styles from '@/components/pricing-table.module.css';
import { readPublicPricing } from '@/server/pricing';
export const metadata = pageMetadata('/pricing');
export const dynamic = 'force-dynamic';
export default async function PricingPage() {
  const prices = await readPublicPricing();
  return <div className={styles.page}><PublicPage path="/pricing" eyebrow="GÓI DỊCH VỤ QUÁNPILOT" title="Bảng giá QuánPilot" intro="Chọn giải pháp phù hợp với nhu cầu và quy mô vận hành của bạn." enhanced>
    <section className="section"><div className="container"><PricingTable initial={prices} loginUrl={site.quanpilotLoginUrl}/></div></section>
    <TrialBanner/>
  </PublicPage></div>;
}
