import Link from 'next/link';
import { getComingSoon, getSettings } from '@/lib/data';
import { SoonCard } from '@/components/site/ComingSoon';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Coming soon',
  description: 'New pieces on their way to KAYATHI LABEL. Message us on WhatsApp to be told when they arrive.',
};

export default async function ComingSoonPage() {
  const [items, settings] = await Promise.all([getComingSoon(), getSettings()]);
  return (
    <div className="container-x py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl">Coming soon</h1>
      <p className="mt-3 max-w-xl text-espresso/75">
        New pieces on their way to KAYATHI LABEL. Tap Notify me and we will message you on WhatsApp when they arrive.
      </p>
      {items.length ? (
        <div className="soon-grid">
          {items.map((it) => (<SoonCard key={it.id} item={it} whatsapp={settings.whatsapp} />))}
        </div>
      ) : (
        <div className="mt-8 max-w-md border border-espresso/15 bg-white p-6">
          <p className="font-serif text-2xl">Nothing announced right now</p>
          <p className="mt-2 text-espresso/75">Check back soon, or browse what is in stock.</p>
          <Link href="/shop" className="btn btn-primary mt-5">Browse the collection</Link>
        </div>
      )}
    </div>
  );
}
