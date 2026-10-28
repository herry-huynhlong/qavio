"use client";
import Image from 'next/image';
import {useCallback,useEffect,useId,useRef,useState} from 'react';
import {visualSlots,defaultVisuals} from '@/lib/visuals';
import {visualForm,sameVisualForm,sameVisualEntry,visualFormErrors,type VisualEntry,type VisualRow,type VisualForm} from '@/lib/visual-editor-state';
import {useAdmin,errorMessage,PageHeading} from './shell';
type Media={id:string;label:string;width:number;height:number};
export function VisualSettings(){
 const {api,permissions}=useAdmin();const [rows,setRows]=useState<VisualRow[]>([]),[media,setMedia]=useState<Media[]>([]),[error,setError]=useState(''),[page,setPage]=useState(1),[hasMore,setHasMore]=useState(false);
 const load=useCallback(async()=>{try{const result=await api<{slots:VisualRow[]}>('visuals');setError('');setRows(result.slots);}catch(e){setError(errorMessage(e));}},[api]);
 useEffect(()=>{let live=true;void api<{slots:VisualRow[]}>('visuals').then(result=>{if(live)setRows(result.slots);}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[api]);
 useEffect(()=>{let live=true;void api<{rows:Media[];total:number}>('media?size=50&page='+page).then(r=>{if(!live)return;setMedia(old=>page===1?r.rows:[...new Map([...old,...r.rows].map(m=>[m.id,m])).values()]);setHasMore(page*50<r.total);}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[api,page]);
 return <><PageHeading title="Ảnh giới thiệu sản phẩm" description="Lưu nháp giữ thay đổi trong Admin. Xuất bản đưa đúng bản nháp đã lưu lên website."/>{error&&<p className="admin-alert error" role="alert">{error} <button className="admin-text-button" onClick={()=>void load()}>Thử tải lại</button></p>}<p className="admin-alert">Ảnh phần mềm phải là screenshot QuánPilot thật, đã ẩn thông tin cá nhân. Ghi đúng nguồn ảnh và phạm vi minh họa; không dùng màn hình AI.</p><div className="visual-admin-grid">{rows.map(row=><VisualCard key={row.key} row={row} media={media} canPublish={permissions.includes('publish')} onMedia={m=>setMedia(old=>[m,...old.filter(x=>x.id!==m.id)])}/>)}</div>{hasMore&&<button className="admin-button secondary" onClick={()=>setPage(p=>p+1)}>Tải thêm ảnh từ thư viện</button>}{!rows.length&&!error&&<p role="status">Đang tải các vị trí ảnh…</p>}</>;
}
function VisualCard({row,media,canPublish,onMedia}:{row:VisualRow;media:Media[];canPublish:boolean;onMedia:(m:Media)=>void}){
 const {api}=useAdmin(),uid=useId(),lock=useRef(false),spec=visualSlots.find(s=>s[0]===row.key)!,fallback=defaultVisuals()[row.key];
 const [saved,setSaved]=useState(row),[form,setForm]=useState(()=>visualForm(row)),[busy,setBusy]=useState<'draft'|'publish'|'upload'|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const dirty=!sameVisualForm(form,visualForm(saved)),errors=visualFormErrors(form,row.key),valid=Object.keys(errors).length===0;
 const published=sameVisualEntry(saved.draft,saved.live),preview=form.id?'/media/'+form.id:fallback?.src;
 const saveReason=!dirty?'Chưa có thay đổi để lưu':!valid?'Kiểm tra các trường chưa hợp lệ bên dưới.':'Có thay đổi chưa lưu. Lưu nháp chưa thay ảnh trên website.';
 const publishReason=!canPublish?'Tài khoản này chỉ được lưu nháp, chưa có quyền xuất bản.':dirty?'Hãy lưu thay đổi thành bản nháp trước khi xuất bản.':!saved.draft?'Chưa có bản nháp đã lưu để xuất bản.':published?'Bản nháp này đã được xuất bản.':'Bản nháp đã lưu sẵn sàng xuất bản lên website.';
 function change(key:keyof VisualForm,value:string){setForm(old=>({...old,[key]:value}));setNotice('');setError('');}
 async function action(publish:boolean){
  if(lock.current||!valid||(publish?(!canPublish||!saved.draft||dirty||published):!dirty))return;
  lock.current=true;setBusy(publish?'publish':'draft');setError('');setNotice('');
  try{
   const result=await api<{entry:VisualEntry}>('visuals',{method:'PATCH',body:JSON.stringify(publish?{action:'publish',slot:row.key,version:saved.draft!.version,liveVersion:saved.live?.version||0}:{action:'draft',slot:row.key,...(form.id?{mediaId:form.id}:{useDefault:true}),alt:form.alt,caption:form.caption,origin:form.origin,version:saved.draft?.version||0})});
   const next={...saved,...(publish?{live:result.entry}:{draft:result.entry})};setSaved(next);setForm(visualForm(next));
   setNotice(publish?'Đã xuất bản ảnh. Website sử dụng bản vừa xuất bản.':'Đã lưu bản nháp. Website vẫn giữ ảnh đang xuất bản.');
   if(!publish&&!form.id&&result.entry.featuredMediaId&&fallback)onMedia({id:result.entry.featuredMediaId,label:'Ảnh mặc định — '+spec[1],width:fallback.width,height:fallback.height});
  }catch(e){setError(errorMessage(e));}finally{lock.current=false;setBusy(null);}
 }
 async function upload(file:File){
  if(lock.current)return;setError('');setNotice('');
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setError('Chỉ nhận ảnh PNG, JPEG hoặc WebP.');return;}
  if(file.size>5*1024*1024){setError('Ảnh vượt quá 5 MB. Hãy chọn tệp nhỏ hơn.');return;}
  lock.current=true;setBusy('upload');try{const body=new FormData();body.append('file',file);const m=await api<Media>('media',{method:'POST',body});onMedia(m);setForm(old=>({...old,id:m.id}));setNotice('Đã tải ảnh vào thư viện. Bấm Lưu nháp để lưu cho vị trí này.');}catch(e){setError(errorMessage(e));}finally{lock.current=false;setBusy(null);}
 }
 return <section className="visual-admin-card" aria-labelledby={uid+'-title'}><h2 id={uid+'-title'}>{spec[1]}</h2><p className="admin-help">{saved.live?'Có ảnh đã xuất bản':fallback?'Đang dùng ảnh mặc định':'Chưa có ảnh công khai'}{saved.draft?(published?' · Bản nháp đã xuất bản':' · Có bản nháp chưa xuất bản'):''}</p>{preview?<div className="visual-admin-preview"><Image src={preview} alt={form.alt} fill sizes="(max-width:800px) 90vw, 440px" unoptimized/></div>:<p className="admin-alert">Chưa có screenshot được duyệt. Không hiển thị màn hình giả trên website.</p>}
 <form className="admin-form" method="post" onSubmit={event=>{event.preventDefault();void action(false);}}><fieldset disabled={!!busy} className="admin-form">
  <label htmlFor={uid+'-media'}>Chọn ảnh thư viện<select id={uid+'-media'} value={form.id} onChange={e=>change('id',e.target.value)} aria-invalid={!!errors.id} aria-describedby={errors.id?uid+'-media-error':uid+'-source-help'}><option value="">{fallback?'Ảnh mặc định hiện tại':'Chọn ảnh'}</option>{form.id&&!media.some(m=>m.id===form.id)&&<option value={form.id}>Ảnh đã chọn</option>}{media.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
  {errors.id&&<p id={uid+'-media-error'} className="admin-alert error">{errors.id}</p>}<p id={uid+'-source-help'} className="admin-help">{!form.id&&fallback?'Bạn có thể sửa mô tả/chú thích ảnh mặc định rồi lưu nháp, không cần upload lại.':'Chọn ảnh có sẵn trong thư viện hoặc upload ảnh mới.'}</p>
  <label>Upload ảnh mới (PNG/JPEG/WebP, tối đa 5 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value='';}}/></label>
  <label htmlFor={uid+'-alt'}>Mô tả ảnh (alt)<input id={uid+'-alt'} required minLength={5} maxLength={200} value={form.alt} onChange={e=>change('alt',e.target.value)} aria-invalid={!!errors.alt} aria-describedby={errors.alt?uid+'-alt-error':undefined}/></label>{errors.alt&&<p id={uid+'-alt-error'} className="admin-alert error">{errors.alt}</p>}
  <label htmlFor={uid+'-caption'}>Chú thích / phạm vi minh họa<textarea id={uid+'-caption'} required minLength={5} maxLength={1000} rows={2} value={form.caption} onChange={e=>change('caption',e.target.value)} aria-invalid={!!errors.caption} aria-describedby={errors.caption?uid+'-caption-error':undefined}/></label>{errors.caption&&<p id={uid+'-caption-error'} className="admin-alert error">{errors.caption}</p>}
  <label>Nguồn ảnh<select value={form.origin} disabled={row.key.endsWith('-screen')} onChange={e=>change('origin',e.target.value)}><option value="AI">Ảnh minh họa AI</option><option value="PHOTO">Ảnh có quyền sử dụng</option><option value="SCREENSHOT">Screenshot QuánPilot thật</option></select></label>{errors.origin&&<p className="admin-alert error">{errors.origin}</p>}
  <p id={uid+'-save-reason'} className="admin-help">{saveReason}</p><p id={uid+'-publish-reason'} className="admin-help">{publishReason}</p>
  <div className="admin-form-actions"><button type="submit" className="admin-button secondary" disabled={!!busy||!dirty||!valid} aria-describedby={uid+'-save-reason'}>{busy==='draft'?'Đang lưu nháp…':'Lưu nháp'}</button><button type="button" className="admin-button" disabled={!!busy||!canPublish||!saved.draft||dirty||published||!valid} aria-describedby={uid+'-publish-reason'} onClick={()=>void action(true)}>{busy==='publish'?'Đang xuất bản…':'Xuất bản ảnh'}</button></div>
 </fieldset></form>{busy==='upload'&&<p role="status">Đang tải ảnh vào thư viện…</p>}{error&&<p role="alert" className="admin-alert error">{error} Dữ liệu đang nhập vẫn được giữ. Bạn có thể thử lại.</p>}{notice&&<p role="status" className="admin-alert success">{notice}</p>}</section>;
}
