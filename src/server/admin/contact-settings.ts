import {z} from 'zod';
import {db} from '../db';
import {lock} from '../repository';
import {HttpError} from '../http';
import {authenticatedMutation} from './auth';
import {audit} from './audit';
import {parsed} from './validation';
import {contactChannels,contactChannelsSchema} from '@/lib/contact-settings';

const editable=contactChannelsSchema.pick({phone:true,phoneDisplay:true,zaloUrl:true,callEnabled:true,zaloEnabled:true,floatingEnabled:true});
const schema=z.object({version:z.number().int().positive().nullable(),data:editable}).strict();
export async function readContactSettings(){
  const row=await db().contentEntry.findUnique({where:{kind_slug:{kind:'CONTACT',slug:'company'}}});
  return {version:row?.version??null,data:contactChannels(row?.data),published:row?.status==='PUBLISHED',cmsEnabled:process.env.QAVIO_CMS_ENABLED==='true'};
}
export async function saveContactSettings(request:Request,input:unknown){
  const value=parsed(schema,input);
  return authenticatedMutation(request,'settings',async(tx,auth)=>{
    await lock(tx,'contact-settings:company');
    const old=await tx.contentEntry.findUnique({where:{kind_slug:{kind:'CONTACT',slug:'company'}}});
    if((old?.version??null)!==value.version)throw new HttpError(409,'VERSION_CONFLICT');
    // Only already-public legacy fields may survive this channel-only publication.
    // Preserve a draft snapshot without exposing unrelated draft text or QA data.
    if(old&&old.status!=='PUBLISHED')await tx.contentRevision.upsert({where:{entryId_version:{entryId:old.id,version:old.version}},create:{entryId:old.id,version:old.version,actorId:auth.user.id,snapshot:JSON.parse(JSON.stringify(old))},update:{}});
    const data={...(old?.status==='PUBLISHED'?contactChannels(old.data):{}),...value.data};
    const wasPublic=old?.status==='PUBLISHED';
    const fields={title:wasPublic?old.title:'Thông tin liên hệ QAVIO',summary:wasPublic?old.summary:'Các kênh liên hệ được QAVIO cấu hình.',bodyHtml:wasPublic?old.bodyHtml:'',seoTitle:wasPublic?old.seoTitle:null,seoDescription:wasPublic?old.seoDescription:null,featuredMediaId:wasPublic?old.featuredMediaId:null,categoryId:wasPublic?old.categoryId:null,data,status:'PUBLISHED' as const,publishedAt:wasPublic?old.publishedAt:new Date()};
    const row=old?await tx.contentEntry.update({where:{id:old.id,version:old.version},data:{...fields,version:{increment:1}}}):await tx.contentEntry.create({data:{...fields,kind:'CONTACT',slug:'company',authorId:auth.user.id}});
    await tx.contentRevision.create({data:{entryId:row.id,version:row.version,actorId:auth.user.id,snapshot:JSON.parse(JSON.stringify(row))}});
    await audit(tx,auth.user.id,'CONTACT_CHANNELS_UPDATED','CONTENT',row.id,{version:row.version,status:row.status,callEnabled:!!data.callEnabled,zaloEnabled:!!data.zaloEnabled,floatingEnabled:!!data.floatingEnabled});
    return {version:row.version,data:contactChannels(row.data),published:true,cmsEnabled:process.env.QAVIO_CMS_ENABLED==='true'};
  });
}
