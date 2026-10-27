import {productDemoVisuals} from './product-demo-visuals';
export const visualSlots = [
  ['service-tables-screen','Bàn trên điện thoại — screenshot',null,'Giao diện bàn cho nhân viên phục vụ.'],
  ['customer-order-screen','Đơn của khách — screenshot',null,'Giao diện QuánPilot.'],
  ['customer-help-screen','Gọi nhân viên — screenshot',null,'Giao diện QuánPilot.'],
  ['customer-payment-screen','Khách yêu cầu thanh toán — screenshot',null,'Giao diện QuánPilot.'],
  ['staff-login-screen','Đăng nhập phục vụ — screenshot',null,'Giao diện QuánPilot.'],
  ['staff-shift-screen','Bắt đầu ca — screenshot',null,'Giao diện QuánPilot.'],
  ['service-ready-screen','Phục vụ nhận món — screenshot',null,'Giao diện QuánPilot.'],
  ['kitchen-cooking-screen','Bếp chế biến — screenshot',null,'Giao diện QuánPilot.'],
  ['cashier-bill-screen','Chi tiết bill — screenshot',null,'Giao diện QuánPilot.'],
  ['cashier-history-screen','Lịch sử thu ngân — screenshot',null,'Giao diện QuánPilot.'],
  ['manager-screen','Tổng quan quản lý — screenshot',null,'Giao diện QuánPilot.'],
  ['settings-screen','Cài đặt nhà hàng — screenshot',null,'Giao diện QuánPilot.'],

  ['hero','Ảnh hero','qr-cafe','Khách dùng điện thoại quét QR tại bàn trong quán cà phê.'],
  ['qr','Khách quét QR','qr-cafe','Khách quét mã QR minh họa tại bàn.'],
  ['service','Phục vụ','service','Nhân viên phục vụ theo dõi công việc bằng tablet.'],
  ['kitchen','Bếp','kitchen','Đầu bếp sử dụng thiết bị trong quá trình chuẩn bị món.'],
  ['cashier','Thu ngân','cashier','Nhân viên thao tác tại quầy thu ngân.'],
  ['owner','Chủ quán','owner','Chủ quán xem laptop trong không gian quán.'],
  ['tables','Không gian nhiều bàn','tables','Không gian nhà hàng và nhân viên phục vụ.'],
  ['solutions','Ảnh giải pháp','tables','Không gian nhà hàng hiện đại.'],
  ['about','Hero Giới thiệu QAVIO','about-business-v2','Hai người cộng tác với laptop và tablet trong không gian kinh doanh hiện đại; ảnh minh họa AI.'],
  ['technology','Công nghệ QAVIO','technology','Đồ họa trừu tượng navy và ánh sáng vàng kim.'],
  ['menu-screen','Menu QR — screenshot thật',null,'Giao diện menu khách hàng QuánPilot.'],
  ['menu-admin-screen','Quản lý thực đơn — screenshot thật',null,'Giao diện quản lý món và giá bán QuánPilot.'],
  ['cart-screen','Chọn số lượng — screenshot thật',null,'Chọn số lượng và gọi món tại bàn.'],
  ['tables-screen','Quản lý bàn — screenshot thật',null,'Giao diện quản lý bàn QuánPilot.'],
  ['service-screen','Phục vụ — screenshot thật',null,'Giao diện phục vụ QuánPilot.'],
  ['kitchen-screen','Bếp — screenshot thật',null,'Giao diện bếp QuánPilot.'],
  ['cashier-screen','Thu ngân — screenshot thật',null,'Giao diện thu ngân QuánPilot.'],
  ['dashboard-screen','Dashboard — screenshot thật',null,'Dashboard chủ quán QuánPilot.'],
  ['reports-week-screen','Báo cáo tuần — screenshot thật',null,'Báo cáo tuần QAVIO.'],
  ['reports-month-screen','Báo cáo tháng — screenshot thật',null,'Báo cáo tháng QAVIO.'],
  ['reports-year-screen','Báo cáo năm — screenshot thật',null,'Báo cáo năm QAVIO.'],
  ['history-screen','Lịch sử bill — screenshot thật',null,'Lịch sử thanh toán QAVIO.'],
  ['reports-screen','Báo cáo — screenshot thật',null,'Báo cáo doanh thu QuánPilot.'],
  ['orders-screen','Đơn hàng — screenshot thật',null,'Danh sách đơn hàng theo bàn QuánPilot.'],
  ['staff-screen','Nhân viên — screenshot thật',null,'Quản lý đội ngũ nhân viên QuánPilot.'],
] as const;
export type VisualSlot = typeof visualSlots[number][0];
export type VisualImage = {src:string;width:number;height:number;alt:string;caption:string;origin:'AI'|'SCREENSHOT'|'PHOTO'};
export type VisualImages = Partial<Record<VisualSlot,VisualImage>>;
const photoCaptions:Record<string,string>={
 'qr-cafe':'Xem thực đơn và gọi món ngay tại bàn.',
 service:'Tiếp nhận yêu cầu và hỗ trợ khách hàng thuận tiện hơn.',
 kitchen:'Phối hợp chuẩn bị món và theo dõi tiến độ phục vụ.',
 cashier:'Quản lý thanh toán và hoàn tất phiên bàn.',
 owner:'Theo dõi hoạt động kinh doanh trên một hệ thống tập trung.',
 tables:'Tổ chức không gian và theo dõi hoạt động phục vụ.',
 'about-business-v2':'Công nghệ hướng đến giá trị thực. Ảnh minh họa AI.',
 technology:'Công nghệ đồng hành cùng hoạt động kinh doanh.',
};
// Source information remains in origin/CMS and the image-prompt documentation.
// Normalize historical technical captions without rewriting stored CMS content.
export function naturalVisualCaption(caption:string,slot:VisualSlot){
 if(!/Ảnh minh họa AI|Illustration|Bối cảnh sử dụng sản phẩm|Mã QR trong ảnh không dùng để quét/i.test(caption))return caption;
 const file=visualSlots.find(s=>s[0]===slot)?.[2];
 return photoCaptions[file||'technology'];
}
export function defaultVisuals():VisualImages {
  return {...Object.fromEntries(visualSlots.filter(s=>s[2]).map(([key,,file,alt])=>[key,{src:`/images/qavio/${file}.webp`,width:file==='qr-cafe'||file==='technology'||file==='about-business-v2'?1600:1200,height:file==='about-business-v2'?1200:900,alt,caption:photoCaptions[file||'technology'],origin:'AI'}])),
    ...productDemoVisuals,
  };
}
