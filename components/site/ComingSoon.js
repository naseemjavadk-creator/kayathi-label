import Link from 'next/link';
import Photo from './Photo';
import Reveal from './Reveal';
import { waLink } from '@/lib/whatsapp';

const fill = (items, n) => {
  const out = [];
  while (out.length < n) out.push(...items);
  return out;
};

// Gold ticker across the top of every page.
export function ComingSoonTicker({ items }) {
  if (!items.length) return null;
  const one = fill(items, 8);
  return (
    <Link href="/coming-soon" className="tick" aria-label={`Coming soon: ${items.map((i) => i.title).join(', ')}`}>
      <div className="tr" aria-hidden="true">
        {[0, 1].flatMap((k) =>
          one.map((it, n) => (
            <span key={`${k}-${n}`}>✦ COMING SOON: {it.title}{it.note ? ` · ${it.note}` : ''}</span>
          ))
        )}
      </div>
    </Link>
  );
}

export function SoonCard({ item, whatsapp }) {
  const msg = `Hello KAYATHI LABEL! Please let me know when "${item.title}" arrives.`;
  return (
    <div className="sc">
      <div className="relative aspect-[3/4] overflow-hidden bg-gold/25">
        <Photo src={item.image_url || null} alt={item.title} sizes="210px" />
        <span className="rib">Coming soon</span>
      </div>
      <h3>{item.title}</h3>
      {item.note && <p className="mb-2.5 mt-0.5 text-sm text-espresso/70">{item.note}</p>}
      <a href={waLink(whatsapp, msg)} target="_blank" rel="noopener noreferrer" className="btn btn-outline !px-4 !py-2">Notify me on WhatsApp</a>
    </div>
  );
}

// Slowly running row of cards on the homepage.
export function ComingSoonRow({ items, whatsapp }) {
  if (!items.length) return null;
  const one = fill(items, 6);
  return (
    <Reveal as="section" className="py-12 md:py-16">
      <div className="container-x mb-7 flex items-end justify-between gap-4">
        <h2 className="text-3xl md:text-4xl">Coming soon</h2>
        <Link href="/coming-soon" className="shrink-0 text-sm text-burgundy underline-offset-4 hover:underline">See all</Link>
      </div>
      <div className="mq">
        <div className="mt">
          {[0, 1].flatMap((k) => one.map((it, n) => <SoonCard key={`${k}-${n}`} item={it} whatsapp={whatsapp} />))}
        </div>
      </div>
    </Reveal>
  );
}
