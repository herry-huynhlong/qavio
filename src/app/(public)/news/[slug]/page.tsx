import type {Metadata} from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {publishedContent} from '@/server/public-content';
import {CmsBody} from '@/components/cms-body';
import {site} from '@/lib/site-config';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,row=await publishedContent('POST',slug);if(!row)return {title:'Không tìm thấy bài viết',robots:{index:false}};return {title:{absolute:`${row.seoTitle||row.title} | QAVIO`},description:row.seoDescription||row.summary,alternates:{canonical:new URL(`/news/${row.slug}`,site.url).href},robots:{index:site.indexingEnabled,follow:site.indexingEnabled},openGraph:{type:'article',title:row.title,description:row.summary,url:new URL(`/news/${row.slug}`,site.url).href,images:row.featuredMediaId?[new URL(`/media/${row.featuredMediaId}`,site.url).href]:[new URL(site.brandImage,site.url).href]}};}
export default async function PostPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!/^[a-z0-9-]{1,120}$/.test(slug))notFound();const row=await publishedContent('POST',slug);if(!row)notFound();return <main id="main-content"><section className="page-hero"><div className="container"><Link href="/news" className="text-link">← Tin tức QAVIO</Link><h1>{row.title}</h1><p>{row.summary}</p>{row.category&&<p>{row.category.name}</p>}</div></section><article className="container section legal-document">{row.featuredMedia&&<Image src={`/media/${row.featuredMedia.id}`} width={row.featuredMedia.width} height={row.featuredMedia.height} alt={row.featuredMedia.label} unoptimized/>}<CmsBody html={row.bodyHtml}/></article></main>;}
