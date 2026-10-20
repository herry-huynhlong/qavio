import type {ContentKind} from '@prisma/client';
import {pageMetadata} from '@/lib/seo';
import {type PublicPath} from '@/lib/site-config';
import {publishedContent} from './public-content';
export async function cmsMetadata(path:PublicPath,kind:ContentKind,slug:string){const fallback=pageMetadata(path),entry=await publishedContent(kind,slug);if(!entry)return fallback;const title=entry.seoTitle||entry.title,description=entry.seoDescription||entry.summary;return {...fallback,title:{absolute:`${title} | QAVIO`},description,openGraph:{...fallback.openGraph,title,description}};}
