import {Prisma,LeadStatus,InquiryType} from '@prisma/client';
import {db} from '../db';
import {HttpError} from '../http';
import {hmac} from '../crypto';
import {authenticatedMutation} from './auth';
import {audit} from './audit';
import {leadUpdateSchema,parsed,query} from './validation';
export function leadFilter(request:Request){
  const filters=query(request),{q,params,dateRange}=filters;
  const status=params.get('status'),type=params.get('type');
  if(status&&!Object.values(LeadStatus).includes(status as LeadStatus)||type&&!Object.values(InquiryType).includes(type as InquiryType))throw new HttpError(422,'FILTER_INVALID');
  const where:Prisma.LeadWhereInput={status:status as LeadStatus||undefined,inquiryType:type as InquiryType||undefined,createdAt:dateRange,...(q?{OR:[{fullName:{contains:q,mode:'insensitive'}},{email:{contains:q,mode:'insensitive'}},{phone:{contains:q}},{message:{contains:q,mode:'insensitive'}}]}:{})};
  return {...filters,where};
}
export async function listLeads(request:Request){
  const {where,page,size,skip}=leadFilter(request);
  const [total,rows]=await db().$transaction([db().lead.count({where}),db().lead.findMany({where,skip,take:size,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,fullName:true,email:true,phone:true,message:true,sourcePage:true,inquiryType:true,status:true,createdAt:true,version:true,assignedTo:{select:{id:true,name:true}}}})]);
  return {rows,total,page,size};
}
export async function leadDetail(id:string){
  const row=await db().lead.findUnique({where:{id},include:{assignedTo:{select:{id:true,name:true}},activities:{orderBy:[{createdAt:'desc'},{id:'desc'}],take:100}}});
  if(!row)throw new HttpError(404,'NOT_FOUND');return row;
}
export async function leadNotifications(){
  const where={status:'NEW' as const};
  const [total,rows]=await db().$transaction([db().lead.count({where}),db().lead.findMany({where,take:10,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,fullName:true,phone:true,message:true,inquiryType:true,sourcePage:true,createdAt:true}})],{isolationLevel:Prisma.TransactionIsolationLevel.RepeatableRead});
  return {total,rows:rows.map(row=>({...row,message:row.message.slice(0,160)}))};
}
export async function updateLead(request:Request,id:string,input:unknown){
  const value=parsed(leadUpdateSchema,input);
  return authenticatedMutation(request,'crm',async(tx,auth)=>{
    const old=await tx.lead.findUnique({where:{id}});if(!old)throw new HttpError(404,'NOT_FOUND');
    if(old.version!==value.version)throw new HttpError(409,'VERSION_CONFLICT');
    if(value.assignedToId){const target=await tx.adminUser.findUnique({where:{id:value.assignedToId}});if(!target?.isActive||target.role==='EDITOR')throw new HttpError(422,'ASSIGNEE_INVALID');}
    await tx.lead.update({where:{id,version:value.version},data:{status:value.status,assignedToId:value.assignedToId,version:{increment:1}}});
    if(value.status&&value.status!==old.status)await tx.leadActivity.create({data:{leadId:id,actorId:auth.user.id,type:'STATUS_CHANGED',note:`${old.status} → ${value.status}`}});
    if(value.assignedToId!==undefined&&value.assignedToId!==old.assignedToId)await tx.leadActivity.create({data:{leadId:id,actorId:auth.user.id,type:'ASSIGNED',note:value.assignedToId||'UNASSIGNED'}});
    if(value.note)await tx.leadActivity.create({data:{leadId:id,actorId:auth.user.id,type:'NOTE',note:value.note}});
    await audit(tx,auth.user.id,'LEAD_UPDATED','LEAD',id,{fromStatus:old.status,toStatus:value.status||old.status,assignmentChanged:value.assignedToId!==undefined,noteAdded:!!value.note});
    return {ok:true,version:old.version+1};
  });
}
export function csvCell(value:unknown){return `"'${String(value??'').replace(/\u0000/g,'').replaceAll('"','""')}"`;}
export async function exportLeads(request:Request,filterRequest:Request){
  const {where}=leadFilter(filterRequest);
  return authenticatedMutation(request,'export',async(tx,auth)=>{
    if(await tx.lead.count({where})>1000)throw new HttpError(422,'EXPORT_LIMIT_1000');
    const rows=await tx.lead.findMany({where,take:1000,orderBy:{id:'asc'}});
    await audit(tx,auth.user.id,'LEADS_EXPORTED','LEAD',null,{count:rows.length,filterHash:hmac(JSON.stringify(where))});
    return '\ufeffID,Ho ten,Email,Dien thoai,Loai,Trang thai,Ngay tao\r\n'+rows.map(r=>[r.id,r.fullName,r.email,r.phone,r.inquiryType,r.status,r.createdAt.toISOString()].map(csvCell).join(',')).join('\r\n');
  });
}
