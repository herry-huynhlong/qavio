import {serveMedia} from '@/server/admin/media';
import {failure} from '@/server/http';
import {parsed,uuid} from '@/server/admin/validation';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{return await serveMedia(request,parsed(uuid,(await params).id));}catch(error){return failure(error);}}
