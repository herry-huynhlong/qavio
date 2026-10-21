"use client";
import {useEffect,useId,useState} from 'react';
import Image from 'next/image';
import {Phone,X} from 'lucide-react';
import {availableChannels,type ContactChannels} from '@/lib/contact-settings';
import {ContactActions} from './contact-actions';
import {usePathname} from 'next/navigation';
export function FloatingContact({channels}:{channels:ContactChannels}){
  const [open,setOpen]=useState(false),[nearForm,setNearForm]=useState(false),id=useId(),pathname=usePathname();
  const {phone,zalo}=availableChannels(channels);
  useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);
  useEffect(()=>{
    // On small screens, leave forms and their actions entirely unobstructed.
    const mobile=window.matchMedia('(max-width:760px)'),visible=new Set<Element>();
    const update=()=>setNearForm(mobile.matches&&visible.size>0);
    const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);}update();});
    const targets=new Set<Element>(),watch=()=>{for(const e of targets)if(!e.isConnected){observer.unobserve(e);targets.delete(e);visible.delete(e);}document.querySelectorAll('main form, main .trial-identity, main .visual-cta').forEach(e=>{if(!targets.has(e)){targets.add(e);observer.observe(e);}});update();};
    const mutations=new MutationObserver(watch);mutations.observe(document.body,{childList:true,subtree:true});queueMicrotask(watch);mobile.addEventListener('change',update);
    return()=>{observer.disconnect();mutations.disconnect();mobile.removeEventListener('change',update);};
  },[pathname]);
  if(!channels.floatingEnabled||!phone&&!zalo)return null;
  return <aside className="floating-contact" hidden={nearForm} aria-label="Liên hệ nhanh QAVIO"><div id={id} className="floating-contact-panel" hidden={!open}><strong>Liên hệ QAVIO</strong><ContactActions channels={channels}/></div><button className="floating-contact-toggle" type="button" title={open?'Thu gọn liên hệ':zalo?'Liên hệ qua Zalo hoặc điện thoại':'Liên hệ qua điện thoại'} aria-label={open?'Thu gọn liên hệ nhanh':'Mở liên hệ nhanh QAVIO'} aria-controls={id} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X aria-hidden="true"/>:zalo?<><Image src="/brand/zalo-official.webp" width={34} height={34} alt="Zalo"/>{phone&&<Phone className="floating-contact-phone-badge" size={13} aria-hidden="true"/>}</>:<Phone aria-hidden="true"/>}<span className="sr-only">Liên hệ nhanh</span></button></aside>;
}
