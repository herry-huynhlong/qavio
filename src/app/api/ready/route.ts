import {readiness} from '@/server/operations';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(){const ready=await readiness();return Response.json({status:ready?'ready':'not_ready'},{status:ready?200:503,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});}
