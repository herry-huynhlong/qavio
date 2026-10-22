import {redirect} from 'next/navigation';
import {pageActor} from '@/server/admin/page-auth';
export default async function Page(){await pageActor('subscribers');redirect('/admin');}
