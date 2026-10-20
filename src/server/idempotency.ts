import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { hmac } from './crypto';
import { transaction, type Transaction } from './db';
import { HttpError } from './http';
import { lock } from './repository';
import { rateLimit } from './rate-limit';

export async function idempotent(scope: string, key: string | null, input: object, ip: string, create: (tx: Transaction) => Promise<Prisma.InputJsonObject>) {
  if (!z.uuid().safeParse(key).success) throw new HttpError(400, 'IDEMPOTENCY_KEY_REQUIRED');
  const keyHash = hmac(`idem:${key}`), fingerprint = hmac(JSON.stringify(input));
  return transaction(async tx => {
    await lock(tx, `idem:${scope}:${keyHash}`);
    const existing = await tx.idempotencyRecord.findUnique({ where: { scope_keyHash: { scope, keyHash } } });
    if (existing && existing.expiresAt > new Date()) {
      if (existing.fingerprint !== fingerprint) throw new HttpError(409, 'IDEMPOTENCY_CONFLICT');
      return existing.response;
    }
    if (existing) await tx.idempotencyRecord.delete({ where: { id: existing.id } });
    const body = input as { website: string; startedAt: number; email: string };
    const age = Date.now() - body.startedAt;
    if (body.website || age < 1200 || age > 2 * 60 * 60 * 1000) throw new HttpError(422, 'SUBMISSION_REJECTED');
    await rateLimit(tx, `new:${scope}:ip:${ip}`, 30, 15 * 60 * 1000);
    await rateLimit(tx, `new:${scope}:email:${body.email}`, 5, 15 * 60 * 1000);
    const result = await create(tx);
    await tx.idempotencyRecord.create({ data: { scope, keyHash, fingerprint, response: result, expiresAt: new Date(Date.now() + 86400000) } });
    return result;
  });
}
