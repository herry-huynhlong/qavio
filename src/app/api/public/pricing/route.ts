import { readPublicPricing } from '@/server/pricing';
export const dynamic = 'force-dynamic';
export async function GET() {
  const pricing = await readPublicPricing();
  return Response.json(pricing ?? {error:'Pricing temporarily unavailable'}, {status:pricing ? 200 : 503, headers:{'Cache-Control':'no-store'}});
}
