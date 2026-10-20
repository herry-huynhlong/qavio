"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="admin-alert error" role="alert"><h2>Chưa thể tải dữ liệu</h2><p>Kiểm tra kết nối và thử lại. Thông tin nhạy cảm không được hiển thị tại đây.</p><button className="admin-button" onClick={reset}>Thử lại</button></div>;}
