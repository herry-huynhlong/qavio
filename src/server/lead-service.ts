import type { LeadInput } from '@/lib/submission-schema';
import { normalized } from '@/lib/submission-schema';
import { idempotent } from './idempotency';
import { mailConfigured } from './config';

export async function createLead(raw: LeadInput, key: string | null, ip: string) {
  const input = normalized(raw);
  return idempotent('lead', key, input, ip, async tx => {
    const lead = await tx.lead.create({ data: {
      fullName: input.fullName, email: input.email, phone: input.phone,
      inquiryType: input.inquiryType, sourcePage: input.sourcePage,
      subject: 'subject' in input ? input.subject : 'Yêu cầu báo giá QuánPilot', message: input.message,
      companyName: 'companyName' in input ? input.companyName || null : null,
      restaurantName: 'restaurantName' in input ? input.restaurantName : null,
      businessType: 'businessType' in input ? input.businessType : null,
      branchCount: 'branchCount' in input ? input.branchCount : null,
      planInterest: 'planInterest' in input ? input.planInterest : null,
      termMonths: 'termMonths' in input ? input.termMonths : null,
      productInterest: ['DEMO','QUOTE','PRODUCT_INQUIRY'].includes(input.inquiryType) ? 'QuánPilot' : null,
      consentAcceptedAt: new Date(), privacyPolicyVersion: input.privacyPolicyVersion,
      activities: { create: { type: 'CREATED', note: 'PUBLIC_FORM_CONSENT_ACCEPTED' } },
    } });
    if (process.env.LEAD_NOTIFICATION_EMAIL) await tx.emailOutbox.create({ data: { kind: 'LEAD_ADMIN', recipient: process.env.LEAD_NOTIFICATION_EMAIL, payload: {}, leadId: lead.id } });
    if (process.env.LEAD_RECEIPT_ENABLED === 'true') await tx.emailOutbox.create({ data: { kind: 'LEAD_RECEIPT', recipient: lead.email, payload: {}, leadId: lead.id } });
    return { ok: true, code: 'LEAD_ACCEPTED', emailDelivery: mailConfigured() ? 'queued_if_enabled' : 'not_configured' };
  });
}
