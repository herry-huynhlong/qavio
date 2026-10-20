import type { Transaction } from './db';
import { hmac } from './crypto';
export async function lock(tx: Transaction, value: string) {
  const key = BigInt.asIntN(64, BigInt(`0x${hmac(value).slice(0,16)}`));
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(${key})::text`;
}
export async function lockSubscriber(tx: Transaction, id: string) {
  await tx.$queryRaw`SELECT id FROM "NewsletterSubscriber" WHERE id = ${id}::uuid FOR UPDATE`;
  return tx.newsletterSubscriber.findUniqueOrThrow({ where: { id } });
}
