import { SITE_CONFIG } from '@/config/site';
import { StarIcon } from '@/components/Icons';
import Reveal from './Reveal';

export default function Testimonials({ items = SITE_CONFIG.testimonials }) {
  if (!items || items.length === 0) return null;
  return (
    <Reveal as="section" aria-label="Customer reviews" className="container-x py-14 md:py-18">
      <div className="mb-8 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-burgundy">Customer love</span>
        <h2 className="mt-1 text-3xl md:text-4xl">What our customers say</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <blockquote
            key={t.id}
            className="flex flex-col justify-between border border-espresso/15 bg-white p-6 shadow-sm"
          >
            <div>
              <div className="mb-3 flex gap-1 text-burgundy" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((n) => (
                  <StarIcon key={n} className="h-4 w-4 text-burgundy" />
                ))}
              </div>
              <p className="font-serif text-lg italic leading-relaxed text-espresso">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            <footer className="mt-5 border-t border-espresso/10 pt-3 text-sm">
              <p className="font-medium text-burgundy">
                {t.author}
                {t.location ? <span className="font-normal text-espresso/65"> · {t.location}</span> : null}
              </p>
              {t.item && <p className="text-xs text-espresso/60">{t.item}</p>}
            </footer>
          </blockquote>
        ))}
      </div>
    </Reveal>
  );
}
