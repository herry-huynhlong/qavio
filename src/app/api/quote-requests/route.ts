import { publicPost } from '@/server/public-api';
export const runtime='nodejs';
export function POST(request:Request){return publicPost(request,'quote');}
