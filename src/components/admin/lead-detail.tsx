"use client";
import {useRouter} from 'next/navigation';
import {LeadPanel} from './crm-panels';
import {PageHeading} from './shell';
export function LeadDetailPage({id}:{id:string}){const router=useRouter();const back=()=>router.push('/admin/leads');return <><PageHeading title="Chi tiết yêu cầu khách hàng" description="Xem thông tin, gọi điện và cập nhật kết quả liên hệ."/><LeadPanel row={{id,version:1}} onClose={back} onDone={back}/></>;}
