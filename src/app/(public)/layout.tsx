import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {JsonLd} from '@/lib/seo';
import {site} from '@/lib/site-config';
export default function PublicLayout({children}:{children:React.ReactNode}){return <><JsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:site.name,url:site.url,inLanguage:'vi-VN'}}/><SiteHeader/>{children}<SiteFooter/></>;}
