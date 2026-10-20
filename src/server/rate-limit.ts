import type { Transaction } from './db';
import { hmac } from './crypto';
import { HttpError } from './http';
export async function rateLimit(tx: Transaction, identity: string, limit: number, windowMs: number) {
  const key = hmac(`rate:${identity}`);
  const now = new Date(), reset = new Date(now.getTime() + windowMs);
  const [bucket] = await tx.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimitBucket" (key, count, "resetAt") VALUES (${key}, 1, ${reset})
    ON CONFLICT (key) DO UPDATE SET count = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1 ELSE "RateLimitBucket".count + 1 END,
    "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${reset} ELSE "RateLimitBucket"."resetAt" END RETURNING count, "resetAt"`;
  if (bucket.count > limit) throw new HttpError(429, 'RATE_LIMITED', Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000)));
}
