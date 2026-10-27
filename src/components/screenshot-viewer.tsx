"use client";
import Image from 'next/image';
import {useRef,useState} from 'react';
import {Maximize2,X,ZoomIn,ZoomOut,ArrowLeft,ArrowRight} from 'lucide-react';
import type {VisualImage} from '@/lib/visuals';

export function ScreenshotViewer({image,title,phone=false,onPrevious,onNext}:{image:VisualImage|undefined;title:string;phone?:boolean;onPrevious?:()=>void;onNext?:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const [zoomed,setZoomed]=useState(false);
 if(!image)return null;
 return <div className={`software-shot ${phone?'phone-shot':''}`}>
  <button ref={trigger} type="button" className="shot-open" onClick={()=>ref.current?.showModal()} aria-label={'Phóng lớn '+title}>
   <div className="shot-chrome" aria-hidden="true"><span/><span/><span/><b>QuánPilot</b><Maximize2 size={14}/></div>
   <Image unoptimized={image.origin==='SCREENSHOT'} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={phone?'(max-width:700px) 75vw, 300px':'(max-width:700px) 90vw, 1200px'} loading="lazy"/>
   <span className="shot-label">{title} <Maximize2 size={14}/></span>
  </button>
  <p className="image-note">{image.caption}</p>
  <dialog ref={ref} className="shot-dialog" aria-label={title} onKeyDown={event=>{if(zoomed&&(event.target as Element).closest('.shot-image-scroll'))return;if(event.key==='ArrowRight'&&onNext){event.preventDefault();onNext();}if(event.key==='ArrowLeft'&&onPrevious){event.preventDefault();onPrevious();}}} onClose={()=>{setZoomed(false);trigger.current?.focus();}} onClick={e=>{if(e.target===ref.current)ref.current.close();}}>
   <div className="shot-dialog-toolbar"><h2>{title}</h2>{onPrevious&&<button type="button" className="shot-zoom" onClick={onPrevious} aria-label="Ảnh trước"><ArrowLeft size={18}/></button>}{onNext&&<button type="button" className="shot-zoom" onClick={onNext} aria-label="Ảnh tiếp theo"><ArrowRight size={18}/></button>}<button type="button" className="shot-zoom" aria-label={zoomed?'Vừa khung':'Kích thước gốc'} aria-pressed={zoomed} onClick={()=>setZoomed(!zoomed)}>{zoomed?<ZoomOut size={18}/>:<ZoomIn size={18}/>}<span>{zoomed?'Vừa khung':'Kích thước gốc'}</span></button><button type="button" autoFocus className="shot-close" onClick={()=>ref.current?.close()} aria-label="Đóng ảnh"><X/></button></div>
   <div className={`shot-image-scroll ${zoomed?'shot-image-zoomed':''}`} tabIndex={0} role="region" aria-label="Ảnh giao diện, có thể cuộn để xem" style={zoomed?{'--shot-width':image.width+'px'} as React.CSSProperties:undefined}>
    <Image unoptimized={image.origin==='SCREENSHOT'} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={zoomed?image.width+'px':'95vw'}/>
   </div><p>{image.caption}</p>
  </dialog>
 </div>;
}
