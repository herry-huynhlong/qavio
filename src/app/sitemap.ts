import type { MetadataRoute } from 'next';
import { publicPages, site } from '@/lib/site-config';
import {connection} from 'next/server';
import {db} from '@/server/db';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  // Draft legal documents are deliberately excluded, even after public indexing is enabled.
  const pages:MetadataRoute.Sitemap=Object.keys(publicPages).filter(path => path !== '/privacy' && path !== '/terms').map(path => ({ url: new URL(path, site.url).href }));
  if(process.env.QAVIO_CMS_ENABLED==='true'){
    try{const rows=await db().contentEntry.findMany({where:{kind:{in:['POST','PRODUCT']},status:'PUBLISHED',publishedAt:{lte:new Date()}},select:{kind:true,slug:true,updatedAt:true},orderBy:{id:'asc'},take:40000});for(const row of rows){const url=new URL(`/${row.kind==='POST'?'news':'products'}/${row.slug}`,site.url).href;if(!pages.some(page=>page.url===url))pages.push({url,lastModified:row.updatedAt});}}catch{console.error(JSON.stringify({event:'qavio_sitemap_cms_unavailable'}));}
  }
  return pages;
}
