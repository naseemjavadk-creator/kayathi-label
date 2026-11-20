import Link from 'next/link';
import RunwayLookbook from '@/components/site/RunwayLookbook';
import { loadLookbook } from '@/lib/lookbook';
import { LOOKBOOK_CONFIG } from '@/config/lookbook';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Runway Lookbook',
  description: 'Walk the KAYATHI LABEL runway: handpicked sarees styled with jewellery, ready to shop look by look.',
  alternates: { canonical: '/lookbook' },
};

export default async function LookbookPage() {
  const looks = await loadLookbook().catch(() => []);
  if (!looks.length) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="text-4xl">Lookbook coming soon</h1>
        <Link href="/shop" className="btn btn-primary mt-8">Shop now</Link>
      </section>
    );
  }
  return (
    <RunwayLookbook
      looks={looks}
      title={LOOKBOOK_CONFIG.title}
      intro={LOOKBOOK_CONFIG.intro}
      lookLabel={LOOKBOOK_CONFIG.lookLabel}
      shopText={LOOKBOOK_CONFIG.shopText}
      firstLookNumber={LOOKBOOK_CONFIG.firstLookNumber}
    />
  );
}
