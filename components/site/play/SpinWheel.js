'use client';
import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/site/ProductCard';
import { burst } from '@/lib/burst';

// No prizes: the wheel just picks a collection and one in-stock piece to look at.
const SEG = [
  ['Sarees', '#64152D', 'sarees'], ['Jewellery', '#B8914E', 'jewellery'], ['Bangles', '#5D4A7A', 'bangles-bracelets'],
  ['Rings', '#2F5D4A', 'rings'], ['Accessories', '#B5546B', 'accessories'], ['New arrivals', '#8C6B3A', 'new'],
];
const soldOut = (p) => !p.is_available || p.stock <= 0;
const gradient = SEG.map((s, i) => `${s[1]} ${i * 60}deg ${(i + 1) * 60}deg`).join(',');

export default function SpinWheel({ products }) {
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
      if (p) burst(window.innerWidth / 2, window.innerHeight / 2, 22);
    }, 4400);
  }

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
          <div className="qa-in">
            {result.p ? (
              <>
                <p className="mb-3 text-sm text-espresso/70">Today we suggest a look at <b className="font-medium">{result.seg[0]}</b></p>
                <div className="mx-auto max-w-[220px] text-left"><ProductCard p={result.p} /></div>
              </>
            ) : (
              <p className="text-sm text-espresso/70">The wheel chose {result.seg[0]}, but nothing is in stock there right now. Spin again.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
