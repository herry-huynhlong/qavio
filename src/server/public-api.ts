import type { z } from 'zod';
import { contactSchema,demoSchema,quoteSchema,subscribeSchema,tokenSchema } from '@/lib/submission-schema';
import { createLead } from './lead-service';
import { subscribe,consumeNewsletterToken } from './newsletter-service';
import { guard,readJson,response,failure,clientBucket } from './http';
import {mailConfigured,formsEnabled,consultationEnabled} from './config';
import {HttpError} from './http';
import { transaction } from './db';
import { rateLimit } from './rate-limit';

const schemas = {contact:contactSchema,demo:demoSchema,quote:quoteSchema,subscribe:subscribeSchema,confirm:tokenSchema,unsubscribe:tokenSchema};
export type PublicOperation = keyof typeof schemas;
export async function publicPost(request:Request, operation:PublicOperation) {
  try {
    guard(request,operation==='contact'||operation==='demo'?consultationEnabled():formsEnabled());
    if(operation==='subscribe'&&!mailConfigured())throw new HttpError(503,'NEWSLETTER_NOT_ENABLED');
    const ip=clientBucket(request);
    await transaction(tx=>rateLimit(tx,`envelope:${ip}`,100,60000));
    if(operation==='confirm'||operation==='unsubscribe')await transaction(tx=>rateLimit(tx,`token:${ip}`,40,60000));
    const parsed=schemas[operation].safeParse(await readJson(request));
    if (!parsed.success) {
      const fields:Record<string,string>={};
      for (const issue of parsed.error.issues) { const name=String(issue.path[0]||'form'); fields[name]='Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.'; }
      return response({ok:false,code:'VALIDATION_ERROR',fields},422);
    }
    if(operation==='contact'&&(parsed.data as {inquiryType:string}).inquiryType!=='CONTACT'&&!formsEnabled())throw new HttpError(503,'FORMS_NOT_ENABLED');
    const key=request.headers.get('idempotency-key');
    if(operation==='confirm'||operation==='unsubscribe') return response(await consumeNewsletterToken((parsed.data as z.infer<typeof tokenSchema>).token,operation==='confirm'?'CONFIRM':'UNSUBSCRIBE',ip));
    if(operation==='subscribe') return response(await subscribe(parsed.data as z.infer<typeof subscribeSchema>,key,ip));
    return response(await createLead(parsed.data as z.infer<typeof contactSchema>|z.infer<typeof demoSchema>|z.infer<typeof quoteSchema>,key,ip));
  } catch(error) { return failure(error); }
}
