import Image from 'next/image';
import {Phone} from 'lucide-react';
import {availableChannels,type ContactChannels} from '@/lib/contact-settings';
export function ContactActions({channels}:{channels:ContactChannels}){
  const {phone,zalo}=availableChannels(channels);
  if(!phone&&!zalo)return null;
  return <div className="contact-actions">{phone&&<a className="button" href={`tel:${phone}`} aria-label={`Gọi QAVIO ${channels.phoneDisplay||channels.phone}`}><Phone size={19} aria-hidden="true"/> Gọi điện <span>{channels.phoneDisplay||channels.phone}</span></a>}{zalo&&<a className="button secondary" href={zalo} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo QAVIO (mở tab mới)"><Image src="/brand/zalo-official.webp" alt="" width={28} height={28}/> Chat Zalo</a>}</div>;
}
