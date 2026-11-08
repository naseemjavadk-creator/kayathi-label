import Link from 'next/link';
import Reveal from './Reveal';
import { WhatsAppIcon } from '@/components/Icons';
import { PROMO_BANNER } from '@/config/collections';
import { SITE_CONFIG } from '@/config/site';
import { waLink } from '@/lib/whatsapp';

export default function PromoBanner({ whatsapp }) {
  const b = PROMO_BANNER;
  if (!b || !b.enabled) return null;

  const nowMs = Date.now();
  if (b.startDate) {
    const startMs = Date.parse(b.startDate);
    if (!Number.isNaN(startMs) && nowMs < startMs) return null;
  }
  if (b.endDate) {
    const endMs = Date.parse(`${b.endDate}T23:59:59`);
    if (!Number.isNaN(endMs) && nowMs > endMs) return null;
  }

  const waHref = waLink(
    whatsapp || SITE_CONFIG.whatsapp,
    'Hello KAYATHI LABEL! I would love styling help matching a saree and jewellery for an upcoming occasion.'
  );

  return (
    <Reveal as="section" className="container-x py-10 md:py-12">
      <div className="relative overflow-hidden border border-gold/40 bg-burgundy px-6 py-10 text-ivory shadow-md md:px-12 md:py-12">
        <div className="pointer-events-none absolute inset-3 border border-gold/25" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            {b.eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-gold">
                {b.eyebrow}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl leading-snug !text-ivory md:text-4xl">
              {b.heading}
            </h2>
            {b.text && (
              <p className="mt-2.5 text-sm leading-relaxed text-ivory/90 md:text-base">
                {b.text}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {b.primaryHref === 'whatsapp' ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {b.primaryLabel}
              </a>
            ) : (
              <Link href={b.primaryHref || '/shop'} className="btn btn-gold">
                {b.primaryLabel}
              </Link>
            )}
            {b.secondaryLabel && b.secondaryHref && (
              <Link href={b.secondaryHref} className="btn btn-outline-light">
                {b.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
