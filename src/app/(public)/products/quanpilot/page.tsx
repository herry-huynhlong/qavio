import {MarketingProduct} from '@/components/marketing-product';
import {cmsMetadata} from '@/server/cms-seo';
export async function generateMetadata(){return cmsMetadata('/products/quanpilot','PRODUCT','quanpilot');}
export default MarketingProduct;
