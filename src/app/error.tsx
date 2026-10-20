"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main-content" className="state-page container"><span className="eyebrow">KHÔNG THỂ TẢI NỘI DUNG</span><h1>Kết nối bị gián đoạn.</h1><p>Bạn có thể thử tải lại nội dung.</p><button className="button" onClick={() => reset()}>Thử lại</button></main>; }
