import {site} from '@/lib/site-config';
import { PublicPage } from "@/components/public-page";
import { TrialForm } from "@/components/trial-form";
import { pageMetadata } from "@/lib/seo";
import {publishedVisuals} from '@/server/visuals';
import {VisualFigure} from '@/components/visual-media';
export const metadata = pageMetadata("/trial");
export default async function TrialPage() {
  const images=await publishedVisuals();
  return (
    <PublicPage
      path="/trial"
      eyebrow="DÙNG THỬ QUÁNPILOT"
      title="Trải nghiệm QuánPilot miễn phí trong 1 tháng"
      intro="Đăng ký nhà hàng và bắt đầu trải nghiệm những tính năng quản lý cơ bản của QuánPilot. Không cần thanh toán trước."
      visual={<VisualFigure image={images.hero} priority/>}
    >
      <section className="section">
        <div className="container trial-layout">
          <TrialForm loginUrl={site.quanpilotLoginUrl} />
        </div>
      </section>
    </PublicPage>
  );
}
