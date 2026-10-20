"use client";
import {useState} from 'react';
import {normalizePhone} from '@/lib/contact-settings';
export function PhoneActions({phone}:{phone:string}){
  const [notice,setNotice]=useState('');
  async function copy(){try{await navigator.clipboard.writeText(phone);setNotice('Đã sao chép số điện thoại.');}catch{setNotice('Chưa thể sao chép. Hãy chọn số điện thoại và sao chép thủ công.');}}
  if(!phone)return null;
  return <div className="admin-phone-actions"><a className="admin-text-button" href={`tel:${normalizePhone(phone)}`}>Gọi điện</a><button className="admin-text-button" type="button" onClick={()=>void copy()}>Sao chép số điện thoại</button>{notice&&<span className="admin-help" role="status">{notice}</span>}</div>;
}
