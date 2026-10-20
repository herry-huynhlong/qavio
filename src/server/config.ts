export { POLICY_VERSION } from '@/lib/submission-schema';
export function formsEnabled() {
  const tier = process.env.QAVIO_DEPLOYMENT_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  return ['development','test','staging','production'].includes(tier) && process.env.QAVIO_PUBLIC_FORMS_ENABLED === 'true' && (tier !== 'production' || process.env.QAVIO_DATA_POLICY_APPROVED === 'true');
}
export function appOrigin() {
  const value = process.env.APP_ORIGIN || 'http://127.0.0.1:3100';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.origin !== value) throw new Error('INVALID_APP_ORIGIN');
  return value;
}
export function mailConfigured() {
  return process.env.EMAIL_PROVIDER === 'smtp' && !!process.env.SMTP_HOST && !!process.env.EMAIL_FROM;
}
