export const visualSlots = [
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
    'dashboard-screen':{src:'/images/qavio/dashboard-thien-dao.webp',width:953,height:760,alt:'Tổng quan QuánPilot của quán Thiên Đảo với quyền TRAIN/BASIC.',caption:'Tổng quan hoạt động nhà hàng trên QuánPilot.',origin:'SCREENSHOT'},
    'service-screen':{src:'/images/qavio/service-thien-dao.webp',width:1233,height:600,alt:'Màn phục vụ QuánPilot với các tab món chờ đi, yêu cầu khách và bảng trạng thái bàn.',caption:'Theo dõi món chờ, yêu cầu khách và trạng thái bàn trong ca phục vụ.',origin:'SCREENSHOT'},
    'tables-screen':{src:'/images/qavio/tables-thien-dao.webp',width:953,height:620,alt:'Sơ đồ bàn khu vực A với trạng thái đang phục vụ và đang trống.',caption:'Theo dõi trạng thái bàn theo từng khu vực.',origin:'SCREENSHOT'},
    'reports-screen':{src:'/images/qavio/reports-thien-dao.webp',width:968,height:520,alt:'Báo cáo doanh thu và danh sách thanh toán QuánPilot khi chưa có hóa đơn.',caption:'Xem doanh thu và tra cứu các khoản thanh toán.',origin:'SCREENSHOT'},
    'menu-admin-screen':{src:'/images/qavio/menu-admin-thien-dao.webp',width:953,height:730,alt:'Quản lý thực đơn QuánPilot với ảnh món, tên món, giá bán và trạng thái.',caption:'Cập nhật món, giá bán và trạng thái phục vụ.',origin:'SCREENSHOT'},
  };
}
