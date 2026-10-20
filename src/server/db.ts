import { PrismaClient, type Prisma } from '@prisma/client';
import { assertDatabaseUrl } from './db-safety';

const globals = globalThis as unknown as { qavioDb?: PrismaClient };
export function db() {
  assertDatabaseUrl(process.env.DATABASE_URL);
  return globals.qavioDb ??= new PrismaClient({ log: [] });
}
export type Transaction = Prisma.TransactionClient;
export async function transaction<T>(operation: (tx: Transaction) => Promise<T>) {
  return db().$transaction(operation, { maxWait: 10000, timeout: 15000 });
}
