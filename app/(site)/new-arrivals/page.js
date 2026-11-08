import Catalogue from '@/components/site/Catalogue';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'New Arrivals Online',
  description: 'Explore the latest handpicked sarees, jewellery, bangles and ethnic accessories at KAYATHI LABEL.',
  alternates: { canonical: '/new-arrivals' },
};

export default function NewArrivals({ searchParams }) {
  return <Catalogue searchParams={searchParams} basePath="/new-arrivals" onlyNew title="New arrivals" />;
}
