import Catalogue from '@/components/site/Catalogue';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Shop all',
  description: 'Browse sarees, jewellery, bangles, rings and accessories from KAYATHI LABEL.',
};

export default function Shop({ searchParams }) {
  return <Catalogue searchParams={searchParams} basePath="/shop" title="All collections" />;
}
