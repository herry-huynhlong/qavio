import {cache} from 'react';
import {connection} from 'next/server';
import {db} from './db';
import {defaultVisuals,type VisualImages,type VisualSlot,visualSlots} from '@/lib/visuals';
export const publishedVisuals=cache(async():Promise<VisualImages>=>{
  await connection();const result=defaultVisuals();if(process.env.QAVIO_CMS_ENABLED!=='true')return result;
  try{const rows=await db().contentEntry.findMany({where:{kind:'COMPANY',slug:{in:visualSlots.map(s=>'visual-'+s[0])},status:'PUBLISHED',publishedAt:{lte:new Date()}},include:{featuredMedia:{select:{id:true,width:true,height:true}}}});
    for(const row of rows){const media=row.featuredMedia;if(!media)continue;const key=row.slug.slice(7) as VisualSlot,origin=(row.data as {origin?:string}).origin;
      result[key]={src:'/media/'+media.id,width:media.width,height:media.height,alt:row.title,caption:row.summary,origin:origin==='SCREENSHOT'?'SCREENSHOT':origin==='PHOTO'?'PHOTO':'AI'};}
  }catch{console.error(JSON.stringify({event:'qavio_visuals_unavailable'}));}return result;
});
