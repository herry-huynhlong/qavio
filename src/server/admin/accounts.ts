import {db} from '../db';
import {HttpError} from '../http';
import {authenticatedMutation,publicUser} from './auth';
import {hashPassword} from './password';
import {audit} from './audit';
import {parsed,userCreateSchema,userUpdateSchema,query} from './validation';
export async function listUsers(request:Request){
  const {page,size,skip,q}=query(request);
  const where=q?{OR:[{name:{contains:q,mode:'insensitive' as const}},{email:{contains:q,mode:'insensitive' as const}}]}:{};
  const [total,rows]=await db().$transaction([db().adminUser.count({where}),db().adminUser.findMany({where,skip,take:size,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,name:true,email:true,role:true,isActive:true,version:true,createdAt:true}})]);
  return {rows,total,page,size};
}
export async function createUser(request:Request,input:unknown){
  const value=parsed(userCreateSchema,input),passwordHash=await hashPassword(value.password);
  return authenticatedMutation(request,'accounts',async(tx,auth)=>{
    const user=await tx.adminUser.create({data:{email:value.email,name:value.name,role:value.role,passwordHash}});
    await audit(tx,auth.user.id,'ACCOUNT_CREATED','ACCOUNT',user.id,{role:user.role});return publicUser(user);
  });
}
export async function updateUser(request:Request,id:string,input:unknown){
  const value=parsed(userUpdateSchema,input),passwordHash=value.password?await hashPassword(value.password):undefined;
  return authenticatedMutation(request,'accounts',async(tx,auth)=>{
    const old=await tx.adminUser.findUnique({where:{id}});if(!old)throw new HttpError(404,'NOT_FOUND');
    if(old.version!==value.version)throw new HttpError(409,'VERSION_CONFLICT');
    if(old.isActive&&old.role==='SUPER_ADMIN'&&(value.isActive===false||(value.role&&value.role!=='SUPER_ADMIN'))&&await tx.adminUser.count({where:{isActive:true,role:'SUPER_ADMIN'}})<=1)throw new HttpError(409,'LAST_SUPER_ADMIN');
    const revoke=!!passwordHash||(value.role!==undefined&&value.role!==old.role)||(value.isActive!==undefined&&value.isActive!==old.isActive);
    const user=await tx.adminUser.update({where:{id,version:value.version},data:{name:value.name,role:value.role,isActive:value.isActive,passwordHash,version:{increment:1},...(revoke?{sessionVersion:{increment:1}}:{})}});
    if(revoke)await tx.adminSession.updateMany({where:{userId:id,revokedAt:null},data:{revokedAt:new Date()}});
    await audit(tx,auth.user.id,'ACCOUNT_UPDATED','ACCOUNT',id,{fields:Object.keys(value).filter(k=>k!=='version'&&k!=='password'),passwordChanged:!!passwordHash,sessionsRevoked:revoke});return publicUser(user);
  });
}
