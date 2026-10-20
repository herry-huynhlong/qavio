import {cleanHtml} from '@/server/admin/validation';
export function CmsBody({html}:{html:string}){return <div className="cms-body" dangerouslySetInnerHTML={{__html:cleanHtml(html)}}/>;}
