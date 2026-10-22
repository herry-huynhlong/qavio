import { formsEnabled,mailConfigured,consultationEnabled } from '@/server/config';
export const dynamic='force-dynamic';
export function GET(){return Response.json({enabled:consultationEnabled(),quoteEnabled:formsEnabled(),newsletterEnabled:false,emailConfigured:mailConfigured(),testing:(process.env.QAVIO_DEPLOYMENT_ENV||process.env.NODE_ENV)!=='production'},{headers:{'Cache-Control':'no-store'}});}
