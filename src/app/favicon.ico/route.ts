// No approved small icon has been supplied. Keep the browser's generic icon;
// avoid a noisy missing-resource request without inventing a replacement logo.
export const dynamic='force-dynamic';
export function GET(){return new Response(null,{status:204,headers:{'Cache-Control':'public, max-age=86400'}});}
