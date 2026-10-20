import { formsEnabled,mailConfigured } from '@/server/config';
export const dynamic='force-dynamic';
export function GET(){return Response.json({enabled:formsEnabled(),emailConfigured:mailConfigured(),testing:(process.env.QAVIO_DEPLOYMENT_ENV||process.env.NODE_ENV)!=='production'},{headers:{'Cache-Control':'no-store'}});}
