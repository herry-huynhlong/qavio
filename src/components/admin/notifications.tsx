"use client";
import Link from 'next/link';
import {Bell} from 'lucide-react';
import {useEffect,useId,useRef,useState} from 'react';
import {visiblePoll,browserVisibility} from '@/lib/visible-poll';
import {useAdmin,dateText,leadSourceLabel} from './shell';
type Snapshot={total:number;rows:{id:string;fullName:string;phone:string;message:string;inquiryType:string;sourcePage:string;createdAt:string}[]};
export function AdminNotifications(){
  const {api}=useAdmin(),id=useId(),root=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null);
  const [data,setData]=useState<Snapshot|null>(null),[error,setError]=useState(false),[open,setOpen]=useState(false);
  useEffect(()=>{
    const polling=visiblePoll(async signal=>{
      try{const next=await api<Snapshot>('leads/notifications',{signal});if(!signal.aborted){setData(next);setError(false);}}
      catch(e){if(signal.aborted)return;setError(true);if([401,403].includes((e as {status?:number}).status||0)){setData(null);setOpen(false);return false;}}
    },browserVisibility);
    function visibility(){if(document.hidden)setOpen(false);}
    document.addEventListener('visibilitychange',visibility);window.addEventListener('qavio-leads-changed',polling.refresh);
    return()=>{polling.dispose();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('qavio-leads-changed',polling.refresh);};
  },[api]);
  useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);}function escape(e:KeyboardEvent){if(e.key==='Escape'){setOpen(false);button.current?.focus();}}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
  return <div className="admin-notifications" ref={root}><button ref={button} type="button" className="admin-icon-button admin-bell" aria-label={error?'Thông báo khách hàng: chưa cập nhật được':data?`Thông báo khách hàng: ${data.total} yêu cầu mới`:'Thông báo khách hàng: đang tải'} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}><Bell size={20} aria-hidden="true"/>{data&&data.total>0&&<span className="admin-bell-count" aria-hidden="true">{data.total>99?'99+':data.total}</span>}</button><section id={id} hidden={!open} className="admin-notification-panel" aria-label="Yêu cầu khách hàng mới"><h2>Yêu cầu khách hàng mới</h2><p className="admin-help" role="status">{error?'Chưa cập nhật được thông báo. Số liệu trước đó có thể đã thay đổi.':data?`${data.total} yêu cầu chưa xử lý`:'Đang tải thông báo…'}</p>{data?.rows.length?<ul>{data.rows.map(row=><li key={row.id}><Link prefetch={false} href={`/admin/leads/${row.id}`} onClick={()=>setOpen(false)}><strong>{row.fullName}</strong><span>{row.phone} · {leadSourceLabel(row.inquiryType)}</span><time dateTime={row.createdAt}>{dateText(row.createdAt)}</time><p>{row.message||'Không có lời nhắn.'}</p></Link></li>)}</ul>:data&&!error?<p>Không có yêu cầu mới.</p>:null}<Link className="admin-text-button" href="/admin/leads?status=NEW" onClick={()=>setOpen(false)}>Xem tất cả yêu cầu mới →</Link></section></div>;
}
