import {z} from 'zod';

export const phoneSchema=z.string().trim().min(8,'Vui lòng nhập số điện thoại.').max(24)
  .regex(/^\+?[0-9][0-9 .()\-]*$/,'Số điện thoại chưa hợp lệ.')
  .refine(value=>/^[0-9]{8,15}$/.test(value.replace(/\D/g,'')),'Cần từ 8 đến 15 chữ số.');
export const normalizePhone=(value:string)=>value.replace(/[ .()\-]/g,'');
export const zaloUrlSchema=z.string().trim().max(300).refine(value=>{
  if(!value)return true;
  try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='zalo.me'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/(?:[0-9]{8,20}|g\/[A-Za-z0-9_-]{3,100})\/?$/.test(u.pathname);}catch{return false;}
},'Dùng URL HTTPS zalo.me chính thức, không có tham số chuyển hướng.');
export const contactChannelsSchema=z.object({
  email:z.email().max(254).or(z.literal('')).optional(),
  phone:phoneSchema.or(z.literal('')).optional(),phoneDisplay:z.string().trim().max(40).optional(),
  zaloUrl:zaloUrlSchema.optional(),floatingEnabled:z.boolean().optional(),callEnabled:z.boolean().optional(),zaloEnabled:z.boolean().optional(),
  address:z.string().trim().max(300).optional(),
  social:z.array(z.object({label:z.string().trim().min(1).max(80),url:z.url().max(500).refine(value=>{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;})}).strict()).max(10).optional(),
}).strict();
export type ContactChannels=z.infer<typeof contactChannelsSchema>;
export function contactChannels(raw:unknown):ContactChannels {
  const parsed=contactChannelsSchema.safeParse(raw);return parsed.success?parsed.data:{};
}
export function availableChannels(data:ContactChannels){
  return {phone:data.callEnabled&&data.phone?normalizePhone(data.phone):null,zalo:data.zaloEnabled&&data.zaloUrl?data.zaloUrl:null};
}
