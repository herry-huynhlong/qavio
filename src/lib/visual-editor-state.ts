import {defaultVisuals,visualSlots,type VisualSlot} from './visuals';
export type VisualEntry={version:number;title:string;summary:string|null;featuredMediaId:string|null;data:{origin?:string}|null};
export type VisualRow={key:VisualSlot;live:VisualEntry|null;draft:VisualEntry|null};
export type VisualForm={id:string;alt:string;caption:string;origin:string};
export function visualForm(row:VisualRow):VisualForm{
 const initial=row.draft||row.live,fallback=defaultVisuals()[row.key],spec=visualSlots.find(s=>s[0]===row.key)!;
 return {id:initial?.featuredMediaId||'',alt:initial?.title||fallback?.alt||spec[3],caption:initial?.summary||fallback?.caption||'',origin:initial?.data?.origin||fallback?.origin||(row.key.endsWith('-screen')?'SCREENSHOT':'AI')};
}
export function sameVisualForm(a:VisualForm,b:VisualForm){return a.id===b.id&&a.alt.trim()===b.alt.trim()&&a.caption.trim()===b.caption.trim()&&a.origin===b.origin;}
export function sameVisualEntry(a:VisualEntry|null,b:VisualEntry|null){return !!a&&!!b&&a.featuredMediaId===b.featuredMediaId&&a.title.trim()===b.title.trim()&&(a.summary||'').trim()===(b.summary||'').trim()&&a.data?.origin===b.data?.origin;}
export function visualFormErrors(form:VisualForm,slot:VisualSlot){const errors:{id?:string;alt?:string;caption?:string;origin?:string}={};
 if(!form.id&&!defaultVisuals()[slot])errors.id='Chọn ảnh từ thư viện hoặc upload ảnh mới.';
 if(form.alt.trim().length<5||form.alt.trim().length>200)errors.alt='Mô tả ảnh cần từ 5 đến 200 ký tự.';
 if(form.caption.trim().length<5||form.caption.trim().length>1000)errors.caption='Chú thích cần từ 5 đến 1.000 ký tự.';
 if(!['AI','PHOTO','SCREENSHOT'].includes(form.origin)||(slot.endsWith('-screen')&&form.origin!=='SCREENSHOT'))errors.origin='Vị trí này cần screenshot QuánPilot thật.';
 return errors;
}
