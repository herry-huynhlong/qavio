export const visualSlots = [
  ['hero','Ảnh hero','qr-cafe','Khách dùng điện thoại quét QR tại bàn trong quán cà phê.'],
  ['qr','Khách quét QR','qr-cafe','Khách quét mã QR minh họa tại bàn.'],
  ['service','Phục vụ','service','Nhân viên phục vụ theo dõi công việc bằng tablet.'],
  ['kitchen','Bếp','kitchen','Đầu bếp sử dụng thiết bị trong quá trình chuẩn bị món.'],
  ['cashier','Thu ngân','cashier','Nhân viên thao tác tại quầy thu ngân.'],
  ['owner','Chủ quán','owner','Chủ quán xem laptop trong không gian quán.'],
  ['tables','Không gian nhiều bàn','tables','Không gian nhà hàng và nhân viên phục vụ.'],
  ['solutions','Ảnh giải pháp','tables','Không gian nhà hàng hiện đại.'],
  ['technology','Công nghệ QAVIO','technology','Đồ họa trừu tượng navy và ánh sáng vàng kim.'],
  ['menu-screen','Menu QR — screenshot thật',null,'Giao diện menu khách hàng QuánPilot.'],
  ['cart-screen','Giỏ hàng — screenshot thật',null,'Giao diện giỏ hàng QuánPilot.'],
  ['tables-screen','Quản lý bàn — screenshot thật',null,'Giao diện quản lý bàn QuánPilot.'],
  ['service-screen','Phục vụ — screenshot thật',null,'Giao diện phục vụ QuánPilot.'],
  ['kitchen-screen','Bếp — screenshot thật',null,'Giao diện bếp QuánPilot.'],
  ['cashier-screen','Thu ngân — screenshot thật',null,'Giao diện thu ngân QuánPilot.'],
  ['dashboard-screen','Dashboard — screenshot thật',null,'Dashboard chủ quán QuánPilot.'],
  ['reports-screen','Báo cáo — screenshot thật',null,'Báo cáo doanh thu QuánPilot.'],
] as const;
export type VisualSlot = typeof visualSlots[number][0];
export type VisualImage = {src:string;width:number;height:number;alt:string;caption:string;origin:'AI'|'SCREENSHOT'|'PHOTO'};
export type VisualImages = Partial<Record<VisualSlot,VisualImage>>;
export function defaultVisuals():VisualImages {
  return {...Object.fromEntries(visualSlots.filter(s=>s[2]).map(([key,,file,alt])=>[key,{src:`/images/qavio/${file}.webp`,width:file==='qr-cafe'||file==='technology'?1600:1200,height:900,alt,caption:file==='qr-cafe'?'Ảnh minh họa AI · Mã QR trong ảnh không dùng để quét.':'Ảnh minh họa AI · Bối cảnh sử dụng sản phẩm.',origin:'AI'}])), 'dashboard-screen':{src:'/images/qavio/dashboard-desktop.webp',width:970,height:822,alt:'Dashboard chủ quán QuánPilot Long Phụng, TRAIN quyền BASIC.',caption:'Screenshot QuánPilot thật do chủ dự án cung cấp · TRAIN/BASIC · Đã cắt bỏ tên tài khoản.',origin:'SCREENSHOT'}};
}
