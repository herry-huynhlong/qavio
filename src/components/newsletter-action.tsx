"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
export function NewsletterAction(){
  const token=useRef(''),busy=useRef(false);
  const [state,setState]=useState('idle'),[message,setMessage]=useState('Chỉ tiếp tục khi bạn chủ động muốn thực hiện thao tác này.');
  useEffect(()=>{const fragment=new URLSearchParams(window.location.hash.slice(1));token.current=fragment.get('token')||'';window.history.replaceState(null,'',window.location.pathname);},[]);
  async function execute(){
    if(busy.current)return;busy.current=true;setState('submitting');
    try{
      if(!/^[a-f0-9]{64}$/.test(token.current)){setState('error');setMessage('Liên kết không hợp lệ. Hãy mở lại liên kết từ email.');return;}
      const result=await fetch('/api/newsletter/unsubscribe',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:token.current})});
      const body=await result.json();
      if(result.ok&&body.ok){setState('success');setMessage('Đã hủy đăng ký nhận tin. Bạn sẽ không nhận thêm email marketing.');token.current='';}
      else{setState('error');setMessage(result.status===429?'Bạn đã thử nhiều lần. Vui lòng thử lại sau.':result.status===503?'Tính năng hiện chưa mở hoặc tạm thời không khả dụng. Vui lòng thử lại sau.':'Liên kết không hợp lệ, đã dùng hoặc đã hết hạn. Vui lòng liên hệ QAVIO nếu cần hỗ trợ thông tin đã lưu.');}
    }catch{setState('error');setMessage('Kết nối gián đoạn. Vui lòng thử lại; nếu thao tác đã được ghi nhận, liên kết có thể không dùng lại được.');}
    finally{busy.current=false;}
  }
  return <div className="form-card"><h2>Hủy đăng ký nhận tin</h2><p className="form-status" role="status" aria-live="polite">{message}</p><div className="form-actions"><button className="button" disabled={state==='submitting'||state==='success'} onClick={()=>void execute()}>{state==='submitting'?'Đang xử lý…':'Hủy nhận tin'}</button><Link className="text-link" href="/contact">Liên hệ QAVIO</Link></div></div>;
}
