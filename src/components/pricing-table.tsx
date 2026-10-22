"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import { pricingSchema, type PublicPricing } from '@/lib/pricing-contract';
import styles from './pricing-table.module.css';
const descriptions = {
  BASIC: 'Giải pháp quản lý thiết yếu cho nhà hàng và quán nước.',
  PRO: 'Kết nối phục vụ, bếp, thu ngân và quản lý trên cùng hệ thống.',
};
const vnd = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
export function PricingTable({initial, loginUrl}: {initial:PublicPricing|null;loginUrl:string}) {
  const [data, setData] = useState(initial);
  const [term, setTerm] = useState<3|6|12>(12);
  useEffect(() => {
    let active = true, running = false;
    const controller = new AbortController();
    const refresh = async () => {
      if (running) return;
      running = true;
      try {
        const response = await fetch('/api/public/pricing', {cache:'no-store', signal:AbortSignal.any([controller.signal, AbortSignal.timeout(5000)])});
        if (!response.ok) throw new Error('Unavailable');
        const value = pricingSchema.parse(await response.json());
        if (active) setData(Date.parse(value.validUntil) > Date.now() ? value : null);
      } catch { if (active) setData(current => current && Date.parse(current.validUntil) > Date.now() ? current : null); }
      finally { running = false; }
    };
    const poll = setInterval(refresh, 15_000);
    const visibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { active = false; controller.abort(); clearInterval(poll); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => setData(current => current?.version === data.version && current.validUntil === data.validUntil ? null : current), Math.max(0, Date.parse(data.validUntil) - Date.now()));
    return () => clearTimeout(timer);
  }, [data]);
  return <div className={styles.wrap}>
    <div className={styles.terms} role="group" aria-label="Thời hạn thanh toán">
      {([3,6,12] as const).map(months => <button key={months} type="button" aria-pressed={term === months} onClick={() => setTerm(months)}>{months} tháng</button>)}
    </div>
    <p className={styles.termCaption}>Chọn kỳ thanh toán phù hợp với quán của bạn.</p>
    <div className={styles.grid}>
      {(['BASIC','PRO'] as const).map(plan => {
        const price = data?.prices.find(p => p.plan === plan && p.termMonths === term);
        return <article key={plan} className={`${styles.card} ${plan === 'PRO' ? styles.pro : ''}`} data-plan={plan}>
          <div className={styles.cardTop}><h2>{plan}</h2>{plan === 'PRO' && <span className={styles.label}>Gói nâng cao</span>}</div>
          <p className={styles.description}>{descriptions[plan]}</p>
          <div className={styles.priceArea} aria-live="polite" aria-atomic="true">
            {price ? <>
              <div className={styles.offer}>{price.originalPriceVnd !== null && <><del>{vnd(price.originalPriceVnd)} / {term} tháng</del><span className={styles.discount}>{price.discountBasisPoints > 0 ? `Giảm ${(price.discountBasisPoints / 100).toLocaleString('vi-VN', {maximumFractionDigits:2})}%` : `Tiết kiệm ${vnd(price.originalPriceVnd - price.priceVnd)}`}</span></>}</div>
              <p className={styles.price}><strong>{vnd(price.monthlyPriceVnd)}</strong><span>/tháng</span></p>
              <p className={styles.average}>Bình quân mỗi tháng · làm tròn đến đồng</p>
              <p className={styles.total}>Tổng {term} tháng: <strong>{vnd(price.priceVnd)}</strong></p>
            </> : <><p className={styles.fallback}>Liên hệ nhận báo giá</p><p className={styles.average}>Trao đổi cùng QAVIO về gói phù hợp.</p></>}
          </div>
          <Link className={`${styles.cta} ${plan === 'PRO' ? styles.gold : ''}`} href={price ? '/trial' : '/contact'}>{price ? 'Đăng ký dùng thử' : 'Liên hệ QAVIO'}<ArrowUpRight size={18}/></Link>
          <p className={styles.featureHeading}>Dành cho vận hành của bạn</p>
          <ul className={styles.features}>{(price?.features ?? ['Tìm hiểu giải pháp phù hợp với nhu cầu của quán']).map(feature => <li key={feature}><Check size={17} aria-hidden="true"/><span>{feature}</span></li>)}</ul>
        </article>;
      })}
    </div>
    <p className={styles.existing}>Đã có tài khoản? <a href={loginUrl}>Đăng nhập QuánPilot để quản lý gói <ArrowUpRight size={15}/></a></p>
    <p className={styles.note}>Giá PRO dành cho đăng ký và gia hạn thông thường. Điều kiện nâng cấp được xem trong tài khoản của bạn.</p>
  </div>;
}
