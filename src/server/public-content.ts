import {retiredNewsletterHref} from '@/lib/retired-newsletter';
import {cache} from 'react';
import {connection} from 'next/server';
import type {ContentKind} from '@prisma/client';
import {db} from './db';
import {cleanHtml} from './admin/validation';
export const publishedContent=cache(async(kind:ContentKind,slug:string)=>{
  // Evaluate feature flags per request, including when Docker builds without env files.
  await connection();
  if(process.env.QAVIO_CMS_ENABLED!=='true')return null;
  if(['PRIVACY','TERMS'].includes(kind)&&process.env.QAVIO_LEGAL_PUBLICATION_APPROVED!=='true')return null;
  try{const row=await db().contentEntry.findFirst({where:{kind,slug,status:'PUBLISHED',publishedAt:{lte:new Date()}},include:{featuredMedia:{select:{id:true,width:true,height:true,label:true}},category:{select:{name:true,slug:true}}}});if(row?.kind==='CTA'&&retiredNewsletterHref((row.data as {href?:string})?.href))return null;return row?{...row,bodyHtml:cleanHtml(row.bodyHtml)}:null;}
  catch{console.error(JSON.stringify({event:'qavio_public_cms_unavailable'}));return null;}
});
export async function publishedList(kind:'POST'|'PRODUCT',page=1){
  await connection();
  if(process.env.QAVIO_CMS_ENABLED!=='true')return {rows:[],total:0,page};
  try{const where={kind,status:'PUBLISHED' as const,publishedAt:{lte:new Date()}};const [total,rows]=await db().$transaction([db().contentEntry.count({where}),db().contentEntry.findMany({where,skip:(page-1)*12,take:12,orderBy:[{publishedAt:'desc'},{id:'desc'}],select:{id:true,slug:true,title:true,summary:true,publishedAt:true,featuredMediaId:true,category:{select:{name:true}}}})]);return {rows,total,page};}
  catch{console.error(JSON.stringify({event:'qavio_public_cms_unavailable'}));return {rows:[],total:0,page};}
}
