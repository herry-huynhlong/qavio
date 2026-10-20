"use client";
import {useEffect,useId,useState} from 'react';
import {MessageCircle,X} from 'lucide-react';
import {availableChannels,type ContactChannels} from '@/lib/contact-settings';
import {ContactActions} from './contact-actions';
export function FloatingContact({channels}:{channels:ContactChannels}){
  const [open,setOpen]=useState(false),id=useId();
  const {phone,zalo}=availableChannels(channels);
  useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);
  if(!channels.floatingEnabled||!phone&&!zalo)return null;
  return <aside className="floating-contact" aria-label="Liên hệ nhanh QAVIO"><div id={id} className="floating-contact-panel" hidden={!open}><strong>Liên hệ QAVIO</strong><ContactActions channels={channels}/></div><button className="floating-contact-toggle" type="button" aria-label={open?'Thu gọn liên hệ nhanh':'Mở liên hệ nhanh QAVIO'} aria-controls={id} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X aria-hidden="true"/>:<MessageCircle aria-hidden="true"/>}<span className="sr-only">Liên hệ nhanh</span></button></aside>;
}
