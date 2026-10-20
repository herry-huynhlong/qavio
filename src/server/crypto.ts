import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function hmac(value: string) {
  const secret = process.env.QAVIO_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error('QAVIO_SECRET_NOT_CONFIGURED');
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function tokenValue(id: string) { return hmac(`newsletter-token:${id}`); }
export function equalSecret(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
