import {pageActor} from '@/server/admin/page-auth';
import {VisualSettings} from '@/components/admin/visuals';
export default async function Page(){await pageActor('content');return <VisualSettings/>;}
