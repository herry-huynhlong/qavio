// Shared by the image entrypoint, operations CLI and readiness; never print env values.
import path from 'node:path';
/** @param {Record<string,string|undefined>} env */
export function validateEnvironment(env=process.env){
 const errors=[];const tier=env.QAVIO_DEPLOYMENT_ENV;
 const fail=code=>errors.push(code);
 if(!['development','test','staging','production'].includes(tier))fail('ENVIRONMENT_REQUIRED');
 const deployed=['production','staging'].includes(tier);
 let db;try{db=new URL(env.DATABASE_URL);if(!['postgres:','postgresql:'].includes(db.protocol))throw Error();}catch{fail('DATABASE_URL_INVALID');}
 const expected={development:'qavio_dev',test:'qavio_test',staging:'qavio_staging',production:'qavio_prod'}[tier];
 if(db&&decodeURIComponent(db.pathname.slice(1))!==expected)fail('DATABASE_ENVIRONMENT_MISMATCH');
 if(deployed&&(!db||db.username!=='qavio_app'||db.hostname!=='qavio-postgres'))fail('RUNTIME_DATABASE_ROLE_OR_HOST');
 let origin;try{origin=new URL(env.APP_ORIGIN);if(origin.origin!==env.APP_ORIGIN||origin.username||origin.password||!['http:','https:'].includes(origin.protocol))throw Error();}catch{fail('APP_ORIGIN_INVALID');}
 if(deployed&&origin?.protocol!=='https:')fail('HTTPS_REQUIRED');
 if(env.QAVIO_ADMIN_ORIGIN){try{const admin=new URL(env.QAVIO_ADMIN_ORIGIN);if(admin.origin!==env.QAVIO_ADMIN_ORIGIN||admin.username||admin.password||!['http:','https:'].includes(admin.protocol)||(deployed&&admin.protocol!=='https:'))throw Error();}catch{fail('ADMIN_ORIGIN_INVALID');}}
 if(!env.QAVIO_TOKEN_SECRET||Buffer.byteLength(env.QAVIO_TOKEN_SECRET)<32)fail('TOKEN_SECRET_REQUIRED');
 for(const flag of ['QAVIO_PUBLIC_FORMS_ENABLED','QAVIO_DATA_POLICY_APPROVED','QAVIO_ADMIN_ENABLED','QAVIO_CMS_ENABLED','SITE_INDEXING_ENABLED','QAVIO_ADMIN_DATA_REQUESTS_APPROVED','QAVIO_LEGAL_PUBLICATION_APPROVED'])if(env[flag]!==undefined&&!['true','false'].includes(env[flag]))fail('INVALID_BOOLEAN_'+flag);
 if(deployed&&(env.QAVIO_ADMIN_ENABLED==='true'||env.QAVIO_PUBLIC_FORMS_ENABLED==='true')&&(!env.QAVIO_TRUSTED_PROXY_SECRET||Buffer.byteLength(env.QAVIO_TRUSTED_PROXY_SECRET)<32))fail('TRUSTED_PROXY_REQUIRED');
 if(tier==='production'&&env.QAVIO_PUBLIC_FORMS_ENABLED==='true'&&env.QAVIO_DATA_POLICY_APPROVED!=='true')fail('DATA_POLICY_REQUIRED');
 if(deployed&&(env.QAVIO_CMS_ENABLED==='true'||env.QAVIO_ADMIN_ENABLED==='true')&&(!env.QAVIO_MEDIA_ROOT||!path.isAbsolute(env.QAVIO_MEDIA_ROOT)||env.QAVIO_MEDIA_ROOT.startsWith('/app/')))fail('PERSISTENT_MEDIA_REQUIRED');
 if(deployed&&(!env.QAVIO_OPS_ROOT||!path.isAbsolute(env.QAVIO_OPS_ROOT)||env.QAVIO_OPS_ROOT.startsWith('/app/')))fail('PERSISTENT_OPS_REQUIRED');
 if(!['disabled','smtp'].includes(env.EMAIL_PROVIDER||'disabled'))fail('EMAIL_PROVIDER_INVALID');
 if(env.EMAIL_PROVIDER==='smtp'){
  if(!env.SMTP_HOST||!env.SMTP_USER||!env.SMTP_PASSWORD||!env.EMAIL_FROM)fail('SMTP_CONFIGURATION_INCOMPLETE');
  if(!['465','587'].includes(env.SMTP_PORT||'587')||!['true','false'].includes(env.SMTP_SECURE||'false'))fail('SMTP_TLS_CONFIGURATION');
  if((env.SMTP_PORT==='465')!==(env.SMTP_SECURE==='true'))fail('SMTP_PORT_TLS_MISMATCH');
  if(/[\r\n]/.test(env.EMAIL_FROM||'')||!/@/.test(env.EMAIL_FROM||''))fail('EMAIL_FROM_INVALID');
 }
 if(errors.length)throw Error([...new Set(errors)].join(','));
 return {tier,emailConfigured:env.EMAIL_PROVIDER==='smtp'};
}
