'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_LOGO } from './Logo';

// Opening screen: the logo fades in, a gold line draws, then the screen lifts away upward.
// Shown once per browser session; any tap or key skips it.
export default function Splash({ logoSrc }) {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    if (phase !== 'in') return;
    try { sessionStorage.setItem('kl_splash', '1'); } catch {}
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPhase('gone'); return; }
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => setPhase('out'), 3000);
    const skip = () => setPhase('out');
    window.addEventListener('keydown', skip, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('keydown', skip); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'out') return;
    document.body.style.overflow = '';
    const t = setTimeout(() => setPhase('gone'), 1300);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;
  return (
    <div id="splash" className={phase === 'out' ? 'out' : ''} aria-hidden="true" onClick={() => setPhase('out')}>
      <div className="inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc || DEFAULT_LOGO} alt="" width={747} height={600} />
        <div className="ln" />
        <div className="tg">THE ART OF ETHNIC ELEGANCE</div>
      </div>
    </div>
  );
}
