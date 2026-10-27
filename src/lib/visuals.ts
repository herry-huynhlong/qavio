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
    'dashboard-screen':{src:'/images/qavio/history-dashboard.webp',width:1425,height:2015,alt:'Dashboard QAVIO với doanh thu minh họa 2.084.000đ, 13 bill, 20 lượt gọi món và 5 bàn đang phục vụ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'reports-screen':{src:'/images/qavio/history-today.webp',width:755,height:850,alt:'Báo cáo QAVIO với 13 bill minh họa và cơ cấu thanh toán tiền mặt, thẻ, khác.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'reports-week-screen':{src:'/images/qavio/history-week.webp',width:755,height:715,alt:'Báo cáo tuần minh họa: 15 bill, 2.549.000đ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'reports-month-screen':{src:'/images/qavio/history-month.webp',width:755,height:715,alt:'Báo cáo tháng 10 minh họa: 70 bill, 19.603.000đ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'reports-year-screen':{src:'/images/qavio/history-year.webp',width:1425,height:1600,alt:'Báo cáo năm minh họa: 421 bill, 128.144.000đ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'history-screen':{src:'/images/qavio/history-bills.webp',width:1329,height:989,alt:'Lịch sử 421 bill minh họa, có tra cứu theo ngày.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'tables-screen':{src:'/images/qavio/demo-tables.webp',width:1425,height:1597,alt:'Sơ đồ 10 bàn QAVIO, gồm bàn đang phục vụ, chờ thanh toán và bàn trống.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'service-screen':{src:'/images/qavio/demo-service.webp',width:1440,height:680,alt:'Nhân viên phục vụ QAVIO nhận món và theo dõi yêu cầu của khách.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'menu-admin-screen':{src:'/images/qavio/demo-menu-admin.webp',width:1425,height:3722,alt:'Thực đơn QAVIO với ảnh món, giá bán và trạng thái phục vụ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'menu-screen':{src:'/images/qavio/demo-menu.webp',width:375,height:812,alt:'Menu QR của QAVIO trên điện thoại với ảnh món và giá bán.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'cart-screen':{src:'/images/qavio/demo-cart.webp',width:375,height:812,alt:'Khách chọn ba món trên menu QR QAVIO, tổng tạm tính 210.000đ.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'orders-screen':{src:'/images/qavio/demo-orders.webp',width:1440,height:1000,alt:'Danh sách đơn hàng của QAVIO, tổ chức theo bàn và lượt gọi món.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
    'staff-screen':{src:'/images/qavio/demo-staff-admin.webp',width:1440,height:1000,alt:'Hai nhân viên phục vụ QAVIO đang trong ca, được chủ quán quản lý theo quyền BASIC.',caption:'Giao diện QuánPilot với dữ liệu minh họa.',origin:'SCREENSHOT'},
  };
}
