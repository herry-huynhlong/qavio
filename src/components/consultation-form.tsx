"use client";
import Link from 'next/link';
import {useEffect,useId,useRef,useState} from 'react';
import {useForm} from 'react-hook-form';
import {contactSchema,demoSchema,POLICY_VERSION} from '@/lib/submission-schema';

type Values={fullName:string;phone:string;message:string;consent:boolean;website:string};
export function ConsultationForm({kind}:{kind:'contact'|'demo'}){
  const id=useId(),started=useRef(0),busy=useRef(false),logical=useRef({payload:'',key:''});
  const [enabled,setEnabled]=useState(false),[checked,setChecked]=useState(false),[testing,setTesting]=useState(false);
  const [state,setState]=useState<'idle'|'submitting'|'success'|'error'>('idle'),[notice,setNotice]=useState('');
  const {register,handleSubmit,setError,clearErrors,reset,formState:{errors}}=useForm<Values>({defaultValues:{fullName:'',phone:'',message:'',consent:false,website:''}});
  useEffect(()=>{started.current=Date.now();let live=true;fetch('/api/forms/status',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(s=>{if(live){setEnabled(s.enabled===true);setTesting(s.testing===true);setChecked(true);}}).catch(()=>{if(live)setChecked(true);});return()=>{live=false;};},[]);
  async function submit(values:Values){
    if(busy.current||!enabled||state==='success')return;
    busy.current=true;clearErrors();
    const input={...values,inquiryType:kind==='demo'?'DEMO':'CONTACT',sourcePage:kind==='demo'?'/request-demo':'/contact',privacyPolicyVersion:POLICY_VERSION,startedAt:started.current};
    const parsed=(kind==='demo'?demoSchema:contactSchema).safeParse(input);
    if(!parsed.success){for(const issue of parsed.error.issues){const key=String(issue.path[0]);if(['fullName','phone','message','consent'].includes(key))setError(key as keyof Values,{message:issue.message});}setState('error');setNotice('Vui lòng kiểm tra các thông tin được đánh dấu.');busy.current=false;return;}
    const payload=JSON.stringify(parsed.data);
    if(logical.current.payload!==payload)logical.current={payload,key:crypto.randomUUID()};
    setState('submitting');setNotice('Đang gửi yêu cầu…');
    try{
      const response=await fetch(kind==='demo'?'/api/demo-requests':'/api/contact',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json','Idempotency-Key':logical.current.key},body:payload});
      const result=await response.json();
      if(response.ok&&result.ok){setState('success');setNotice('QAVIO đã nhận được yêu cầu của bạn. Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã cung cấp.');}
      else{setState('error');if(response.status===422){for(const [key,message] of Object.entries(result.fields||{}))if(['fullName','phone','message','consent'].includes(key))setError(key as keyof Values,{message:String(message)});}
        setNotice(response.status===429?`Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau ${response.headers.get('Retry-After')||'60'} giây.`:response.status===503?'Biểu mẫu hiện chưa thể tiếp nhận yêu cầu. Thông tin đã nhập được giữ trên trang.':'Yêu cầu chưa được xác nhận. Vui lòng kiểm tra và thử lại; thông tin đã nhập được giữ nguyên.');}
    }catch{setState('error');setNotice('Kết nối bị gián đoạn. Thông tin vẫn ở trên trang; hãy thử lại để kiểm tra cùng yêu cầu.');}
    finally{busy.current=false;}
  }
  const error=(name:keyof Values)=>errors[name]?<small className="field-error" id={`${id}-${name}-error`}>{errors[name]?.message}</small>:null;
  const attrs=(name:keyof Values)=>({id:`${id}-${name}`,'aria-invalid':!!errors[name],'aria-describedby':errors[name]?`${id}-${name}-error`:undefined});
  return <div className="form-card consultation-card"><h2>Đăng ký tư vấn</h2>
    <div className="notice" id={`${id}-availability`}><strong>{!checked?'Đang kiểm tra biểu mẫu…':enabled?'Biểu mẫu đang tiếp nhận yêu cầu':'Tính năng gửi chưa được kích hoạt'}</strong><p>{enabled?(testing?'Chỉ dùng thông tin tổng hợp trong môi trường kiểm thử.':'Thông tin được dùng để liên hệ về yêu cầu bạn đã đồng ý. Không cần cung cấp email.'):'Bạn có thể xem biểu mẫu. Hệ thống chưa tiếp nhận dữ liệu khách hàng khi chính sách xử lý thông tin chưa được phê duyệt.'}</p></div>
    <noscript>Cần bật JavaScript để gửi yêu cầu.</noscript>
    <form noValidate aria-describedby={`${id}-availability`} aria-busy={state==='submitting'} onSubmit={event=>{event.preventDefault();void handleSubmit(submit)();}}>
      <fieldset className="form-fields" disabled={state==='submitting'||state==='success'}><div className="form-grid">
        <label htmlFor={`${id}-fullName`}>Họ và tên <span>(bắt buộc)</span><input {...attrs('fullName')} autoComplete="name" placeholder="Nguyễn Văn A" maxLength={120} aria-required="true" {...register('fullName')}/>{error('fullName')}</label>
        <label htmlFor={`${id}-phone`}>Số điện thoại <span>(bắt buộc)</span><input {...attrs('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="Nhập số điện thoại của bạn" maxLength={24} aria-required="true" {...register('phone')}/>{error('phone')}</label>
        <label className="full-field" htmlFor={`${id}-message`}>Lời nhắn của khách hàng <span>(tùy chọn)</span><textarea {...attrs('message')} rows={4} placeholder="Bạn muốn QAVIO tư vấn điều gì?" maxLength={3000} {...register('message')}/>{error('message')}</label>
      </div><div className="honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website<input id={`${id}-website`} tabIndex={-1} autoComplete="off" {...register('website')}/></label></div>
      <label className="consent" htmlFor={`${id}-consent`}><input {...attrs('consent')} type="checkbox" aria-required="true" {...register('consent')}/><span>Tôi đồng ý để QAVIO xử lý thông tin nhằm tiếp nhận và liên hệ về yêu cầu này. Tôi đã xem <Link href="/privacy">chính sách bảo mật{POLICY_VERSION.startsWith('draft-')?' (dự thảo)':''}</Link>.{error('consent')}</span></label></fieldset>
      <div className="form-actions"><button className="button" type="submit" disabled={!enabled||state==='submitting'||state==='success'}>{state==='submitting'?'Đang gửi…':state==='success'?'Đã tiếp nhận':'Gửi yêu cầu tư vấn'}</button>{state==='success'&&<button className="text-link" type="button" onClick={()=>{reset();logical.current={payload:'',key:''};started.current=Date.now();setState('idle');setNotice('');}}>Tạo yêu cầu mới</button>}</div>
      <p className="form-status" role="status" aria-live="polite" data-state={state}>{notice||'Thông tin không được lưu vào bộ nhớ trình duyệt. Chỉ gửi khi bạn chủ động gửi và hệ thống đang mở tiếp nhận.'}</p>
    </form></div>;
}
