import {FloatingContact} from '@/components/floating-contact';
import {publishedContent} from '@/server/public-content';
import {contactChannels} from '@/lib/contact-settings';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {JsonLd} from '@/lib/seo';
import {site} from '@/lib/site-config';
export default async function PublicLayout({children}:{children:React.ReactNode}){const channels=contactChannels((await publishedContent('CONTACT','company'))?.data);return <><JsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:site.name,url:site.url,inLanguage:'vi-VN'}}/><SiteHeader quanpilotLoginUrl={site.quanpilotLoginUrl}/>{children}<SiteFooter/><FloatingContact channels={channels}/></>;}
