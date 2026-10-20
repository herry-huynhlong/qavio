import nodemailer from 'nodemailer';
import { appOrigin,mailConfigured } from './config';
import { tokenValue } from './crypto';
import type { EmailKind, Prisma } from '@prisma/client';
import type { Transaction } from './db';
export type EmailMessage={to:string;subject:string;text:string;messageId:string};
export type EmailAdapter={send:(message:EmailMessage)=>Promise<void>};
export function smtpAdapter():EmailAdapter|null {
  if (!mailConfigured()) return null;
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.SMTP_SECURE!=='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:5000,greetingTimeout:5000,socketTimeout:5000,logger:false,debug:false});
  return {async send(message){await transport.sendMail({...message,from:process.env.EMAIL_FROM});}};
}
export async function renderEmail(tx:Transaction, row:{id:string;kind:EmailKind;recipient:string;payload:Prisma.JsonValue;leadId:string|null}):Promise<EmailMessage> {
  const payload=(row.payload||{}) as {tokenId?:string;text?:string};
  const messageId=`<${row.id}@${new URL(appOrigin()).hostname}>`;
  let subject='Thông tin từ QAVIO',text='QAVIO';
  if(row.kind==='LEAD_ADMIN' && row.leadId){
    const lead=await tx.lead.findUniqueOrThrow({where:{id:row.leadId}});
    subject='QAVIO — Có yêu cầu khách hàng mới';
    text=`QAVIO đã tiếp nhận yêu cầu ${lead.inquiryType}.\nHọ tên: ${lead.fullName}\nEmail: ${lead.email}\nĐiện thoại: ${lead.phone}\nNội dung: ${lead.message}`;
  } else if(row.kind==='LEAD_RECEIPT'){
    subject='QAVIO — Đã ghi nhận yêu cầu'; text='QAVIO đã ghi nhận yêu cầu của bạn. Thông tin đã được tiếp nhận và sẽ được xử lý qua kênh liên hệ phù hợp. Email này không xác nhận lịch hẹn, tài khoản hay giao dịch thanh toán.';
  } else if(row.kind==='NEWSLETTER_CONFIRM' && payload.tokenId){
    subject='QAVIO — Xác nhận đăng ký nhận tin';
    text=`Để xác nhận mong muốn nhận tin, mở liên kết và chọn Xác nhận. Liên kết có hiệu lực trong 24 giờ.\n${appOrigin()}/newsletter/confirm#token=${tokenValue(payload.tokenId)}\nNếu bạn không yêu cầu, có thể bỏ qua email này. Chưa có email marketing nào được đăng ký trước khi bạn xác nhận.`;
  } else if(row.kind==='NEWSLETTER_WELCOME' && payload.tokenId){
    subject='QAVIO — Đã xác nhận đăng ký nhận tin';text=`Bạn đã xác nhận đăng ký nhận tin từ QAVIO. Bạn có thể hủy nhận tin tại:\n${appOrigin()}/newsletter/unsubscribe#token=${tokenValue(payload.tokenId)}`;
  } else if(row.kind==='NEWSLETTER_UNSUBSCRIBED'){
    subject='QAVIO — Đã hủy đăng ký nhận tin';text='QAVIO đã ghi nhận việc hủy đăng ký nhận tin. Bạn sẽ không tiếp tục nhận email marketing, trừ khi chủ động đăng ký và xác nhận lại.';
  } else if(row.kind==='MARKETING' && payload.tokenId){
    subject='Thông tin từ QAVIO';text=`${String(payload.text||'').slice(0,5000)}\nHủy đăng ký: ${appOrigin()}/newsletter/unsubscribe#token=${tokenValue(payload.tokenId)}`;
  } else throw new Error('INVALID_OUTBOX_PAYLOAD');
  return {to:row.recipient,subject,text,messageId};
}
