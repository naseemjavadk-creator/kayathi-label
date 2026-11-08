'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/site/ProductCard';
import { SITE_CONFIG } from '@/config/site';
import { waLink, buildWhatsAppLink } from '@/lib/whatsapp';
import { burst } from '@/lib/burst';

const SEG = [
  ['Sarees', '#64152D', 'sarees'], ['Jewellery', '#B8914E', 'jewellery'], ['Bangles', '#5D4A7A', 'bangles-bracelets'],
  ['Rings', '#2F5D4A', 'rings'], ['Accessories', '#B5546B', 'accessories'], ['New arrivals', '#8C6B3A', 'new'],
];
const soldOut = (p) => !p.is_available || p.stock <= 0;
const gradient = SEG.map((s, i) => `${s[1]} ${i * 60}deg ${(i + 1) * 60}deg`).join(',');

export default function SpinWheel({ products, whatsapp = SITE_CONFIG.whatsapp }) {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spun, setSpun] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setSpun(true);
    const idx = Math.floor(Math.random() * SEG.length);
    const jitter = (Math.random() - 0.5) * 36;
    const target = (((360 - (idx * 60 + 30 + jitter)) % 360) + 360) % 360;
    setRot((r) => r + ((((target - (r % 360)) % 360) + 360) % 360) + 360 * 5);
    timer.current = setTimeout(() => {
      setSpinning(false);
      const seg = SEG[idx];
      const pool = products.filter((p) => !soldOut(p) && (seg[2] === 'new' ? p.is_new : p.categories?.slug === seg[2]));
      const p = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
      setResult({ seg, p });
      burst(window.innerWidth / 2, window.innerHeight / 2, 22);
    }, 4400);
  }

  const discountCfg = SITE_CONFIG.wheelDiscount;
  const categoryHref = result
    ? result.seg[2] === 'new'
      ? '/new-arrivals'
      : `/category/${result.seg[2]}`
    : '/shop';
  const waHref = result
    ? result.p
      ? buildWhatsAppLink({ product: result.p, whatsapp })
      : waLink(
          whatsapp,
          `Hello KAYATHI LABEL! The Spin Wheel picked "${result.seg[0]}" for me${
            discountCfg?.enabled && discountCfg?.code ? ` (Code: ${discountCfg.code})` : ''
          }. I would like to order from this collection.`
        )
    : '#';

  return (
    <div className="text-center">
      <div className="wheel-wrap">
        <div className="ptr" />
        <div className="wheel" style={{ background: `conic-gradient(${gradient})`, transform: `rotate(${rot}deg)` }}>
          {SEG.map((s, i) => (
            <span key={s[0]} style={{ transform: `rotate(${i * 60 + 30 - 90}deg)` }}>{s[0]}</span>
          ))}
        </div>
        <div className="hub" />
      </div>
      <button type="button" onClick={spin} disabled={spinning} className="btn btn-primary mt-7">
        {spun ? 'Spin again' : 'Spin the wheel'}
      </button>
      <div className="mt-8" aria-live="polite">
        {result && (
          <div className="qa-in space-y-5">
            <p className="text-base text-espresso/80">
              Today the wheel picked <b className="font-medium text-burgundy">{result.seg[0]}</b>!
            </p>
            {discountCfg?.enabled && discountCfg?.message && (
              <div className="mx-auto max-w-md border border-gold-deep bg-gold/25 px-4 py-3 text-sm font-medium text-burgundy">
                {discountCfg.message}
              </div>
            )}
            {result.p && (
              <div className="mx-auto max-w-[220px] text-left">
                <ProductCard p={result.p} />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href={categoryHref} className="btn btn-primary">
                See your picks
              </Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                Order on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
