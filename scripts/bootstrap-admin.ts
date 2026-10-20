import readline from 'node:readline';
import {createInterface} from 'node:readline/promises';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
import {bootstrap} from '../src/server/admin/auth';
import {parsed,userCreateSchema} from '../src/server/admin/validation';
try{process.loadEnvFile('.env.local');}catch{}
async function hiddenPassword(){
  if(!process.stdin.isTTY||!process.stdin.setRawMode)throw Error('INTERACTIVE_TERMINAL_REQUIRED');
  readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdout.write('Mật khẩu (ít nhất 12 ký tự, không hiển thị): ');
  return new Promise<string>((resolve,reject)=>{
    let value='';
    const finish=(error?:Error)=>{process.stdin.off('keypress',key);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');if(error)reject(error);else resolve(value);};
    const key=(text:string,event:readline.Key)=>{if(event.ctrl&&event.name==='c'){finish(Error('CANCELLED'));return;}if(event.name==='return'){finish();return;}if(event.name==='backspace'){value=value.slice(0,-1);return;}if(!event.ctrl&&!event.meta&&text&&value.length<128)value+=text;};
    process.stdin.on('keypress',key);process.stdin.resume();
  });
}
async function main(){
  const deployed=process.argv.includes('--production')?'production':process.argv.includes('--staging')?'staging':null;
  if(deployed){const target=new URL(process.env.DATABASE_URL||'');if(process.env.QAVIO_DEPLOYMENT_ENV!==deployed||process.env[`QAVIO_${deployed.toUpperCase()}_BOOTSTRAP_APPROVED`]!=='true'||target.hostname!=='qavio-postgres'||target.pathname!==`/qavio_${deployed==='production'?'prod':'staging'}`||target.username!=='qavio_app')throw Error('DEPLOYED_BOOTSTRAP_NOT_APPROVED');}
  else if(process.argv.includes('--test')){assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';}
  else{assertDatabaseUrl(process.env.DATABASE_URL,'development');process.env.QAVIO_DEPLOYMENT_ENV='development';}
  let input:unknown;
  if(process.stdin.isTTY){const rl=createInterface({input:process.stdin,output:process.stdout});if(deployed){const confirmation=await rl.question(`Gõ chính xác ${deployed} qavio_${deployed==='production'?'prod':'staging'} qavio-postgres: `);if(confirmation!==`${deployed} qavio_${deployed==='production'?'prod':'staging'} qavio-postgres`){rl.close();throw Error('TARGET_CONFIRMATION_REQUIRED');}}const email=await rl.question('Email SUPER_ADMIN: '),name=await rl.question('Tên hiển thị: ');rl.close();input={email,name,password:await hiddenPassword(),role:'SUPER_ADMIN'};}
  else{let body='';for await(const chunk of process.stdin){body+=chunk;if(Buffer.byteLength(body)>2048)throw Error('INPUT_TOO_LARGE');}const raw=JSON.parse(body);if(deployed){if(raw.confirmEnvironment!==deployed||raw.confirmDatabase!==`qavio_${deployed==='production'?'prod':'staging'}`||raw.confirmHost!=='qavio-postgres')throw Error('TARGET_CONFIRMATION_REQUIRED');delete raw.confirmEnvironment;delete raw.confirmDatabase;delete raw.confirmHost;}input={...raw,role:'SUPER_ADMIN'};}
  const value=parsed(userCreateSchema,input);await bootstrap(value.email,value.name,value.password);
  console.log('SUPER_ADMIN đã được tạo trong database đã xác nhận. Không có mật khẩu mặc định.');
}
main().catch(()=>{console.error('BOOTSTRAP_FAILED: kiểm tra phê duyệt, xác nhận target và dữ liệu đầu vào; chỉ khởi tạo lần đầu.');process.exitCode=1;}).finally(async()=>{await db().$disconnect();});
