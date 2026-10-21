import Image from 'next/image';
import type {VisualImage} from '@/lib/visuals';
export function VisualFigure({image,priority=false,className=''}:{image:VisualImage|undefined;priority?:boolean;className?:string}){
 if(!image)return null;
 return <figure className={`visual-figure ${className}`}><div className="visual-photo"><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 700px) 94vw, (max-width: 1100px) 80vw, 640px" fetchPriority={priority?'high':undefined} loading={priority?'eager':'lazy'}/></div><figcaption>{image.origin==='AI'?'Illustration / ':image.origin==='SCREENSHOT'?'QuánPilot / ':''}{image.caption}</figcaption></figure>;
}
