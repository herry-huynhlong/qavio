import {notFound} from 'next/navigation';
import {pageActor} from '@/server/admin/page-auth';
import {uuid} from '@/server/admin/validation';
import {db} from '@/server/db';
import {LeadDetailPage} from '@/components/admin/lead-detail';
export default async function Page({params}:{params:Promise<{id:string}>}){await pageActor('crm');const {id}=await params;if(!uuid.safeParse(id).success||!await db().lead.findUnique({where:{id},select:{id:true}}))notFound();return <LeadDetailPage id={id}/>;}
