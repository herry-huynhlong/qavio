import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {db} from '../db';
import {failure,HttpError,readJson,response} from '../http';
import {equalSecret} from '../crypto';
import {authenticate,authenticatedMutation,login,loginCsrf,logout,mutationOrigin,publicUser} from './auth';
import {allowed,type Permission} from './permissions';
import {listUsers,createUser,updateUser} from './accounts';
import {listLeads,leadDetail,updateLead,exportLeads} from './crm';
import {listSubscribers,subscriberDetail,recordDataRequest,reviewDataRequest,listEmails,retryEmail} from './newsletter';
import {listContent,contentDetail,saveContent,listCategories,saveCategory} from './cms';
import {listMedia,uploadMedia} from './media';
import {audit} from './audit';
import {hashPassword,verifyPassword} from './password';
import {loginSchema,password,parsed,query,uuid} from './validation';

const methods=['GET','POST','PATCH'];
export function requiredPermission(path:string[]):Permission{
  const [resource,,action]=path;
  if(resource==='leads')return path[1]==='export'?'export':'crm';
  if(resource==='subscribers')return 'subscribers';
  if(resource==='data-requests')return 'privacy';
  if(resource==='email')return action==='retry'?'retry':'email';
  if(resource==='content'||resource==='categories'||resource==='media')return 'content';
  if(resource==='accounts')return 'accounts';
  if(resource==='audit')return 'audit';
  return 'dashboard';
}
async function filterRequest(request:Request){
  if(request.method==='GET')return request;
  const filters=parsed(z.object({page:z.number().int().optional(),size:z.number().int().optional(),q:z.string().optional(),status:z.string().optional(),type:z.string().optional(),kind:z.string().optional(),from:z.string().optional(),to:z.string().optional(),actorId:z.string().optional(),targetType:z.string().optional()}).strict(),await readJson(request));
  const url=new URL(request.url);for(const [key,value] of Object.entries(filters))if(value!==undefined&&value!=='')url.searchParams.set(key,String(value));
  return new Request(url,{headers:request.headers});
}
async function dashboard(role:Parameters<typeof allowed>[0]){
  const [publishedPosts,draftPosts]=await db().$transaction([db().contentEntry.count({where:{kind:'POST',status:'PUBLISHED'}}),db().contentEntry.count({where:{kind:'POST',status:'DRAFT'}})]);
  if(!allowed(role,'crm'))return {publishedPosts,draftPosts};
  const [totalLeads,newLeads,demoRequests,quoteRequests,confirmedSubscribers,failedEmails,byType,byStatus]=await db().$transaction([db().lead.count(),db().lead.count({where:{status:'NEW'}}),db().lead.count({where:{inquiryType:'DEMO'}}),db().lead.count({where:{inquiryType:'QUOTE'}}),db().newsletterSubscriber.count({where:{status:'CONFIRMED'}}),db().emailOutbox.count({where:{status:'FAILED'}}),db().lead.groupBy({by:['inquiryType'],orderBy:{inquiryType:'asc'},_count:{_all:true}}),db().lead.groupBy({by:['status'],orderBy:{status:'asc'},_count:{_all:true}})]);
  return {totalLeads,newLeads,demoRequests,quoteRequests,confirmedSubscribers,failedEmails,publishedPosts,draftPosts,byType,byStatus};
}
async function auditList(request:Request){
  const {page,size,skip,q,params,dateRange}=query(request),actorId=params.get('actorId'),targetType=params.get('targetType');
  if(actorId)parsed(uuid,actorId);if(targetType&&targetType.length>40)throw new HttpError(422,'FILTER_INVALID');
  const where:Prisma.AuditLogWhereInput={actorId:actorId||undefined,targetType:targetType||undefined,createdAt:dateRange,...(q?{OR:[{action:{contains:q,mode:'insensitive'}},{targetId:{contains:q}},{actor:{name:{contains:q,mode:'insensitive'}}}]}:{})};
  const [total,rows]=await db().$transaction([db().auditLog.count({where}),db().auditLog.findMany({where,skip,take:size,orderBy:[{createdAt:'desc'},{id:'desc'}],include:{actor:{select:{id:true,name:true}}}})]);return {rows,total,page,size};
}
export async function adminApi(request:Request,path:string[]){
  try{
    if(!methods.includes(request.method))return response({ok:false,code:'METHOD_NOT_ALLOWED'},405);
    const [resource,id,action]=path;if(path.length>3)throw new HttpError(404,'NOT_FOUND');
    if(resource==='auth'&&id==='csrf'&&path.length===2&&request.method==='GET')return loginCsrf(request);
    if(resource==='auth'&&id==='login'&&path.length===2&&request.method==='POST'){
      if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new HttpError(415,'JSON_REQUIRED');
      const value=parsed(loginSchema,await readJson(request));return await login(request,value.email,value.password);
    }
    const permission=requiredPermission(path),auth=await authenticate(request,permission);
    if(request.method!=='GET'){
      mutationOrigin(request);if(!equalSecret(request.headers.get('x-csrf-token')||'',auth.csrf))throw new HttpError(403,'CSRF_REJECTED');
      if(resource!=='media'&&request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new HttpError(415,'JSON_REQUIRED');
    }
    if(resource==='auth'&&path.length===2){
      if(id==='me'&&request.method==='GET')return response({ok:true,user:publicUser(auth.user),csrfToken:auth.csrf,permissions:Object.keys((await import('./permissions')).permissions).filter(p=>allowed(auth.user.role,p as Permission))});
      if(id==='logout'&&request.method==='POST')return await logout(request);
      if(id==='sessions'&&request.method==='GET')return response({rows:await db().adminSession.findMany({where:{userId:auth.user.id,revokedAt:null,expiresAt:{gt:new Date()}},select:{id:true,createdAt:true,expiresAt:true,lastSeenAt:true},orderBy:{createdAt:'desc'},take:50}),currentId:auth.session.id});
      if(id==='revoke'&&request.method==='POST'){
        const input=parsed(z.object({id:uuid}).strict(),await readJson(request));
        return response(await authenticatedMutation(request,'dashboard',async(tx,current)=>{await tx.adminSession.updateMany({where:{id:input.id,userId:current.user.id},data:{revokedAt:new Date()}});await audit(tx,current.user.id,'SESSION_REVOKED','SESSION',input.id);return {ok:true};}));
      }
      if(id==='password'&&request.method==='POST'){
        const input=parsed(z.object({currentPassword:z.string().max(128),newPassword:password}).strict(),await readJson(request));
        if(!await verifyPassword(input.currentPassword,auth.user.passwordHash))throw new HttpError(401,'INVALID_CREDENTIALS');
        const passwordHash=await hashPassword(input.newPassword);
        return response(await authenticatedMutation(request,'dashboard',async(tx,current)=>{
          if(current.user.passwordHash!==auth.user.passwordHash)throw new HttpError(409,'VERSION_CONFLICT');
          await tx.adminUser.update({where:{id:current.user.id},data:{passwordHash,sessionVersion:{increment:1},version:{increment:1}}});await tx.adminSession.updateMany({where:{userId:current.user.id,revokedAt:null},data:{revokedAt:new Date()}});await audit(tx,current.user.id,'PASSWORD_CHANGED','ACCOUNT',current.user.id);return {ok:true,code:'LOGIN_AGAIN'};
        }));
      }
    }
    if(resource==='dashboard'&&!id&&request.method==='GET')return response(await dashboard(auth.user.role));
    const search=request.method==='POST'&&id==='search'&&path.length===2;
    const listing=(request.method==='GET'&&!id)||search;
    if(listing){const filters=await filterRequest(request);
      if(resource==='leads')return response(await listLeads(filters));
      if(resource==='subscribers')return response(await listSubscribers(filters));
      if(resource==='email')return response(await listEmails(filters));
      if(resource==='content')return response(await listContent(filters,auth.user.role));
      if(resource==='categories')return response(await listCategories(filters));
      if(resource==='accounts')return response(await listUsers(filters));
      if(resource==='audit')return response(await auditList(filters));
      if(resource==='media')return response(await listMedia(filters));
    }
    if(resource==='leads'&&id==='assignees'&&request.method==='GET')return response({rows:await db().adminUser.findMany({where:{isActive:true,role:{in:['SUPER_ADMIN','ADMIN']}},select:{id:true,name:true},orderBy:{name:'asc'},take:200})});
    if(resource==='leads'&&id==='export'&&request.method==='POST')return new Response(await exportLeads(request,await filterRequest(request)),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="qavio-leads.csv"','Cache-Control':'no-store'}});
    if(resource==='media'&&!id&&request.method==='POST')return response(await uploadMedia(request));
    if(!id&&request.method==='POST'){
      const body=await readJson(request,65536);
      if(resource==='accounts')return response(await createUser(request,body));
      if(resource==='categories')return response(await saveCategory(request,null,body));
      if(resource==='content')return response(await saveContent(request,null,body));
    }
    if(id){parsed(uuid,id);
      if(resource==='leads'&&!action&&request.method==='GET')return response(await leadDetail(id));
      if(resource==='subscribers'&&!action&&request.method==='GET')return response(await subscriberDetail(id));
      if(resource==='content'&&!action&&request.method==='GET')return response(await contentDetail(id,auth.user.role));
      if(request.method==='PATCH'&&!action){const body=await readJson(request,65536);
        if(resource==='leads')return response(await updateLead(request,id,body));
        if(resource==='accounts')return response(await updateUser(request,id,body));
        if(resource==='categories')return response(await saveCategory(request,id,body));
        if(resource==='content')return response(await saveContent(request,id,body));
        if(resource==='data-requests')return response(await reviewDataRequest(request,id,body));
      }
      if(resource==='subscribers'&&action==='requests'&&request.method==='POST')return response(await recordDataRequest(request,id,await readJson(request)));
      if(resource==='email'&&action==='retry'&&request.method==='POST'){const value=parsed(z.object({version:z.number().int().positive()}).strict(),await readJson(request));return response(await retryEmail(request,id,value.version));}
    }
    throw new HttpError(404,'NOT_FOUND');
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError){if(error.code==='P2002')return response({ok:false,code:'VALUE_ALREADY_EXISTS'},409);if(error.code==='P2025')return response({ok:false,code:'VERSION_CONFLICT'},409);}
    return failure(error);
  }
}

