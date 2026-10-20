import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {HttpError} from '../http';
let running=false;
const queue:(()=>void)[]=[];
async function derive(password:string,salt:Buffer):Promise<Buffer>{
  if(queue.length>=8)throw new HttpError(429,'AUTH_BUSY',5);
  if(running)await new Promise<void>(resolve=>queue.push(resolve));
  running=true;
  try{return await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:65536,r:8,p:2,maxmem:128*1024*1024},(error,key)=>error?reject(error):resolve(key)));}
  finally{const next=queue.shift();if(next)next();else running=false;}
}
export function passwordValid(password:string){return password.length>=12&&password.length<=128&&Buffer.byteLength(password)<=512;}
export async function hashPassword(password:string){
  if(!passwordValid(password))throw new HttpError(422,'PASSWORD_LENGTH');
  const salt=randomBytes(16),key=await derive(password,salt);
  return `scrypt$1$65536$8$2$${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function verifyPassword(password:string,encoded?:string){
  const parts=encoded?.split('$');
  const valid=parts?.length===7&&parts.slice(0,5).join('$')==='scrypt$1$65536$8$2'&&/^[a-f0-9]{32}$/.test(parts[5])&&/^[a-f0-9]{128}$/.test(parts[6]);
  const salt=valid?Buffer.from(parts![5],'hex'):Buffer.alloc(16);
  const key=await derive(password.slice(0,128),salt);
  return !!valid&&timingSafeEqual(key,Buffer.from(parts![6],'hex'));
}
