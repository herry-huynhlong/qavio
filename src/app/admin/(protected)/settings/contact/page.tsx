import {pageActor} from '@/server/admin/page-auth';
import {ContactSettings} from '@/components/admin/contact-settings';
export default async function Page(){await pageActor('settings');return <ContactSettings/>;}
