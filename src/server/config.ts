export { POLICY_VERSION } from '@/lib/submission-schema';
export function formsEnabled() {
  const tier = process.env.QAVIO_DEPLOYMENT_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  return ['development','test','staging','production'].includes(tier) && process.env.QAVIO_PUBLIC_FORMS_ENABLED === 'true' && (tier !== 'production' || process.env.QAVIO_DATA_POLICY_APPROVED === 'true');
}
// CONTACT/DEMO are a separate, explicitly operated intake channel.
// Enabling them never opens quote/newsletter or claims legal approval.
export function consultationEnabled(){
  const tier=process.env.QAVIO_DEPLOYMENT_ENV||(process.env.NODE_ENV==='production'?'production':'development');
  if(!['development','test','staging','production'].includes(tier))return false;
  if(process.env.QAVIO_CONSULTATION_FORMS_ENABLED!==undefined)return process.env.QAVIO_CONSULTATION_FORMS_ENABLED==='true';
  return tier==='production'?false:formsEnabled();
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

// A separate Admin browser origin still uses this application's backend.
export function adminOrigin() {
  const value = process.env.QAVIO_ADMIN_ORIGIN || appOrigin();
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.origin !== value) throw new Error('INVALID_ADMIN_ORIGIN');
  return value;
}
