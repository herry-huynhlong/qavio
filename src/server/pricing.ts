import { pricingSchema, type PublicPricing } from '@/lib/pricing-contract';
// This cache contains only public prices. Never reads the Restaurant database.
export function createPricingReader(fetcher: typeof fetch = fetch, now = Date.now) {
  let cached: PublicPricing | null = null, checkedAt = 0;
  let pending: Promise<PublicPricing | null> | null = null;
  return async function read(): Promise<PublicPricing | null> {
    if (cached && now() - checkedAt < 15_000 && Date.parse(cached.validUntil) > now()) return cached;
    if (pending) return pending;
    pending = (async () => {
      try {
        const origin = new URL(process.env.QUANPILOT_PRICING_API_ORIGIN || process.env.QUANPILOT_PUBLIC_URL || 'https://admin.qavio.site');
        if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Invalid pricing origin');
        const response = await fetcher(new URL('/api/public/pricing', origin), { cache: 'no-store', signal: AbortSignal.timeout(2500), redirect: 'error' });
        if (!response.ok) throw new Error('Pricing unavailable');
        const result = pricingSchema.parse(await response.json());
        if (Date.parse(result.validUntil) <= now() || Date.parse(result.generatedAt) > now() + 5000) throw new Error('Expired pricing');
        cached = result; checkedAt = now();
      } catch { /* A still-valid cache is safe; expired data is never returned. */ }
      return cached && Date.parse(cached.validUntil) > now() ? cached : null;
    })();
    try { return await pending; } finally { pending = null; }
  };
}
export const readPublicPricing = createPricingReader();
