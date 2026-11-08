'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Shows the whole banner image (16:9). If the banner already contains its own text and
// button, leave the headline and subtitle empty in the dashboard and nothing is added on top.
export default function BannerSlider({ banners }) {
  const [i, setI] = useState(0);
  const b = banners[i];
  const hasText = Boolean(b.title || b.subtitle);
  return (
    <section className="relative bg-logo" aria-roledescription="carousel" aria-label="Featured banners">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', maxHeight: '88vh' }}>
        <Image key={b.id} src={b.image_url} alt={b.title || 'KAYATHI LABEL banner'} fill priority sizes="100vw" className="object-cover" />
        <Link href={b.link_url || '/shop'} aria-label={b.title || 'Shop now'} className="absolute inset-0" />
        {hasText && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent">
            <div className="container-x absolute inset-x-0 bottom-0 pb-8 md:pb-14">
              {b.title && <h1 className="max-w-2xl !text-ivory text-3xl md:text-6xl">{b.title}</h1>}
              {b.subtitle && <p className="mt-3 max-w-xl text-ivory/90 md:text-lg">{b.subtitle}</p>}
              <span className="btn btn-gold pointer-events-auto mt-5">Shop now</span>
            </div>
          </div>
        )}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2" role="tablist">
          {banners.map((x, n) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={`Show banner ${n + 1}`}
              onClick={() => setI(n)}
              className={`h-2.5 w-2.5 rounded-full border border-gold ${n === i ? 'bg-gold' : 'bg-transparent'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
