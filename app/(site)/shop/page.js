import Catalogue from '@/components/site/Catalogue';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Shop All Ethnic Wear & Jewellery Online',
  description: 'Browse handpicked sarees, jewellery, bangles, rings and accessories from KAYATHI LABEL. Order directly on WhatsApp with delivery across India.',
  alternates: { canonical: '/shop' },
};

export default function Shop({ searchParams }) {
  return <Catalogue searchParams={searchParams} basePath="/shop" title="All collections" />;
}
