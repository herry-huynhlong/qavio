import {ContentKind,ContentStatus,Prisma} from '@prisma/client';
import {db} from '../db';
import {HttpError} from '../http';
import {authenticatedMutation} from './auth';
import {allowed} from './permissions';
import {audit} from './audit';
import {categorySchema,cleanData,cleanHtml,contentSchema,parsed,query} from './validation';
export const sensitiveKinds=['CONTACT','PRIVACY','TERMS'];
export async function listContent(request:Request,role:string){
  const {page,size,skip,q,params}=query(request),kind=params.get('kind'),status=params.get('status');
  if(kind&&!Object.values(ContentKind).includes(kind as ContentKind)||status&&!Object.values(ContentStatus).includes(status as ContentStatus))throw new HttpError(422,'FILTER_INVALID');
  if(kind&&sensitiveKinds.includes(kind)&&role!=='SUPER_ADMIN')throw new HttpError(403,'PERMISSION_DENIED');
  const where:Prisma.ContentEntryWhereInput={kind:kind as ContentKind||{notIn:role==='SUPER_ADMIN'?[]:sensitiveKinds as ContentKind[]},status:status as ContentStatus||undefined,...(q?{title:{contains:q,mode:'insensitive'}}:{})};
  const [total,rows]=await db().$transaction([db().contentEntry.count({where}),db().contentEntry.findMany({where,skip,take:size,orderBy:[{updatedAt:'desc'},{id:'desc'}],select:{id:true,kind:true,slug:true,title:true,status:true,version:true,publishedAt:true,updatedAt:true,category:{select:{name:true}}}})]);
  return {rows,total,page,size};
}
export async function contentDetail(id:string,role:string){
  const entry=await db().contentEntry.findUnique({where:{id},include:{revisions:{orderBy:{version:'desc'},take:20},featuredMedia:{select:{id:true,label:true,width:true,height:true}}}});
  if(!entry)throw new HttpError(404,'NOT_FOUND');if(sensitiveKinds.includes(entry.kind)&&role!=='SUPER_ADMIN')throw new HttpError(403,'PERMISSION_DENIED');return entry;
}
export async function saveContent(request:Request,id:string|null,input:unknown){
  const value=parsed(contentSchema,input),bodyHtml=cleanHtml(value.bodyHtml),data=cleanData(value.kind,value.data);
  return authenticatedMutation(request,'content',async(tx,auth)=>{
    const old=id?await tx.contentEntry.findUnique({where:{id}}):null;
    if(id&&!old)throw new HttpError(404,'NOT_FOUND');
    if(old&&(old.version!==value.version||old.kind!==value.kind))throw new HttpError(409,'VERSION_CONFLICT');
    if(sensitiveKinds.includes(value.kind)&&!allowed(auth.user.role,'settings'))throw new HttpError(403,'PERMISSION_DENIED');
    if((value.status==='PUBLISHED'||old?.status==='PUBLISHED')&&!allowed(auth.user.role,'publish'))throw new HttpError(403,'PUBLISH_PERMISSION_REQUIRED');
    if(['PRIVACY','TERMS'].includes(value.kind)&&value.status==='PUBLISHED'&&process.env.QAVIO_LEGAL_PUBLICATION_APPROVED!=='true')throw new HttpError(409,'LEGAL_REVIEW_REQUIRED');
    if(value.status==='PUBLISHED'&&(!bodyHtml.trim()&&!Object.keys(data).length||!value.summary.trim()))throw new HttpError(422,'PUBLISH_CONTENT_REQUIRED');
    if(value.categoryId&&!await tx.category.findUnique({where:{id:value.categoryId}}))throw new HttpError(422,'CATEGORY_INVALID');
    if(value.featuredMediaId&&!await tx.mediaAsset.findUnique({where:{id:value.featuredMediaId}}))throw new HttpError(422,'MEDIA_INVALID');
    const fields={kind:value.kind,slug:value.slug,title:value.title,summary:value.summary,bodyHtml,data:data as Prisma.InputJsonValue,status:value.status,seoTitle:value.seoTitle||null,seoDescription:value.seoDescription||null,categoryId:value.categoryId||null,featuredMediaId:value.featuredMediaId||null,publishedAt:value.status==='PUBLISHED'?(old?.publishedAt||new Date()):null};
    const row=old?await tx.contentEntry.update({where:{id:old.id,version:value.version},data:{...fields,version:{increment:1}}}):await tx.contentEntry.create({data:{...fields,authorId:auth.user.id}});
    await tx.contentRevision.create({data:{entryId:row.id,version:row.version,actorId:auth.user.id,snapshot:JSON.parse(JSON.stringify(row))}});
    await audit(tx,auth.user.id,old?'CONTENT_UPDATED':'CONTENT_CREATED','CONTENT',row.id,{kind:row.kind,status:row.status,version:row.version});return row;
  });
}
export async function listCategories(request:Request){
  const {page,size,skip,q}=query(request),where=q?{name:{contains:q,mode:'insensitive' as const}}:{};
  const [total,rows]=await db().$transaction([db().category.count({where}),db().category.findMany({where,skip,take:size,orderBy:[{name:'asc'},{id:'asc'}],include:{_count:{select:{entries:true}}}})]);return {rows,total,page,size};
}
export async function saveCategory(request:Request,id:string|null,input:unknown){
  const value=parsed(categorySchema,input);
  return authenticatedMutation(request,'content',async(tx,auth)=>{
    if(id){const old=await tx.category.findUnique({where:{id}});if(!old)throw new HttpError(404,'NOT_FOUND');if(old.version!==value.version)throw new HttpError(409,'VERSION_CONFLICT');}
    const fields={name:value.name,slug:value.slug};
    const row=id?await tx.category.update({where:{id,version:value.version},data:{...fields,version:{increment:1}}}):await tx.category.create({data:fields});
    await audit(tx,auth.user.id,id?'CATEGORY_UPDATED':'CATEGORY_CREATED','CATEGORY',row.id,{version:row.version});return row;
  });
}
