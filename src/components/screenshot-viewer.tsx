"use client";
import Image from 'next/image';
import {useRef} from 'react';
import {Maximize2,X} from 'lucide-react';
import type {VisualImage} from '@/lib/visuals';
export function ScreenshotViewer({image,title,phone=false}:{image:VisualImage|undefined;title:string;phone?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 if(!image)return null;
 return <div className={`software-shot ${phone?'phone-shot':''}`}><button ref={trigger} className="shot-open" onClick={()=>ref.current?.showModal()} aria-label={'Phóng lớn '+title}><div className="shot-chrome" aria-hidden="true"><span/><span/><span/><b>QuánPilot</b><Maximize2 size={14}/></div><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={phone?'(max-width:700px) 75vw, 300px':'(max-width:700px) 90vw, 650px'} loading="lazy"/><span className="shot-label">{title} <Maximize2 size={14}/></span></button><p className="image-note">{image.caption}</p><dialog ref={ref} className="shot-dialog" aria-label={title} onClose={()=>trigger.current?.focus()} onClick={e=>{if(e.target===ref.current)ref.current.close();}}><button autoFocus className="shot-close" onClick={()=>ref.current?.close()} aria-label="Đóng ảnh"><X/></button><h2>{title}</h2><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="95vw"/><p>{image.caption}</p></dialog></div>;
}
