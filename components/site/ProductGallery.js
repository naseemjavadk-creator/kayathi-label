'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { ZoomInIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@/components/Icons';

export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(null);

  if (!images.length) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-burgundy via-logo to-burgundy-dark">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <Image
            src="/brand/logo-on-burgundy.png"
            alt={name || 'KAYATHI LABEL'}
            width={360}
            height={289}
            sizes="280px"
            className="h-auto w-3/5 max-w-[240px] object-contain opacity-90"
          />
        </div>
      </div>
    );
  }

  const total = images.length;
  const prev = () => setI((curr) => (curr - 1 + total) % total);
  const next = () => setI((curr) => (curr + 1) % total);

  function handleTouchStart(e) {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null || total <= 1) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
  }

  return (
    <div>
      <div
        className="group relative aspect-[3/4] overflow-hidden bg-gold/20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={images[i].url}
          src={images[i].url}
          alt={`${name} - photo ${i + 1}`}
          fill
          priority={i === 0}
          sizes="(min-width:1024px) 50vw, 100vw"
          onClick={() => setZoomed((z) => !z)}
          className={`cursor-zoom-in object-cover transition-transform duration-300 ${
            zoomed ? 'scale-150 cursor-zoom-out' : ''
          }`}
        />

        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          aria-label={zoomed ? 'Reset image zoom' : 'Zoom product image'}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow transition hover:bg-ivory"
        >
          {zoomed ? <CloseIcon className="h-4 w-4" /> : <ZoomInIcon className="h-4 w-4" />}
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow transition hover:bg-ivory"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow transition hover:bg-ivory"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((im, n) => (
            <li key={im.url}>
              <button
                type="button"
                onClick={() => {
                  setI(n);
                  setZoomed(false);
                }}
                aria-label={`Show photo ${n + 1} of ${name}`}
                aria-current={n === i}
                className={`relative block aspect-square w-full overflow-hidden border-2 ${
                  n === i ? 'border-burgundy' : 'border-transparent'
                }`}
              >
                <Image src={im.url} alt={`${name} thumbnail ${n + 1}`} fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
