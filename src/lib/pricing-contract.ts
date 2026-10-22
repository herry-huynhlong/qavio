import { z } from 'zod';
const amount = z.number().int().positive().max(999_999_999);
export const publishedPriceSchema = z.object({
  plan: z.enum(['BASIC', 'PRO']), name: z.enum(['BASIC', 'PRO']), termMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  currency: z.literal('VND'), priceVnd: amount, monthlyPriceVnd: z.number().int().min(0).max(999_999_999), originalPriceVnd: amount.nullable(),
  discountBasisPoints: z.number().int().min(0).max(9999), features: z.array(z.string().min(1).max(120)).max(20),
  status: z.literal('PUBLISHED'), updatedAt: z.iso.datetime(),
}).strict().superRefine((p, ctx) => {
  const monthly = Number((BigInt(p.priceVnd) * BigInt(2) + BigInt(p.termMonths)) / (BigInt(2) * BigInt(p.termMonths)));
  const discount = p.originalPriceVnd && p.originalPriceVnd > p.priceVnd ? Number(BigInt(p.originalPriceVnd - p.priceVnd) * BigInt(10000) / BigInt(p.originalPriceVnd)) : 0;
  if (p.name !== p.plan || p.monthlyPriceVnd !== monthly || p.discountBasisPoints !== discount || (p.originalPriceVnd !== null && p.originalPriceVnd <= p.priceVnd)) ctx.addIssue({code:'custom', message:'Inconsistent pricing'});
});
export const pricingSchema = z.object({
  version: z.string().regex(/^[a-f0-9]{64}$/), generatedAt: z.iso.datetime(), validUntil: z.iso.datetime(),
  terms: z.tuple([z.literal(3), z.literal(6), z.literal(12)]), prices: z.array(publishedPriceSchema).max(6),
}).strict().superRefine((data, ctx) => {
  const generated = Date.parse(data.generatedAt), expires = Date.parse(data.validUntil);
  if (expires <= generated || expires - generated > 60_000 || new Set(data.prices.map(p => `${p.plan}:${p.termMonths}`)).size !== data.prices.length) ctx.addIssue({code:'custom',message:'Invalid price validity'});
});
export type PublicPricing = z.infer<typeof pricingSchema>;
export type PublishedPrice = z.infer<typeof publishedPriceSchema>;
