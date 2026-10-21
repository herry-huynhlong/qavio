import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {trialConfigured} from '@/server/trial';
export function TrialLink({className='button'}:{className?:string}){return <Link className={className} href="/trial">{trialConfigured()?'Đăng ký dùng thử':'Tìm hiểu đăng ký dùng thử'}<ArrowUpRight size={18}/></Link>;}
export function TrialBanner(){return <section className="visual-cta"><div className="container"><span className="eyebrow">BƯỚC TIẾP THEO CỦA QUÁN</span><h2>Bắt đầu trải nghiệm<br/>QuánPilot ngay hôm nay.</h2><p>{trialConfigured()?'Xác minh Google, tạo quán và trải nghiệm TRAIN / BASIC trong một tháng lịch. Không cần thanh toán trước.':'Tìm hiểu quy trình và trạng thái tiếp nhận ngay tại trang đăng ký.'}</p><div className="hero-actions"><TrialLink/><Link href="/contact" className="text-link">Cần tư vấn trước? →</Link></div></div></section>;}
