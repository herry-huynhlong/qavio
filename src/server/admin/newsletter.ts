import {Prisma,SubscriberStatus,EmailStatus} from '@prisma/client';
import {db} from '../db';
import {HttpError} from '../http';
import {lockSubscriber} from '../repository';
import {authenticatedMutation} from './auth';
import {audit} from './audit';
import {dataReviewSchema,parsed,privacySchema,query} from './validation';
import {emailEligible} from '../outbox-eligibility';
export async function listSubscribers(request:Request){
  const {page,size,skip,q,params,dateRange}=query(request),status=params.get('status');
  if(status&&!Object.values(SubscriberStatus).includes(status as SubscriberStatus))throw new HttpError(422,'FILTER_INVALID');
  const where:Prisma.NewsletterSubscriberWhereInput={status:status as SubscriberStatus||undefined,createdAt:dateRange,...(q?{OR:[{emailNormalized:{contains:q,mode:'insensitive'}},{name:{contains:q,mode:'insensitive'}}]}:{})};
  const [total,rows]=await db().$transaction([db().newsletterSubscriber.count({where}),db().newsletterSubscriber.findMany({where,skip,take:size,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,emailNormalized:true,name:true,status:true,source:true,confirmedAt:true,unsubscribedAt:true,version:true,createdAt:true}})]);
  return {rows,total,page,size};
}
export async function subscriberDetail(id:string){
  const row=await db().newsletterSubscriber.findUnique({where:{id},select:{id:true,emailNormalized:true,name:true,status:true,source:true,version:true,confirmedAt:true,unsubscribedAt:true,createdAt:true,events:{orderBy:{createdAt:'desc'},take:100,select:{id:true,type:true,policyVersion:true,source:true,createdAt:true}}}});
  if(!row)throw new HttpError(404,'NOT_FOUND');return {...row,dataRequests:await db().dataRequest.findMany({where:{subscriberId:id},orderBy:{createdAt:'desc'},take:50})};
}
export async function recordDataRequest(request:Request,id:string,input:unknown){
  const value=parsed(privacySchema,input);
  return authenticatedMutation(request,'subscribers',async(tx,auth)=>{
    if(!await tx.newsletterSubscriber.findUnique({where:{id}}))throw new HttpError(404,'NOT_FOUND');
    const row=await tx.dataRequest.create({data:{subscriberId:id,type:value.type,evidence:value.evidence,actorId:auth.user.id}});
    await audit(tx,auth.user.id,'DATA_REQUEST_RECORDED','DATA_REQUEST',row.id,{type:value.type});return row;
  });
}
export async function reviewDataRequest(request:Request,id:string,input:unknown){
  const value=parsed(dataReviewSchema,input);
  return authenticatedMutation(request,'privacy',async(tx,auth)=>{
    const row=await tx.dataRequest.findUnique({where:{id}});if(!row)throw new HttpError(404,'NOT_FOUND');
    if(row.version!==value.version)throw new HttpError(409,'VERSION_CONFLICT');
    if(row.status==='CLOSED'||value.status==='CLOSED'&&row.status!=='REVIEWED')throw new HttpError(409,'DATA_REQUEST_STATE_INVALID');
    if(value.status==='CLOSED'){
      if(process.env.QAVIO_ADMIN_DATA_REQUESTS_APPROVED!=='true')throw new HttpError(409,'DATA_PROCESS_NOT_APPROVED');
      if(row.type!=='UNSUBSCRIBE')throw new HttpError(409,'MANUAL_DATA_PROCESS_REQUIRED');
      const subscriber=await lockSubscriber(tx,row.subscriberId);
      await tx.newsletterSubscriber.update({where:{id:subscriber.id},data:{status:'UNSUBSCRIBED',unsubscribedAt:new Date(),version:{increment:1}}});
      await tx.newsletterConsentEvent.create({data:{subscriberId:subscriber.id,type:'ADMIN_UNSUBSCRIBED',policyVersion:'admin-approved-process',source:'admin-data-request'}});
    }
    const changed=await tx.dataRequest.update({where:{id,version:value.version},data:{status:value.status,evidence:`${row.evidence}\n${value.note}`.slice(0,500),version:{increment:1}}});
    await audit(tx,auth.user.id,'DATA_REQUEST_REVIEWED','DATA_REQUEST',id,{status:value.status,type:row.type});return changed;
  });
}
export async function listEmails(request:Request){
  const {page,size,skip,q,params,dateRange}=query(request),status=params.get('status');
  if(status&&!Object.values(EmailStatus).includes(status as EmailStatus))throw new HttpError(422,'FILTER_INVALID');
  const where:Prisma.EmailOutboxWhereInput={status:status as EmailStatus||undefined,createdAt:dateRange,...(q?{recipient:{contains:q,mode:'insensitive'}}:{})};
  const [total,rows]=await db().$transaction([db().emailOutbox.count({where}),db().emailOutbox.findMany({where,skip,take:size,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,kind:true,recipient:true,status:true,attempts:true,manualRetries:true,version:true,nextAttemptAt:true,sentAt:true,lastError:true,createdAt:true}})]);
  return {rows:rows.map(row=>({...row,lastError:['DELIVERY_FAILED','LEASE_EXPIRED','RECIPIENT_NOT_ELIGIBLE'].includes(row.lastError||'')?row.lastError:null})),total,page,size};
}
export async function retryEmail(request:Request,id:string,version:number){
  return authenticatedMutation(request,'retry',async(tx,auth)=>{
    await tx.$queryRaw`SELECT id FROM "EmailOutbox" WHERE id=${id}::uuid FOR UPDATE`;
    const row=await tx.emailOutbox.findUnique({where:{id}});if(!row)throw new HttpError(404,'NOT_FOUND');
    if(row.status!=='FAILED'||row.version!==version||row.manualRetries>=3)throw new HttpError(409,'EMAIL_RETRY_NOT_ALLOWED');
    if(!await emailEligible(tx,row))throw new HttpError(409,'RECIPIENT_NOT_ELIGIBLE');
    await tx.emailOutbox.update({where:{id,version},data:{status:'PENDING',attempts:0,manualRetries:{increment:1},version:{increment:1},nextAttemptAt:new Date(),claimToken:null,leaseUntil:null,lastError:null}});
    await audit(tx,auth.user.id,'EMAIL_RETRY_QUEUED','EMAIL',id,{manualAttempt:row.manualRetries+1});return {ok:true,code:'EMAIL_RETRY_QUEUED'};
  });
}
