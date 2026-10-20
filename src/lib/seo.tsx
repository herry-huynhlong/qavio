import type { Metadata } from 'next';
import { publicPages, site, type PublicPath } from './site-config';

export function pageMetadata(path: PublicPath): Metadata {
  const { title, description } = publicPages[path];
  const url = new URL(path, site.url).href;
  const legalDraft = path === '/privacy' || path === '/terms';
  return {
    title: { absolute: `${title} | QAVIO` }, description,
    alternates: { canonical: url },
    robots: { index: site.indexingEnabled && !legalDraft, follow: site.indexingEnabled },
    openGraph: { type: 'website', locale: 'vi_VN', siteName: site.name, title: `${title} | QAVIO`, description, url,
      images: [{ url: new URL(site.brandImage, site.url).href, width: 1536, height: 1024, alt: 'Ảnh thương hiệu QAVIO chính thức' }] },
    twitter: { card: 'summary_large_image', title: `${title} | QAVIO`, description, images: [new URL(site.brandImage, site.url).href] },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
