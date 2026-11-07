import Catalogue from '@/components/site/Catalogue';
import { publicClient } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { data } = await publicClient().from('categories').select('name').eq('slug', params.slug).maybeSingle();
  const name = data?.name || 'Collection';
  return { title: name, description: `Shop ${name.toLowerCase()} from KAYATHI LABEL and order on WhatsApp.` };
}

export default function CategoryPage({ params, searchParams }) {
  return <Catalogue searchParams={searchParams} categorySlug={params.slug} basePath={`/category/${params.slug}`} />;
}
