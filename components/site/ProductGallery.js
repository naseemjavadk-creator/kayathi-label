'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0);
  if (!images.length) {
    return (
      <div className="relative aspect-[3/4] bg-gold/30">
        <div className="absolute inset-0 flex items-center justify-center font-serif text-xl italic text-burgundy/60">Photo coming soon</div>
      </div>
    );
  }
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-gold/20">
        <Image key={images[i].url} src={images[i].url} alt={`${name} - photo ${i + 1}`} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((im, n) => (
            <li key={im.url}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`Show photo ${n + 1}`}
                aria-current={n === i}
                className={`relative block aspect-square w-full overflow-hidden border-2 ${n === i ? 'border-burgundy' : 'border-transparent'}`}
              >
                <Image src={im.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
