import type {Metadata} from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {publishedContent} from '@/server/public-content';
import {CmsStructured} from '@/components/cms-structured';
import {CmsBody} from '@/components/cms-body';
import {site} from '@/lib/site-config';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const row=await publishedContent('PRODUCT',(await params).slug);return row?{title:{absolute:`${row.seoTitle||row.title} | QAVIO`},description:row.seoDescription||row.summary,alternates:{canonical:new URL(`/products/${row.slug}`,site.url).href},robots:{index:site.indexingEnabled,follow:site.indexingEnabled},openGraph:{type:'website',title:row.seoTitle||row.title,description:row.seoDescription||row.summary,url:new URL(`/products/${row.slug}`,site.url).href,images:[new URL(row.featuredMediaId?`/media/${row.featuredMediaId}`:site.brandImage,site.url).href]}}:{title:'Không tìm thấy sản phẩm',robots:{index:false}};}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!/^[a-z0-9-]{1,120}$/.test(slug))notFound();const row=await publishedContent('PRODUCT',slug);if(!row)notFound();return <main id="main-content"><section className="page-hero"><div className="container"><Link href="/products" className="text-link">← Sản phẩm QAVIO</Link><h1>{row.title}</h1><p>{row.summary}</p></div></section><section className="section"><div className="container legal-document"><>{row.featuredMedia&&<Image src={`/media/${row.featuredMedia.id}`} width={row.featuredMedia.width} height={row.featuredMedia.height} alt={row.featuredMedia.label} unoptimized/>}</><CmsBody html={row.bodyHtml}/><CmsStructured kind={row.kind} data={row.data}/><Link href="/contact" className="button">Trao đổi về sản phẩm</Link></div></section></main>;}
