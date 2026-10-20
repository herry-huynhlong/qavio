import Image from 'next/image';
import { site } from '@/lib/site-config';

export function BrandImage({ priority = false, className = '' }: { priority?: boolean; className?: string }) {
  return <Image src={site.brandImage} width={1536} height={1024}
    alt="QAVIO — biểu tượng Q/A vàng kim, tên QAVIO và năm giá trị Quality, Aesthetic, Vision, Innovation, Originality"
    className={`official-brand ${className}`} sizes="(max-width: 760px) calc(100vw - 40px), 600px" priority={priority} />;
}
