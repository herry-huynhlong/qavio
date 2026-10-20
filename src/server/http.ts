import { isIP } from 'node:net';
import { appOrigin, formsEnabled } from './config';
import { equalSecret } from './crypto';
export class HttpError extends Error {
  constructor(public status: number, public code: string, public retryAfter?: number) { super(code); }
}
export function response(body: unknown, status = 200, retryAfter?: number) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}) } });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) {
    if(error.status===429||error.code.startsWith('IMAGE_')||error.code.startsWith('UPLOAD_'))console.warn(JSON.stringify({event:'qavio_operational_signal',signal:error.status===429?'rate_limited':'upload_failure'}));
    return response({ ok: false, code: error.code }, error.status, error.retryAfter);
  }
  // Never log error.message/stack, request bodies, email addresses or tokens.
  console.error(JSON.stringify({ event: 'qavio_api_unavailable' }));
  return response({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503);
}
export function guard(request: Request) {
  if (!formsEnabled()) throw new HttpError(503, 'FORMS_NOT_ENABLED');
  if (request.headers.get('origin') !== appOrigin()) throw new HttpError(403, 'ORIGIN_REJECTED');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) throw new HttpError(403, 'ORIGIN_REJECTED');
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'JSON_REQUIRED');
}
export async function readJson(request: Request, maxBytes=16384) {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new HttpError(413, 'BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'INVALID_JSON');
  let length = 0;
  const chunks: Uint8Array[] = [];
  for (;;) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > maxBytes) { await reader.cancel(); throw new HttpError(413, 'BODY_TOO_LARGE'); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; } catch { throw new HttpError(400, 'INVALID_JSON'); }
}
export function clientBucket(request: Request) {
  const expected = process.env.QAVIO_TRUSTED_PROXY_SECRET;
  const ip = request.headers.get('x-qavio-client-ip') || '';
  // X-Forwarded-For / CF-Connecting-IP are never trusted directly.
  if (expected && expected.length >= 32 && equalSecret(request.headers.get('x-qavio-proxy-secret') || '', expected) && isIP(ip)) return ip;
  return 'untrusted-shared';
}
