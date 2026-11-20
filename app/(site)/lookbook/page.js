import Link from 'next/link';
import LookbookSheets from '@/components/site/LookbookSheets';
import { loadLookbook } from '@/lib/lookbook';
import { LOOKBOOK_CONFIG } from '@/config/lookbook';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Runway Lookbook',
  description: 'Walk the KAYATHI LABEL runway: handpicked sarees styled with jewellery, ready to shop look by look.',
  alternates: { canonical: '/lookbook' },
};

export default async function LookbookPage() {
  const groups = await loadLookbook().catch(() => []);
  if (!groups.length) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="text-4xl">Lookbook coming soon</h1>
        <Link href="/shop" className="btn btn-primary mt-8">Shop now</Link>
      </section>
    );
  }
  return (
    <div className="pt-8 md:pt-12">
    <LookbookSheets
      sheets={groups}
      title={LOOKBOOK_CONFIG.title}
      intro={LOOKBOOK_CONFIG.intro}
      lookLabel={LOOKBOOK_CONFIG.lookLabel}
      shopText={LOOKBOOK_CONFIG.shopText}
    />
    </div>
  );
}
