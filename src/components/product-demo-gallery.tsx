"use client";
import {useState} from 'react';
import {ScreenshotViewer} from './screenshot-viewer';
import type {VisualImages,VisualSlot} from '@/lib/visuals';
const groups: {title:string;screens:{slot:VisualSlot;title:string}[]}[] = [
 {title:'Tổng quan',screens:[{slot:'dashboard-screen',title:'Hoạt động hôm nay và xu hướng 7 ngày'}]},
 {title:'Doanh thu theo ngày',screens:[{slot:'reports-screen',title:'Hôm nay'},{slot:'history-screen',title:'Lịch sử thanh toán'}]},
 {title:'Báo cáo tuần/tháng',screens:[{slot:'reports-week-screen',title:'Tuần này'},{slot:'reports-month-screen',title:'Tháng này'}]},
 {title:'Báo cáo năm',screens:[{slot:'reports-year-screen',title:'Năm nay'}]},
 {title:'Quản lý bàn',screens:[{slot:'tables-screen',title:'10 bàn và trạng thái phục vụ'},{slot:'orders-screen',title:'Đơn hàng theo bàn'}]},
 {title:'Gọi món QR',screens:[{slot:'menu-screen',title:'Thực đơn trên điện thoại'},{slot:'cart-screen',title:'Chọn món vào giỏ'}]},
 {title:'Nhân viên',screens:[{slot:'service-screen',title:'Nhân viên phục vụ'},{slot:'staff-screen',title:'Đội ngũ trong ca'}]},
];
export function ProductDemoGallery({images}:{images:VisualImages}){
 const [selected,setSelected]=useState(0),[detail,setDetail]=useState(0);
 const group=groups[selected],available=group.screens.filter(screen=>images[screen.slot]),screen=available[detail]??available[0];
 return <section className="section product-demo-gallery" aria-labelledby="product-demo-title"><div className="container">
  <div className="visual-section-top"><span className="eyebrow">BÊN TRONG QUÁNPILOT</span><h2 id="product-demo-title">Từng ngày vận hành. Cả năm trong tầm nhìn.</h2><p>Khám phá hoạt động của cửa hàng QAVIO qua bộ ảnh có dữ liệu minh họa.</p></div>
  <div className="demo-screen-picker" role="group" aria-label="Chọn nhóm màn hình QuánPilot">{groups.map((item,i)=><button key={item.title} type="button" aria-pressed={selected===i} onClick={()=>{setSelected(i);setDetail(0);}}>{item.title}</button>)}</div>
  {available.length>1&&<div className="demo-screen-picker demo-period-picker" role="group" aria-label="Chọn ảnh trong nhóm">{available.map((item,i)=><button key={item.slot} type="button" aria-pressed={screen?.slot===item.slot} onClick={()=>setDetail(i)}>{item.title}</button>)}</div>}
  <div className="demo-screen-preview" aria-live="polite">{screen?<ScreenshotViewer key={screen.slot} image={images[screen.slot]} title={screen.title}/>:<p>Ảnh màn hình đang được cập nhật.</p>}</div>
  <p className="demo-entitlement-note">Bộ ảnh từ môi trường demo cô lập · TRAIN / quyền BASIC. Đây là ảnh minh họa, không phải báo cáo trực tiếp của khách hàng.</p>
 </div></section>;
}
