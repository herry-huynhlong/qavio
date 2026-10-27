"use client";
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ChefHat,ClipboardList,ScanLine,Receipt,Users,ChartNoAxesCombined} from 'lucide-react';
import {ScreenshotViewer} from './screenshot-viewer';
import type {VisualImages,VisualSlot} from '@/lib/visuals';
type Screen={slot:VisualSlot;title:string;device:'phone'|'tablet'|'desktop'};
const groups:{title:string;description:string;icon:typeof Users;screens:Screen[]}[]=[
 {title:'Khách gọi món',description:'Từ thực đơn tại bàn đến yêu cầu thanh toán, ngay trên điện thoại.',icon:ScanLine,screens:[{slot:'menu-screen',title:'Thực đơn tại bàn',device:'phone'},{slot:'cart-screen',title:'Chọn số lượng và gọi món',device:'phone'},{slot:'customer-order-screen',title:'Đơn hàng của bạn',device:'phone'},{slot:'customer-help-screen',title:'Gọi nhân viên',device:'phone'},{slot:'customer-payment-screen',title:'Yêu cầu thanh toán',device:'phone'}]},
 {title:'Nhân viên phục vụ',description:'Nắm bắt đơn mới, nhận món và hỗ trợ khách trong ca.',icon:Users,screens:[{slot:'staff-login-screen',title:'Đăng nhập nhân viên',device:'phone'},{slot:'staff-shift-screen',title:'Bắt đầu ca làm việc',device:'phone'},{slot:'service-screen',title:'Bàn và yêu cầu của khách',device:'phone'},{slot:'service-ready-screen',title:'Nhận món và hoàn tất phục vụ',device:'phone'},{slot:'service-tables-screen',title:'Trạng thái bàn trên điện thoại',device:'phone'}]},
 {title:'Bếp',description:'Tiếp nhận món, theo dõi chế biến và chuyển món đến phục vụ.',icon:ChefHat,screens:[{slot:'kitchen-screen',title:'Danh sách món cần chuẩn bị',device:'tablet'},{slot:'kitchen-cooking-screen',title:'Theo dõi món đang chế biến',device:'tablet'}]},
 {title:'Thu ngân',description:'Xem bill, xác nhận thanh toán và tra cứu giao dịch.',icon:Receipt,screens:[{slot:'cashier-screen',title:'Các bàn cần thanh toán',device:'tablet'},{slot:'cashier-bill-screen',title:'Chi tiết bill và phương thức thanh toán',device:'tablet'},{slot:'cashier-history-screen',title:'Lịch sử giao dịch',device:'tablet'}]},
 {title:'Chủ quán',description:'Theo dõi kinh doanh và quản lý hoạt động trên màn hình lớn.',icon:ChartNoAxesCombined,screens:[{slot:'dashboard-screen',title:'Tổng quan kinh doanh',device:'desktop'},{slot:'reports-screen',title:'Doanh thu hôm nay',device:'desktop'},{slot:'reports-week-screen',title:'Báo cáo tuần',device:'desktop'},{slot:'reports-month-screen',title:'Báo cáo tháng',device:'desktop'},{slot:'reports-year-screen',title:'Báo cáo năm',device:'desktop'},{slot:'tables-screen',title:'Khu vực và bàn',device:'desktop'},{slot:'menu-admin-screen',title:'Thực đơn và giá bán',device:'desktop'},{slot:'staff-screen',title:'Quản lý đội ngũ',device:'desktop'}]},
 {title:'Quản lý',description:'Điều phối công việc và theo dõi hoạt động nhà hàng.',icon:ClipboardList,screens:[{slot:'manager-screen',title:'Điều hành hoạt động',device:'desktop'},{slot:'orders-screen',title:'Theo dõi đơn hàng',device:'desktop'},{slot:'settings-screen',title:'Thiết lập nhà hàng',device:'desktop'}]},
];
export function ProductDemoGallery({images}:{images:VisualImages}){
 const [selected,setSelected]=useState(0),[detail,setDetail]=useState(0),touch=useRef<{x:number;y:number}|null>(null);
 const available=groups[selected].screens.filter(s=>images[s.slot]),screen=available[detail]??available[0];
 const move=(step:number)=>setDetail(index=>available.length?(index+step+available.length)%available.length:0);
 const previous=()=>move(-1),next=()=>move(1);
 return <section className="section product-demo-gallery" aria-labelledby="product-demo-title"><div className="container">
  <div className="visual-section-top"><span className="eyebrow">KHÁM PHÁ QUÁNPILOT</span><h2 id="product-demo-title">Cùng một nhà hàng.<br/>Liền mạch mọi công việc.</h2><p>Từ bàn khách đến bếp, quầy thu ngân và góc nhìn của người điều hành.</p></div>
  <div className="demo-screen-picker demo-role-picker" role="group" aria-label="Chọn vai trò trải nghiệm">{groups.map((group,index)=><button key={group.title} type="button" aria-pressed={selected===index} onClick={()=>{setSelected(index);setDetail(0);}}><group.icon size={19}/>{group.title}</button>)}</div>
  <div className="demo-journey-heading"><h3>{groups[selected].title}</h3><p>{groups[selected].description}</p></div>
  {available.length>1&&<div className="demo-screen-picker demo-step-picker" role="group" aria-label="Chọn chức năng">{available.map((item,index)=><button key={item.slot} type="button" aria-pressed={screen?.slot===item.slot} onClick={()=>setDetail(index)}>{item.title}</button>)}</div>}
  <div className={`demo-screen-preview demo-device-${screen?.device??'desktop'}`} role="region" aria-label="Ảnh giao diện QuánPilot" tabIndex={0} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowRight'){event.preventDefault();next();}if(event.key==='ArrowLeft'){event.preventDefault();previous();}}} onTouchStart={event=>{if((event.target as Element).closest('dialog')){touch.current=null;return;}const p=event.touches[0];touch.current={x:p.clientX,y:p.clientY};}} onTouchEnd={event=>{if(!touch.current)return;const p=event.changedTouches[0],dx=p.clientX-touch.current.x,dy=p.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0)next();else previous();}}}>
   {screen?<ScreenshotViewer image={images[screen.slot]} title={screen.title} onPrevious={available.length>1?previous:undefined} onNext={available.length>1?next:undefined}/>:<p>Hình ảnh chức năng đang được cập nhật.</p>}
  </div>
  {available.length>1&&<nav className="demo-image-navigation" aria-label="Điều hướng ảnh"><button type="button" onClick={previous} aria-label="Ảnh trước"><ArrowLeft size={18}/>Trước</button><span aria-live="polite">{detail+1} / {available.length}</span><button type="button" onClick={next} aria-label="Ảnh tiếp theo">Tiếp<ArrowRight size={18}/></button></nav>}
  <p className="demo-entitlement-note">Hình ảnh sản phẩm sử dụng dữ liệu trình diễn.</p>
 </div></section>;
}
