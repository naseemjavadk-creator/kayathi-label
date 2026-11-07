// Small gold sparkle burst at a screen position. Skipped when the visitor prefers reduced motion.
export function burst(x, y, n = 14) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'sp';
    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 80;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}
