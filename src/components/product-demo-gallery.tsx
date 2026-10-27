"use client";

import {useState} from 'react';
import {ScreenshotViewer} from './screenshot-viewer';
import type {VisualImages,VisualSlot} from '@/lib/visuals';

const screens: {slot:VisualSlot;title:string}[] = [
  {slot:'dashboard-screen',title:'Tổng quan kinh doanh'},
  {slot:'reports-screen',title:'Báo cáo doanh thu'},
  {slot:'tables-screen',title:'Quản lý bàn'},
  {slot:'orders-screen',title:'Đơn hàng theo bàn'},
  {slot:'staff-screen',title:'Quản lý nhân viên'},
  {slot:'menu-admin-screen',title:'Cấu hình thực đơn'},
];

export function ProductDemoGallery({images}:{images:VisualImages}){
  const available=screens.filter(screen=>images[screen.slot]);
  const [selected,setSelected]=useState(0);
  const screen=available[selected]??available[0];
  if(!screen)return null;
  return <section className="section product-demo-gallery" aria-labelledby="product-demo-title">
    <div className="container">
      <div className="visual-section-top"><span className="eyebrow">BÊN TRONG QUÁNPILOT</span><h2 id="product-demo-title">QAVIO. Một ca vận hành.</h2><p>Xem từng màn hình, từ nhận đơn đến theo dõi doanh thu.</p></div>
      <div className="demo-screen-picker" role="group" aria-label="Chọn màn hình QuánPilot">
        {available.map((item,i)=><button key={item.slot} type="button" aria-pressed={screen.slot===item.slot} onClick={()=>setSelected(i)}>{item.title}</button>)}
      </div>
      <div className="demo-screen-preview" aria-live="polite"><ScreenshotViewer key={screen.slot} image={images[screen.slot]} title={screen.title}/></div>
      <p className="demo-entitlement-note">Cửa hàng QAVIO · TRAIN / quyền BASIC. Màn hình bếp và thu ngân riêng thuộc PRO.</p>
    </div>
  </section>;
}
