"use client";

import Link from 'next/link';
import { useId, useRef, useState } from 'react';

type Kind = 'contact' | 'demo' | 'subscribe';
export function InquiryForm({ kind }: { kind: Kind }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [checked, setChecked] = useState(false);
  const fieldId = (name: string) => `${id}-${name}`;
  const validate = () => {
    setChecked(false);
    for (const control of Array.from(form.current?.elements ?? [])) {
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
        control.setCustomValidity('');
        if (control.required && (control instanceof HTMLInputElement && control.type === 'checkbox' ? !control.checked : !control.value.trim())) {
          control.setCustomValidity('Vui lòng hoàn thành mục bắt buộc này.');
        } else if (control.validity.typeMismatch) control.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ.');
        else if (control.validity.patternMismatch) control.setCustomValidity('Vui lòng nhập số điện thoại hợp lệ theo hướng dẫn của trường.');
        else if (control instanceof HTMLInputElement && control.type === 'tel' && !/^[0-9]{8,15}$/.test(control.value.replace(/[^0-9]/g, ''))) control.setCustomValidity('Số điện thoại cần từ 8 đến 15 chữ số.');
      }
    }
    if (form.current?.reportValidity()) setChecked(true);
  };
  return <div className="form-card">
    <h2>{kind === 'subscribe' ? 'Chuẩn bị đăng ký nhận tin' : kind === 'demo' ? 'Nhu cầu tư vấn / demo' : 'Nội dung bạn muốn trao đổi'}</h2>
    <div className="notice" id={`${id}-availability`}><strong>Tính năng gửi chưa được kích hoạt</strong><p>Bạn có thể điền và kiểm tra thông tin. Nội dung chưa được gửi đến QAVIO. Khi mở đăng ký chính thức, website sẽ thông báo rõ cách tiếp nhận và xử lý dữ liệu.</p></div>
    <noscript><p className="notice">Cần bật JavaScript để kiểm tra thông tin. Website hiện không nhận đăng ký qua biểu mẫu này.</p></noscript>
    <form ref={form} aria-describedby={`${id}-availability`} onSubmit={event => { event.preventDefault(); validate(); }} onChange={event => {
      setChecked(false);
      const control = event.target;
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.setCustomValidity('');
    }} onKeyDown={event => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'checkbox') { event.preventDefault(); validate(); }
    }}>
      {/* Blocks implicit browser submission (and URL disclosure) even before hydration. */}
      <button type="submit" disabled hidden aria-hidden="true" tabIndex={-1}>Gửi chưa khả dụng</button>
      <div className="form-grid">
        <label htmlFor={fieldId('name')}>Họ và tên {kind !== 'subscribe' ? <span>(bắt buộc)</span> : <span>(tùy chọn)</span>}<input id={fieldId('name')} name="name" autoComplete="name" required={kind !== 'subscribe'} minLength={2} maxLength={120} /></label>
        <label htmlFor={fieldId('email')}>Email <span>(bắt buộc)</span><input id={fieldId('email')} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        {kind !== 'subscribe' && <>
          <label htmlFor={fieldId('phone')}>Số điện thoại <span>(bắt buộc)</span><input id={fieldId('phone')} name="phone" type="tel" autoComplete="tel" required pattern={"\\+?[0-9][0-9 .\\-]{6,22}[0-9]"} minLength={8} maxLength={24} title="Nhập từ 8 đến 24 ký tự: chữ số, khoảng trắng, chấm, gạch nối; có thể có dấu + ở đầu." /></label>
          <label htmlFor={fieldId('company')}>{kind === 'demo' ? 'Tên nhà hàng hoặc quán' : 'Công ty hoặc nhà hàng'} <span>({kind === 'demo' ? 'bắt buộc' : 'tùy chọn'})</span><input id={fieldId('company')} name="company" autoComplete="organization" required={kind === 'demo'} maxLength={160} /></label>
          {kind === 'demo' ? <>
            <label htmlFor={fieldId('business')}>Loại hình kinh doanh <span>(bắt buộc)</span><select id={fieldId('business')} name="business" defaultValue="" required><option value="" disabled>Chọn loại hình</option><option>Nhà hàng</option><option>Quán ăn</option><option>Quán nước / cà phê</option><option>Khác</option></select></label>
            <label htmlFor={fieldId('locations')}>Số cơ sở <span>(tùy chọn)</span><input id={fieldId('locations')} name="locations" type="number" min={1} max={10000} step={1} /></label>
            <label className="full-field" htmlFor={fieldId('need')}>Nhu cầu chính <span>(bắt buộc)</span><select id={fieldId('need')} name="need" defaultValue="" required><option value="" disabled>Chọn nhu cầu</option> {['Menu QR / gọi món', 'Quản lý bàn và đơn hàng', 'Phối hợp phục vụ, bếp, thu ngân', 'Báo cáo kinh doanh', 'Tìm hiểu tổng thể QuánPilot'].map(value => <option key={value}>{value}</option>)}</select></label>
          </> : <label className="full-field" htmlFor={fieldId('subject')}>Chủ đề liên hệ <span>(bắt buộc)</span><select id={fieldId('subject')} name="subject" defaultValue="" required><option value="" disabled>Chọn chủ đề</option>{['Tìm hiểu sản phẩm', 'Đăng ký tư vấn', 'Yêu cầu báo giá', 'Hỗ trợ', 'Hợp tác', 'Khác'].map(value => <option key={value}>{value}</option>)}</select></label>}
          <label className="full-field" htmlFor={fieldId('message')}>{kind === 'demo' ? 'Lời nhắn (tùy chọn)' : 'Nội dung (bắt buộc)'}<textarea id={fieldId('message')} name="message" rows={5} required={kind === 'contact'} minLength={kind === 'contact' ? 10 : undefined} maxLength={3000} /></label>
        </>}
      </div>
      <label className="consent" htmlFor={fieldId('consent')}><input id={fieldId('consent')} name="consent" type="checkbox" required /><span>{kind === 'subscribe' ? 'Tôi mong muốn nhận thông tin từ QAVIO sau khi xác nhận qua email.' : 'Tôi đồng ý việc xử lý thông tin cho mục đích trao đổi yêu cầu khi tính năng gửi được mở.'} Tôi đã xem <Link href="/privacy">chính sách bảo mật (dự thảo)</Link>. Chưa có bản ghi đồng ý nào được tiếp nhận.</span></label>
      <div className="form-actions"><button className="button" type="button" onClick={validate}>Kiểm tra thông tin</button><button type="button" className="text-link" onClick={() => { form.current?.reset(); setChecked(false); }}>Xóa thông tin đã nhập</button></div>
      <p className="form-status" role="status" aria-live="polite">{checked ? 'Thông tin đã qua kiểm tra trên thiết bị. Chưa có yêu cầu nào được gửi hoặc ghi nhận tại QAVIO; tính năng gửi chưa được kích hoạt.' : 'Thông tin chỉ được dùng để kiểm tra trên trang hiện tại; không lưu vào bộ nhớ trình duyệt hoặc gửi qua biểu mẫu này.'}</p>
    </form>
  </div>;
}
