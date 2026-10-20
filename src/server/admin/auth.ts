import {randomBytes} from 'node:crypto';
import type {AdminRole} from '@prisma/client';
import {db,transaction,type Transaction} from '../db';
import {HttpError,clientBucket,response} from '../http';
import {appOrigin} from '../config';
import {equalSecret,hmac,sha256} from '../crypto';
import {rateLimit} from '../rate-limit';
import {lock} from '../repository';
import {audit} from './audit';
import {allowed,type Permission} from './permissions';
import {hashPassword,verifyPassword} from './password';

const SESSION_MS=8*60*60*1000,IDLE_MS=30*60*1000;
export function adminEnabled(){return process.env.QAVIO_ADMIN_ENABLED==='true';}
const production=()=>(process.env.QAVIO_DEPLOYMENT_ENV||(process.env.NODE_ENV==='production'?'production':'development'))==='production';
export const sessionCookieName=()=>production()?'__Host-qavio_admin':'qavio_admin';
const loginCookieName=()=>production()?'__Host-qavio_login':'qavio_login';
export function cookiesOf(request:Request){return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(v=>{const i=v.indexOf('=');return [v.slice(0,i).trim(),v.slice(i+1)];}).filter(([k])=>k));}
function cookie(name:string,value:string,maxAge:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production()?'; Secure':''}`;}
export function mutationOrigin(request:Request){
  if(request.headers.get('origin')!==appOrigin())throw new HttpError(403,'ORIGIN_REJECTED');
  const site=request.headers.get('sec-fetch-site');
  if(site&&!['same-origin','none'].includes(site))throw new HttpError(403,'ORIGIN_REJECTED');
}
function enabled(){if(!adminEnabled())throw new HttpError(503,'ADMIN_NOT_ENABLED');}
export function loginCsrf(request:Request){
  enabled();
  if(request.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'ORIGIN_REJECTED');
  const token=`${Date.now()}.${randomBytes(32).toString('hex')}`;
  const result=response({ok:true,csrfToken:token});
  result.headers.append('Set-Cookie',cookie(loginCookieName(),`${token}.${hmac(`admin-login:${token}`)}`,600));
  return result;
}
function checkLoginCsrf(request:Request){
  mutationOrigin(request);
  const token=request.headers.get('x-csrf-token')||'';
  const signed=cookiesOf(request)[loginCookieName()]||'';
  const time=Number(token.split('.')[0]);
  if(!/^\d{13}\.[a-f0-9]{64}$/.test(token)||Date.now()-time>600000||time>Date.now()+1000||!equalSecret(signed,`${token}.${hmac(`admin-login:${token}`)}`))throw new HttpError(403,'CSRF_REJECTED');
}
export const publicUser=(user:{id:string;name:string;email:string;role:AdminRole;isActive:boolean;version:number})=>({id:user.id,name:user.name,email:user.email,role:user.role,isActive:user.isActive,version:user.version});
export async function authenticate(request:Request,permission?:Permission,tx:Transaction|ReturnType<typeof db>=db()){
  enabled();
  const raw=cookiesOf(request)[sessionCookieName()]||'';
  if(!/^[a-f0-9]{64}$/.test(raw))throw new HttpError(401,'AUTH_REQUIRED');
  const session=await tx.adminSession.findUnique({where:{tokenHash:sha256(raw)},include:{user:true}});
  const now=Date.now();
  if(!session||session.revokedAt||session.expiresAt.getTime()<=now||session.lastSeenAt.getTime()<=now-IDLE_MS||!session.user.isActive||session.sessionVersion!==session.user.sessionVersion)throw new HttpError(401,'SESSION_EXPIRED');
  if(permission&&!allowed(session.user.role,permission))throw new HttpError(403,'PERMISSION_DENIED');
  if(now-session.lastSeenAt.getTime()>60000)await tx.adminSession.updateMany({where:{id:session.id,revokedAt:null},data:{lastSeenAt:new Date()}});
  return {user:session.user,session,csrf:hmac(`admin-csrf:${raw}`)};
}
export async function authenticatedMutation<T>(request:Request,permission:Permission,action:(tx:Transaction,auth:Awaited<ReturnType<typeof authenticate>>)=>Promise<T>){
  mutationOrigin(request);
  await authenticate(request,permission);
  return transaction(async tx=>{
    await lock(tx,'admin-security');
    const auth=await authenticate(request,permission,tx);
    if(!equalSecret(request.headers.get('x-csrf-token')||'',auth.csrf))throw new HttpError(403,'CSRF_REJECTED');
    return action(tx,auth);
  });
}
export async function login(request:Request,email:string,password:string){
  enabled();checkLoginCsrf(request);
  await transaction(async tx=>{await rateLimit(tx,`admin-login:ip:${clientBucket(request)}`,15,60000);await rateLimit(tx,`admin-login:email:${email}`,5,900000);});
  const user=await db().adminUser.findUnique({where:{email}});
  const correct=await verifyPassword(password,user?.passwordHash);
  if(!correct||!user?.isActive){await transaction(tx=>audit(tx,null,'LOGIN_FAILED','AUTH',hmac(`admin-email:${email}`)));throw new HttpError(401,'INVALID_CREDENTIALS');}
  const raw=randomBytes(32).toString('hex');
  await transaction(async tx=>{
    await lock(tx,'admin-security');
    const current=await tx.adminUser.findUniqueOrThrow({where:{id:user.id}});
    if(!current.isActive||current.passwordHash!==user.passwordHash)throw new HttpError(401,'INVALID_CREDENTIALS');
    const old=cookiesOf(request)[sessionCookieName()];
    if(old)await tx.adminSession.updateMany({where:{tokenHash:sha256(old),revokedAt:null},data:{revokedAt:new Date()}});
    await tx.adminSession.create({data:{userId:user.id,tokenHash:sha256(raw),sessionVersion:current.sessionVersion,expiresAt:new Date(Date.now()+SESSION_MS)}});
    await audit(tx,user.id,'LOGIN_SUCCEEDED','AUTH',user.id);
  });
  const result=response({ok:true,user:publicUser(user)});
  result.headers.append('Set-Cookie',cookie(sessionCookieName(),raw,SESSION_MS/1000));
  result.headers.append('Set-Cookie',cookie(loginCookieName(),'',0));
  return result;
}
export async function logout(request:Request){
  await authenticatedMutation(request,'dashboard',async(tx,auth)=>{await tx.adminSession.update({where:{id:auth.session.id},data:{revokedAt:new Date()}});await audit(tx,auth.user.id,'LOGOUT','AUTH',auth.user.id);});
  const result=response({ok:true});result.headers.append('Set-Cookie',cookie(sessionCookieName(),'',0));return result;
}
export async function bootstrap(email:string,name:string,password:string){
  const hash=await hashPassword(password);
  return transaction(async tx=>{
    await lock(tx,'admin-security');
    if(await tx.adminUser.count())throw new HttpError(409,'BOOTSTRAP_ALREADY_COMPLETE');
    const user=await tx.adminUser.create({data:{email,name,passwordHash:hash,role:'SUPER_ADMIN'}});
    await audit(tx,user.id,'ADMIN_BOOTSTRAPPED','ACCOUNT',user.id,{role:'SUPER_ADMIN'});
    return publicUser(user);
  });
}
