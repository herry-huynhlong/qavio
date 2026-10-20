import {z} from 'zod';
import sanitizeHtml from 'sanitize-html';
import {HttpError} from '../http';
import {contactChannelsSchema} from '@/lib/contact-settings';
export const uuid=z.uuid();
const short=(max:number)=>z.string().trim().max(max);
export const email=z.string().trim().toLowerCase().email().max(254);
export const password=z.string().min(12).max(128).refine(v=>Buffer.byteLength(v)<=512);
export const loginSchema=z.object({email,password:z.string().max(128)}).strict();
export const userCreateSchema=z.object({email,name:short(120).min(2),password,role:z.enum(['SUPER_ADMIN','ADMIN','EDITOR'])}).strict();
export const userUpdateSchema=z.object({version:z.number().int().positive(),name:short(120).min(2).optional(),role:z.enum(['SUPER_ADMIN','ADMIN','EDITOR']).optional(),isActive:z.boolean().optional(),password:password.optional()}).strict();
export const leadUpdateSchema=z.object({version:z.number().int().positive(),status:z.enum(['NEW','CONTACTED','QUALIFIED','CONVERTED','CLOSED','SPAM']).optional(),assignedToId:uuid.nullable().optional(),note:short(3000).min(1).optional()}).strict().refine(v=>v.status!==undefined||v.assignedToId!==undefined||!!v.note);
export const categorySchema=z.object({name:short(120).min(2),slug:short(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),version:z.number().int().positive().optional()}).strict();
export const contentSchema=z.object({
  kind:z.enum(['POST','PRODUCT','COMPANY','MISSION','VISION','VALUES','FAQ','CTA','CONTACT','PRIVACY','TERMS']),
  slug:short(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:short(200).min(2),summary:short(1000),bodyHtml:z.string().max(40000),
  status:z.enum(['DRAFT','PUBLISHED']),data:z.record(z.string(),z.unknown()).default({}),
  categoryId:uuid.nullable().optional(),featuredMediaId:uuid.nullable().optional(),seoTitle:short(160).optional(),seoDescription:short(300).optional(),version:z.number().int().positive().optional(),
}).strict();
export const privacySchema=z.object({type:z.enum(['UNSUBSCRIBE','ACCESS','CORRECT','DELETE']),evidence:short(500).min(10)}).strict();
export const dataReviewSchema=z.object({version:z.number().int().positive(),status:z.enum(['REVIEWED','CLOSED']),note:short(500).min(10)}).strict();
export const cleanHtml=(html:string)=>sanitizeHtml(html,{
  allowedTags:['p','br','strong','em','u','h2','h3','h4','ul','ol','li','blockquote','a','code','pre'],
  allowedAttributes:{a:['href','title']},allowedSchemes:['https'],allowProtocolRelative:false,
  transformTags:{a:(_tag,attributes)=>({tagName:'a',attribs:{...attributes,rel:'noopener noreferrer'}})},
});
export function cleanData(kind:z.infer<typeof contentSchema>['kind'],data:Record<string,unknown>){
  const shape=kind==='FAQ'?z.object({items:z.array(z.object({question:short(300).min(2),answer:short(3000).min(2)}).strict()).max(30)}).strict():
    kind==='VALUES'||kind==='PRODUCT'?z.object({items:z.array(z.object({title:short(120).min(2),text:short(3000).min(2)}).strict()).max(30)}).strict():
    kind==='CTA'?z.object({label:short(80).min(2),href:z.enum(['/contact','/request-demo','/request-quote','/solutions','/products','/subscribe'])}).strict():
    kind==='CONTACT'?contactChannelsSchema:z.object({}).strict();
  const result=shape.safeParse(data);
  if(!result.success)throw new HttpError(422,'CONTENT_DATA_INVALID');
  return result.data;
}
export function parsed<T>(schema:z.ZodType<T>,input:unknown):T{const value=schema.safeParse(input);if(!value.success)throw new HttpError(422,'VALIDATION_ERROR');return value.data;}
export function query(request:Request){
  const params=new URL(request.url).searchParams;
  const number=(key:string,fallback:number,max:number)=>{const text=params.get(key);if(text===null)return fallback;const n=Number(text);if(!/^\d+$/.test(text)||!Number.isInteger(n)||n<1||n>max)throw new HttpError(422,'FILTER_INVALID');return n;};
  const page=number('page',1,10000),size=number('size',20,50),q=(params.get('q')||'').trim();
  if(q.length>120)throw new HttpError(422,'FILTER_INVALID');
  const date=(key:string)=>{const text=params.get(key);if(!text)return undefined;if(!/^\d{4}-\d{2}-\d{2}$/.test(text))throw new HttpError(422,'FILTER_INVALID');const d=new Date(text+(key==='to'?'T23:59:59.999Z':'T00:00:00.000Z'));if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==text)throw new HttpError(422,'FILTER_INVALID');return d;};
  const from=date('from'),to=date('to');if(from&&to&&from>to)throw new HttpError(422,'FILTER_INVALID');
  return {page,size,q,skip:(page-1)*size,params,dateRange:from||to?{gte:from,lte:to}:undefined};
}
