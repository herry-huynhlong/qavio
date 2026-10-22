/** Suppress obsolete CMS links at render time; do not rewrite stored content. */
export function retiredNewsletterHref(href: string | undefined) {
  if (!href) return false;
  try {
    const url = new URL(href, 'https://qavio.site');
    return ['qavio.site', 'qavio.longh.org', '127.0.0.1', 'localhost'].includes(url.hostname) && ['/subscribe', '/newsletter/confirm'].includes(url.pathname.replace(/\/$/, ''));
  } catch { return false; }
}
