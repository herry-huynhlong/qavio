import type { Metadata } from "next";
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site-config';
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata('/'),
  metadataBase: new URL(site.url),
  title: { default: "QAVIO — Công nghệ kiến tạo giá trị", template: "%s | QAVIO" },
  description: "QAVIO hướng đến những giải pháp công nghệ thiết thực cho doanh nghiệp. Khám phá QuánPilot, nền tảng hỗ trợ quản lý nhà hàng, quán ăn và quán nước.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><a className="skip-link" href="#main-content">Chuyển đến nội dung chính</a>{children}</body></html>;
}
