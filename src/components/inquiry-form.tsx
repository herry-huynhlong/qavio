"use client";
import Link from 'next/link';
import {ConsultationForm} from './consultation-form';
import {useEffect,useId,useRef,useState} from 'react';
import {useForm,type FieldPath} from 'react-hook-form';
import {contactSchema,demoSchema,quoteSchema,subscribeSchema,POLICY_VERSION} from '@/lib/submission-schema';
type Kind='contact'|'demo'|'quote'|'subscribe';
type Values={fullName:string;email:string;phone:string;companyName:string;restaurantName:string;businessType:string;branchCount:string;subject:string;message:string;planInterest:string;termMonths:string;website:string;consent:boolean};
type State='idle'|'validating'|'submitting'|'success'|'validation-error'|'network-error'|'rate-limited';
const endpoints={contact:'/api/contact',demo:'/api/demo-requests',quote:'/api/quote-requests',subscribe:'/api/newsletter/subscribe'};
const defaults:Values={fullName:'',email:'',phone:'',companyName:'',restaurantName:'',businessType:'',branchCount:'',subject:'',message:'',planInterest:'UNDECIDED',termMonths:'',website:'',consent:false};
export function InquiryForm({kind}:{kind:Kind}){return kind==='contact'||kind==='demo'?<ConsultationForm kind={kind}/>:<LegacyInquiryForm kind={kind}/>;}
function LegacyInquiryForm({kind}:{kind:Kind}){
  const id=useId(),started=useRef(0),busy=useRef(false),logical=useRef({payload:'',key:''});
  const [availability,setAvailability]=useState<{enabled:boolean;emailConfigured:boolean;testing:boolean;newsletterEnabled?:boolean}|null>(null);
  const [state,setState]=useState<State>('idle'),[message,setMessage]=useState('');
  const {register,handleSubmit,setError,clearErrors,reset,formState:{errors}}=useForm<Values>({defaultValues:defaults});
  useEffect(()=>{started.current=Date.now();let live=true;fetch('/api/forms/status',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(value=>{if(live)setAvailability({...value,enabled:kind==='subscribe'?value.newsletterEnabled===true:value.enabled});}).catch(()=>{if(live)setAvailability({enabled:false,emailConfigured:false,testing:false});});return()=>{live=false;};},[kind]);
  async function submit(values:Values,resend=false){
    if(busy.current||!availability?.enabled)return;
    busy.current=true;setState('validating');clearErrors();
    const base={email:values.email.trim(),consent:values.consent,privacyPolicyVersion:POLICY_VERSION,website:values.website,startedAt:started.current};
    const lead={...base,fullName:values.fullName,phone:values.phone};
    const number=(value:string)=>value.trim()?Number(value):undefined;
    const input=kind==='subscribe'?{...base,name:values.fullName,sourcePage:'/subscribe'}:
      kind==='demo'?{...lead,inquiryType:'DEMO',sourcePage:'/request-demo',restaurantName:values.restaurantName,businessType:values.businessType,branchCount:number(values.branchCount),subject:values.subject,message:values.message}:
      kind==='quote'?{...lead,inquiryType:'QUOTE',sourcePage:'/request-quote',companyName:values.companyName,productInterest:'QuánPilot',planInterest:values.planInterest,termMonths:number(values.termMonths),branchCount:number(values.branchCount),message:values.message}:
      {...lead,inquiryType:'CONTACT',sourcePage:'/contact',companyName:values.companyName,subject:values.subject,message:values.message};
    const parsed=({contact:contactSchema,demo:demoSchema,quote:quoteSchema,subscribe:subscribeSchema}[kind]).safeParse(input);
    if(!parsed.success){for(const issue of parsed.error.issues){const field=String(issue.path[0]);setError((field==='name'?'fullName':field) as FieldPath<Values>,{message:'Vui lòng kiểm tra thông tin này.'});}setState('validation-error');setMessage('Thông tin chưa hợp lệ. Vui lòng kiểm tra các mục được đánh dấu.');busy.current=false;return;}
    const payload=JSON.stringify(parsed.data);
    if(logical.current.payload!==payload||resend)logical.current={payload,key:crypto.randomUUID()};
    setState('submitting');setMessage('Đang gửi yêu cầu…');
    try{
      const result=await fetch(resend?'/api/newsletter/resend':endpoints[kind],{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json','Idempotency-Key':logical.current.key},body:payload});
      const body=await result.json();
      if(result.ok&&body.ok){setState('success');setMessage(kind==='subscribe'?`Yêu cầu đã được tiếp nhận. Nếu phù hợp, liên kết xác nhận sẽ được gửi đến email bạn cung cấp. ${body.emailDelivery==='not_configured'?'Dịch vụ email chưa được cấu hình; chưa có email xác nhận được gửi.':'Bạn chỉ nhận tin sau khi xác nhận email.'}`:`QAVIO đã ghi nhận yêu cầu của bạn. Thông tin sẽ được xử lý qua kênh liên hệ phù hợp. ${body.emailDelivery==='not_configured'?'Dịch vụ email chưa được cấu hình; đây là xác nhận trên website.':'Email thông báo được xử lý riêng, chưa xác nhận đã gửi.'}`);}
      else if(result.status===429){setState('rate-limited');setMessage(`Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau ${result.headers.get('Retry-After')||'60'} giây.`);}
      else if(result.status===422){for(const [field,error] of Object.entries(body.fields||{}))setError((field==='name'?'fullName':field) as FieldPath<Values>,{message:String(error)});setState('validation-error');setMessage('Yêu cầu chưa được ghi nhận. Kiểm tra thông tin, đồng ý chính sách và thử lại.');}
      else {setState('network-error');setMessage(result.status===409?'Nội dung đã thay đổi so với lần gửi trước. Hãy kiểm tra rồi thử lại.':'Chưa thể tiếp nhận yêu cầu. Dữ liệu đã nhập được giữ trên trang để bạn thử lại.');}
    }catch{setState('network-error');setMessage('Kết nối bị gián đoạn. Thông tin được giữ trên trang; hãy thử lại để kiểm tra kết quả của cùng yêu cầu.');}
    finally{busy.current=false;}
  }
  const fieldId=(name:string)=>`${id}-${name}`;
  function error(name:FieldPath<Values>){return errors[name]?<small className="field-error" id={`${fieldId(name)}-error`}>{errors[name]?.message}</small>:null;}
  function field(name:FieldPath<Values>,label:string,options?:{type?:string;optional?:boolean;max?:number}){
    return <label htmlFor={fieldId(name)}>{label} <span>({options?.optional?'tùy chọn':'bắt buộc'})</span><input id={fieldId(name)} type={options?.type||'text'} autoComplete={name==='fullName'?'name':name==='email'?'email':name==='phone'?'tel':name==='companyName'||name==='restaurantName'?'organization':'off'} maxLength={options?.max||160} min={options?.type==='number'?1:undefined} max={options?.type==='number'?10000:undefined} aria-required={!options?.optional} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`${fieldId(name)}-error`:undefined} {...register(name)}/>{error(name)}</label>;
  }
  function select(name:FieldPath<Values>,label:string,items:[string,string][],optional=false){return <label htmlFor={fieldId(name)}>{label} <span>({optional?'tùy chọn':'bắt buộc'})</span><select id={fieldId(name)} aria-required={!optional} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`${fieldId(name)}-error`:undefined} {...register(name)}><option value="">{optional?'Chưa xác định':'Chọn một mục'}</option>{items.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select>{error(name)}</label>;}
  const choices=(values:string[]):[string,string][]=>values.map(value=>[value,value]);
  const resetForm=()=>{reset(defaults);setState('idle');setMessage('');logical.current={payload:'',key:''};started.current=Date.now();};
  return <div className="form-card"><h2>{kind==='subscribe'?'Đăng ký nhận tin':kind==='demo'?'Nhu cầu tư vấn / demo':kind==='quote'?'Yêu cầu báo giá QuánPilot':'Nội dung bạn muốn trao đổi'}</h2>
    <div className="notice" id={`${id}-availability`}><strong>{availability===null?'Đang kiểm tra tính năng…':availability.enabled?'Biểu mẫu đang tiếp nhận yêu cầu':'Tính năng gửi chưa được kích hoạt'}</strong><p>{availability?.enabled?(availability.testing?'Chỉ gửi thông tin thử nghiệm trong môi trường kiểm thử. Chính sách bảo mật vẫn là bản dự thảo.':'Thông tin chỉ được xử lý cho mục đích bạn đồng ý bên dưới.'):'Chưa có yêu cầu nào được gửi từ biểu mẫu khi tính năng đang đóng.'}</p></div>
    <noscript><p>Cần bật JavaScript để gửi biểu mẫu.</p></noscript>
    <form noValidate aria-describedby={`${id}-availability`} aria-busy={state==='submitting'||state==='validating'} onSubmit={event=>{event.preventDefault();void handleSubmit(v=>submit(v))();}} onKeyDown={event=>{if(event.key==='Enter'&&event.target instanceof HTMLInputElement&&event.target.type!=='checkbox'){event.preventDefault();void handleSubmit(v=>submit(v))();}}}>
      <button type="submit" disabled hidden aria-hidden="true" tabIndex={-1}>Gửi</button>
      <fieldset disabled={state==='submitting'||state==='success'} className="form-fields"><div className="form-grid">
        {field('fullName','Họ và tên',{optional:kind==='subscribe',max:120})}{field('email','Email',{type:'email',max:254})}
        {kind!=='subscribe'&&<>{field('phone','Số điện thoại',{type:'tel',max:24})}{kind==='demo'?field('restaurantName','Tên nhà hàng hoặc quán'):field('companyName','Công ty hoặc nhà hàng',{optional:true})}
          {kind==='demo'&&<>{select('businessType','Loại hình kinh doanh',choices(['Nhà hàng','Quán ăn','Quán nước / cà phê','Khác']))}{field('branchCount','Số cơ sở',{type:'number',optional:true})}{select('subject','Nhu cầu chính',choices(['Menu QR / gọi món','Quản lý bàn và đơn hàng','Phối hợp phục vụ, bếp, thu ngân','Báo cáo kinh doanh','Tìm hiểu tổng thể QuánPilot']))}</>}
          {kind==='quote'&&<>{select('planInterest','Gói quan tâm',[['BASIC','BASIC'],['PRO','PRO'],['UNDECIDED','Chưa xác định']])}{select('termMonths','Thời hạn',[['3','3 tháng'],['6','6 tháng'],['12','12 tháng']],true)}{field('branchCount','Số cơ sở',{type:'number',optional:true})}</>}
          {kind==='contact'&&select('subject','Chủ đề liên hệ',choices(['Tìm hiểu sản phẩm','Đăng ký tư vấn','Yêu cầu báo giá','Hỗ trợ','Hợp tác','Khác']))}
          <label className="full-field" htmlFor={fieldId('message')}>{kind==='contact'?'Nội dung (bắt buộc, tối thiểu 10 ký tự)':'Lời nhắn (tùy chọn)'}<textarea id={fieldId('message')} rows={5} maxLength={3000} aria-required={kind==='contact'} aria-invalid={!!errors.message} aria-describedby={errors.message?`${fieldId('message')}-error`:undefined} {...register('message')}/>{error('message')}</label>
        </>}
      </div><div className="honeypot" aria-hidden="true"><label htmlFor={fieldId('website')}>Website<input id={fieldId('website')} tabIndex={-1} autoComplete="off" {...register('website')}/></label></div>
      <label className="consent" htmlFor={fieldId('consent')}><input id={fieldId('consent')} type="checkbox" aria-required="true" aria-invalid={!!errors.consent} aria-describedby={errors.consent?`${fieldId('consent')}-error`:undefined} {...register('consent')}/><span>{kind==='subscribe'?'Tôi đồng ý nhận thông tin từ QAVIO sau khi xác nhận qua email.':'Tôi đồng ý xử lý thông tin để QAVIO tiếp nhận và trao đổi về yêu cầu này.'} Tôi đã xem <Link href="/privacy">chính sách bảo mật (dự thảo)</Link>.{error('consent')}</span></label></fieldset>
      <div className="form-actions"><button className="button" type="button" disabled={!availability?.enabled||state==='submitting'||state==='success'} onClick={()=>void handleSubmit(v=>submit(v))()}>{state==='submitting'?'Đang gửi…':state==='success'?'Đã tiếp nhận':'Gửi yêu cầu'}</button><button type="button" className="text-link" disabled={state==='submitting'} onClick={resetForm}>{state==='success'?'Tạo yêu cầu mới':'Xóa thông tin đã nhập'}</button>{kind==='subscribe'&&state==='success'&&<button type="button" className="text-link" onClick={()=>void handleSubmit(v=>submit(v,true))()}>Yêu cầu gửi lại xác nhận</button>}</div>
      <p className="form-status" role="status" aria-live="polite" data-state={state}>{message||'Thông tin không được lưu vào bộ nhớ trình duyệt. Chỉ gửi đến QAVIO khi bạn chủ động gửi và hệ thống đang mở tiếp nhận.'}</p>
    </form></div>;
}
