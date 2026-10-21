import {site} from '@/lib/site-config';
import { PublicPage } from "@/components/public-page";
import { TrialForm } from "@/components/trial-form";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("/trial");
export default function TrialPage() {
  return (
    <PublicPage
      path="/trial"
      eyebrow="DÙNG THỬ QUÁNPILOT"
      title="Trải nghiệm QuánPilot miễn phí trong 1 tháng"
      intro="Đăng ký nhà hàng và bắt đầu trải nghiệm những tính năng quản lý cơ bản của QuánPilot. Không cần thanh toán trước."
    >
      <section className="section">
        <div className="container trial-layout">
          <TrialForm loginUrl={site.quanpilotLoginUrl} />
        </div>
      </section>
    </PublicPage>
  );
}
