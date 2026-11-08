import Catalogue from '@/components/site/Catalogue';
import { publicClient, siteUrl, sortedImages, filterVisibleProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }) {
  const db = publicClient();
  const { data } = await db
    .from('categories')
    .select('id,name,slug,subcategories(name,slug)')
    .eq('slug', params.slug)
    .maybeSingle();

  const catName = data?.name || 'Collection';
  const subSlug = searchParams?.sub;
  const sub = subSlug ? (data?.subcategories || []).find((s) => s.slug === subSlug) : null;
  const focusName = sub?.name || catName;
  const title = `${focusName} Online`;
  const description = `Shop handpicked ${focusName.toLowerCase()} online at KAYATHI LABEL. Explore traditional Indian weaves & jewellery and order directly on WhatsApp with delivery across India.`;
  const canonicalPath = sub ? `/category/${params.slug}?sub=${sub.slug}` : `/category/${params.slug}`;

  let ogImage = `${siteUrl()}/brand/hero-banner.jpg`;
  if (data?.id) {
    const { data: prods } = await db
      .from('products')
      .select('id,name,sku,product_images(url,sort_order)')
      .eq('is_published', true)
      .eq('category_id', data.id)
      .limit(10);
    const firstWithImg = filterVisibleProducts(prods || []).find((p) => sortedImages(p).length > 0);
    if (firstWithImg) ogImage = sortedImages(firstWithImg)[0].url;
  }

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}${canonicalPath}` },
    openGraph: {
      title: `${title} | KAYATHI LABEL`,
      description,
      url: `${siteUrl()}${canonicalPath}`,
      type: 'website',
      images: [{ url: ogImage, alt: `${focusName} at KAYATHI LABEL` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | KAYATHI LABEL`,
      description,
      images: [ogImage],
    },
  };
}

export default function CategoryPage({ params, searchParams }) {
  return <Catalogue searchParams={searchParams} categorySlug={params.slug} basePath={`/category/${params.slug}`} />;
}
