import {z} from 'zod';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {db} from '../db';
import {HttpError} from '../http';
import {authenticatedMutation} from './auth';
import {allowed} from './permissions';
import {audit} from './audit';
import {parsed,uuid} from './validation';
import {visualSlots,defaultVisuals,type VisualSlot} from '@/lib/visuals';
import {sameVisualEntry} from '@/lib/visual-editor-state';
import {canonicalImage,stageMediaImage,commitStagedMedia,discardStagedMedia} from './media';
const slot=z.string().refine(s=>visualSlots.some(v=>v[0]===s));
const schema=z.discriminatedUnion('action',[
  z.object({action:z.literal('draft'),slot,mediaId:uuid.optional(),useDefault:z.literal(true).optional(),alt:z.string().trim().min(5).max(200),caption:z.string().trim().min(5).max(1000),origin:z.enum(['AI','SCREENSHOT','PHOTO']),version:z.number().int().nonnegative()}).strict(),
  z.object({action:z.literal('publish'),slot,version:z.number().int().positive(),liveVersion:z.number().int().nonnegative()}).strict(),
]);
export async function readVisuals(){
  const entries=await db().contentEntry.findMany({where:{kind:'COMPANY',slug:{in:visualSlots.flatMap(s=>['visual-'+s[0],'visual-'+s[0]+'-draft'])}},select:{id:true,slug:true,title:true,summary:true,data:true,featuredMediaId:true,version:true,featuredMedia:{select:{id:true,width:true,height:true,label:true}}}});
  return {slots:visualSlots.map(([key])=>({key,live:entries.find(r=>r.slug==='visual-'+key)||null,draft:entries.find(r=>r.slug==='visual-'+key+'-draft')||null}))};
}
export async function saveVisual(request:Request,input:unknown){
  const value=parsed(schema,input);
  if(value.action==='draft'&&Boolean(value.mediaId)===Boolean(value.useDefault))throw new HttpError(422,'MEDIA_INVALID');
  let staged:Awaited<ReturnType<typeof stageMediaImage>>|undefined;
  try{return await authenticatedMutation(request,'content',async(tx,auth)=>{
    // Separate existing CMS entries preserve the live image while a replacement is drafted.
    const draftSlug='visual-'+value.slot+'-draft',draft=await tx.contentEntry.findUnique({where:{kind_slug:{kind:'COMPANY',slug:draftSlug}}});
    if((draft?.version||0)!==value.version)throw new HttpError(409,'VERSION_CONFLICT');
    let row;
    if(value.action==='draft'){
      if(value.slot.endsWith('-screen')&&value.origin!=='SCREENSHOT')throw new HttpError(422,'VISUAL_SCREENSHOT_REQUIRED');
      let mediaId=value.mediaId;
      if(value.useDefault){
        // Only a code-defined default asset is accepted, never a user file path/URL.
        const fallback=defaultVisuals()[value.slot as VisualSlot];if(!fallback?.src.startsWith('/images/qavio/'))throw new HttpError(422,'MEDIA_INVALID');
        const bytes=await readFile(path.join(process.cwd(),'public',fallback.src.slice(1)));
        staged=await stageMediaImage(await canonicalImage(bytes,'image/webp'));
        mediaId=(await commitStagedMedia(tx,auth.user.id,staged,'Ảnh mặc định — '+value.slot)).id;
      }
      if(!mediaId||!await tx.mediaAsset.findUnique({where:{id:mediaId}}))throw new HttpError(422,'MEDIA_INVALID');
      const fields={title:value.alt,summary:value.caption,featuredMediaId:mediaId,data:{origin:value.origin},bodyHtml:'',status:'DRAFT' as const,publishedAt:null};
      row=draft?await tx.contentEntry.update({where:{id:draft.id,version:value.version},data:{...fields,version:{increment:1}}}):await tx.contentEntry.create({data:{...fields,kind:'COMPANY',slug:draftSlug,authorId:auth.user.id}});
    }else{
      if(!allowed(auth.user.role,'publish'))throw new HttpError(403,'PUBLISH_PERMISSION_REQUIRED');
      if(!draft?.featuredMediaId)throw new HttpError(422,'MEDIA_INVALID');
      const slug='visual-'+value.slot,live=await tx.contentEntry.findUnique({where:{kind_slug:{kind:'COMPANY',slug}}});
      if((live?.version||0)!==value.liveVersion)throw new HttpError(409,'VERSION_CONFLICT');
      if(sameVisualEntry(draft as Parameters<typeof sameVisualEntry>[0],live as Parameters<typeof sameVisualEntry>[1]))throw new HttpError(409,'VISUAL_ALREADY_PUBLISHED');
      const fields={title:draft.title,summary:draft.summary,data:{origin:String((draft.data as {origin?:string}).origin||'AI')},featuredMediaId:draft.featuredMediaId,bodyHtml:'',status:'PUBLISHED' as const,publishedAt:new Date()};
      row=live?await tx.contentEntry.update({where:{id:live.id,version:value.liveVersion},data:{...fields,version:{increment:1}}}):await tx.contentEntry.create({data:{...fields,kind:'COMPANY',slug,authorId:auth.user.id}});
    }
    await tx.contentRevision.create({data:{entryId:row.id,version:row.version,actorId:auth.user.id,snapshot:JSON.parse(JSON.stringify(row))}});
    await audit(tx,auth.user.id,value.action==='draft'?'VISUAL_DRAFT_SAVED':'VISUAL_PUBLISHED','CONTENT',row.id,{slot:value.slot,version:row.version,mediaId:row.featuredMediaId});return {ok:true,entry:{version:row.version,title:row.title,summary:row.summary,featuredMediaId:row.featuredMediaId,data:row.data}};
  });}catch(error){if(staged)await discardStagedMedia(staged);throw error;}
}
