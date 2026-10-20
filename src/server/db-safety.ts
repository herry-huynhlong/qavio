export function assertDatabaseUrl(raw: string | undefined, purpose: 'runtime' | 'development' | 'test' = 'runtime') {
  if (!raw) throw new Error('QAVIO_DATABASE_NOT_CONFIGURED');
  let url:URL;
  try{url=new URL(raw);}catch{throw new Error('QAVIO_DATABASE_URL_INVALID');}
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !/^qavio_(dev|test|staging|prod)$/.test(name)) throw new Error('QAVIO_DATABASE_TARGET_REJECTED');
  const tier = process.env.QAVIO_DEPLOYMENT_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  if(purpose==='runtime'&&!['development','test','staging','production'].includes(tier))throw new Error('QAVIO_ENVIRONMENT_INVALID');
  if(purpose==='runtime'&&tier==='test')assertDatabaseUrl(raw,'test');
  if(purpose==='runtime'&&tier==='development')assertDatabaseUrl(raw,'development');
  if (purpose === 'test' && (name !== 'qavio_test' || !['localhost', '127.0.0.1', '::1', '[::1]', 'qavio-postgres'].includes(url.hostname))) throw new Error('QAVIO_TEST_TARGET_REJECTED');
  if (purpose === 'development' && (name !== 'qavio_dev' || !['localhost','127.0.0.1','::1','[::1]','qavio-postgres'].includes(url.hostname))) throw new Error('QAVIO_DEV_TARGET_REJECTED');
  if (purpose === 'runtime' && (tier === 'test' ? name !== 'qavio_test' : tier === 'development' ? name !== 'qavio_dev' : tier === 'staging' ? name !== 'qavio_staging' : name !== 'qavio_prod')) throw new Error('QAVIO_DATABASE_ENV_MISMATCH');
  return raw;
}
