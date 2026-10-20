import type { MetadataRoute } from 'next';
import { publicPages, site } from '@/lib/site-config';
export default function sitemap(): MetadataRoute.Sitemap {
  // Draft legal documents are deliberately excluded, even after public indexing is enabled.
  return Object.keys(publicPages).filter(path => path !== '/privacy' && path !== '/terms').map(path => ({ url: new URL(path, site.url).href }));
}
