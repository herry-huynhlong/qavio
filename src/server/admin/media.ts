import {randomUUID} from 'node:crypto';
import {mkdir,readFile,statfs,unlink,writeFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {db} from '../db';
import {HttpError} from '../http';
import {authenticatedMutation,authenticate,mutationOrigin} from './auth';
import {equalSecret} from '../crypto';
import {audit} from './audit';
import {query} from './validation';
const MAX=5*1024*1024;
let processingImage=false;
// Media lives in runtime storage, never in the build artifact or public directory.
function root(){if(['production','staging'].includes(process.env.QAVIO_DEPLOYMENT_ENV||'')&&!process.env.QAVIO_MEDIA_ROOT)throw new HttpError(503,'MEDIA_STORAGE_NOT_CONFIGURED');return path.resolve(/* turbopackIgnore: true */ process.env.QAVIO_MEDIA_ROOT||'.runtime/media');}
function filePath(key:string){if(!/^[a-f0-9-]{36}\.webp$/.test(key))throw new HttpError(404,'NOT_FOUND');return path.join(/* turbopackIgnore: true */ root(),key);}
export async function canonicalImage(bytes:Buffer,mime:string){
  if(!bytes.length||bytes.length>MAX)throw new HttpError(413,'UPLOAD_TOO_LARGE');
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!({ 'image/png':png,'image/jpeg':jpeg,'image/webp':webp }[mime]))throw new HttpError(422,'IMAGE_FORMAT_INVALID');
  if(processingImage)throw new HttpError(429,'IMAGE_BUSY',3);
  processingImage=true;
  try{
    const image=sharp(bytes,{limitInputPixels:16000000,animated:false,failOn:'warning'}),metadata=await image.metadata();
    if(!metadata.width||!metadata.height||metadata.width>4096||metadata.height>4096||(metadata.pages||1)>1)throw Error();
    return await image.rotate().resize({width:2048,height:2048,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
  }catch{throw new HttpError(422,'IMAGE_INVALID');}finally{processingImage=false;}
}
export async function uploadMedia(request:Request){
  mutationOrigin(request);const auth=await authenticate(request,'content');
  if(!equalSecret(request.headers.get('x-csrf-token')||'',auth.csrf))throw new HttpError(403,'CSRF_REJECTED');
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data;'))throw new HttpError(415,'MULTIPART_REQUIRED');
  if(Number(request.headers.get('content-length')||0)>MAX+16384)throw new HttpError(413,'UPLOAD_TOO_LARGE');
  const chunks:Uint8Array[]=[];let size=0;const reader=request.body?.getReader();if(!reader)throw new HttpError(422,'UPLOAD_REQUIRED');
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX+16384){await reader.cancel();throw new HttpError(413,'UPLOAD_TOO_LARGE');}chunks.push(value);}
  let form:FormData;try{form=await new Response(Buffer.concat(chunks),{headers:{'content-type':request.headers.get('content-type')!}}).formData();}catch{throw new HttpError(422,'UPLOAD_INVALID');}
  if([...form.keys()].some(k=>k!=='file')||form.getAll('file').length!==1)throw new HttpError(422,'UPLOAD_INVALID');
  const file=form.get('file');if(!(file instanceof File))throw new HttpError(422,'UPLOAD_REQUIRED');
  const transformed=await canonicalImage(Buffer.from(await file.arrayBuffer()),file.type),id=randomUUID(),key=`${id}.webp`;
  await mkdir(root(),{recursive:true,mode:0o700});const disk=await statfs(/* turbopackIgnore: true */ root());if(Number(disk.bavail)*Number(disk.bsize)<64*1024*1024+transformed.data.length)throw new HttpError(507,'MEDIA_DISK_LOW');await writeFile(filePath(key),transformed.data,{flag:'wx',mode:0o600});
  try{return await authenticatedMutation(request,'content',async(tx,current)=>{
    const quota=Number(process.env.QAVIO_MEDIA_MAX_BYTES||1073741824);if(!Number.isSafeInteger(quota)||quota<5*1024*1024)throw new HttpError(503,'MEDIA_QUOTA_INVALID');const usage=await tx.mediaAsset.aggregate({_sum:{byteSize:true}});if((usage._sum.byteSize||0)+transformed.data.length>quota)throw new HttpError(507,'MEDIA_QUOTA_EXCEEDED');
    const row=await tx.mediaAsset.create({data:{id,storageKey:key,mimeType:'image/webp',width:transformed.info.width,height:transformed.info.height,byteSize:transformed.data.length,label:file.name.replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,120)||'Ảnh nội dung',createdById:current.user.id}});
    await audit(tx,current.user.id,'MEDIA_UPLOADED','MEDIA',id,{width:row.width,height:row.height,byteSize:row.byteSize});return {id:row.id,url:`/media/${row.id}`,label:row.label,width:row.width,height:row.height};
  });}catch(error){await unlink(filePath(key));throw error;}
}
export async function listMedia(request:Request){const {page,size,skip}=query(request);const [total,rows]=await db().$transaction([db().mediaAsset.count(),db().mediaAsset.findMany({skip,take:size,orderBy:{createdAt:'desc'},select:{id:true,label:true,width:true,height:true,byteSize:true,createdAt:true}})]);return {rows:rows.map(r=>({...r,url:`/media/${r.id}`})),total,page,size};}
export async function serveMedia(request:Request,id:string){
  const media=await db().mediaAsset.findUnique({where:{id},include:{_count:{select:{entries:{where:{status:'PUBLISHED'}}}}}});if(!media)throw new HttpError(404,'NOT_FOUND');
  if(!media._count.entries)await authenticate(request,'content');
  return new Response(await readFile(/* turbopackIgnore: true */ filePath(media.storageKey)),{headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':media._count.entries?'public, max-age=3600':'private, no-store'}});
}
