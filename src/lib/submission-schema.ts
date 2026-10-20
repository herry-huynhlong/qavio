import { z } from 'zod';
import {phoneSchema,normalizePhone} from './contact-settings';
export const POLICY_VERSION = 'draft-2026-10-20';
const text = (max: number) => z.string().trim().max(max);
const requiredText = (min: number, max: number) => text(max).min(min, 'Vui lòng nhập đầy đủ thông tin.');
const common = {
  fullName: requiredText(2,120), email: z.email('Email chưa hợp lệ.').max(254),
  phone: phoneSchema,
  consent: z.literal(true, { error: 'Cần đồng ý xử lý thông tin.' }),
  privacyPolicyVersion: z.literal(POLICY_VERSION),
  sourcePage: z.enum(['/contact','/request-demo','/request-quote','/pricing','/products/quanpilot']),
  website: text(200), startedAt: z.number().int().positive(),
};
export const contactSchema = z.object({ ...common, inquiryType: z.enum(['CONTACT','PRODUCT_INQUIRY']), email: z.email('Email chưa hợp lệ.').max(254).nullable().optional(), companyName: text(160).optional(), subject: z.enum(['Tìm hiểu sản phẩm','Đăng ký tư vấn','Yêu cầu báo giá','Hỗ trợ','Hợp tác','Khác']).default('Đăng ký tư vấn'), message: text(3000).default('') }).strict();
export const demoSchema = z.object({ ...common, inquiryType: z.literal('DEMO'), email: z.email('Email chưa hợp lệ.').max(254).nullable().optional(), restaurantName: requiredText(2,160).optional(), businessType: z.enum(['Nhà hàng','Quán ăn','Quán nước / cà phê','Khác']).optional(), branchCount: z.number().int().min(1).max(10000).optional(), subject: requiredText(2,160).default('Đăng ký tư vấn'), message: text(3000).default('') }).strict();
export const quoteSchema = z.object({ ...common, inquiryType: z.literal('QUOTE'), companyName: text(160).optional(), planInterest: z.enum(['BASIC','PRO','UNDECIDED']), termMonths: z.union([z.literal(3),z.literal(6),z.literal(12)]).optional(), branchCount: z.number().int().min(1).max(10000).optional(), productInterest: z.literal('QuánPilot'), message: text(3000) }).strict();
export const subscribeSchema = z.object({ email: z.email('Email chưa hợp lệ.').max(254), name: text(120).optional(), consent: z.literal(true, {error:'Cần đồng ý nhận tin.'}), privacyPolicyVersion: z.literal(POLICY_VERSION), sourcePage: z.literal('/subscribe'), website: text(200), startedAt: z.number().int().positive() }).strict();
export const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export type LeadInput = z.infer<typeof contactSchema> | z.infer<typeof demoSchema> | z.infer<typeof quoteSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export function normalized<T extends {email?:string|null}>(input:T):T { return {...input,...(typeof input.email==='string'?{email:input.email.trim().toLowerCase()}:{}),...('phone' in input ? {phone:normalizePhone(String(input.phone))} : {})}; }
