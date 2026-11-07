import Catalogue from '@/components/site/Catalogue';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'New arrivals',
  description: 'The latest sarees, jewellery, bangles and accessories at KAYATHI LABEL.',
};

export default function NewArrivals({ searchParams }) {
  return <Catalogue searchParams={searchParams} basePath="/new-arrivals" onlyNew title="New arrivals" />;
}
