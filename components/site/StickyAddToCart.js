'use client';
import { useEffect, useRef, useState } from 'react';
import { inr } from '@/lib/format';
import { SITE_CONFIG } from '@/config/site';

/**
 * Slim bar fixed to the bottom of the product page. It stays hidden while the
 * page's own "Add to bag" button is on screen and slides up once that button
 * has scrolled off the top. Size/colour are shared with the main form, so
 * picking one in either place updates both.
 */
export default function StickyAddToCart({
  targetRef,
  product,
  image,
  sizes = [],
  colours = [],
  size,
  colour,
  setSize,
  setColour,
  onAdd,
}) {
  const cfg = SITE_CONFIG.stickyAddToCart || {};
  const enabled = cfg.enabled !== false;
  const mobileOnly = !cfg.desktop;
  const note = cfg.note ?? 'COD available, 7-day easy exchange';

  const barRef = useRef(null);
  const sizeRef = useRef(null);
  const colourRef = useRef(null);
  const [show, setShow] = useState(false);
  const [added, setAdded] = useState(false);
  const [hint, setHint] = useState('');

  // Show the bar once the main button has scrolled off the top of the screen.
  useEffect(() => {
    const el = targetRef?.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, targetRef]);

  // Tell the floating buttons how far to move up while the bar is showing.
  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!bar) return;
    const setH = () => root.style.setProperty('--satc-h', `${bar.offsetHeight}px`);
    setH();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setH) : null;
    ro?.observe(bar);
    if (show) root.dataset.satc = 'on';
    else delete root.dataset.satc;
    if (mobileOnly) root.dataset.satcMobileOnly = '';
    else delete root.dataset.satcMobileOnly;
    return () => {
      ro?.disconnect();
      delete root.dataset.satc;
      delete root.dataset.satcMobileOnly;
    };
  }, [show, mobileOnly]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  if (!enabled) return null;

  const hasCompare = Number(product.original_price) > Number(product.price);

  function handleAdd() {
    if (colours.length > 0 && !colour) {
      setHint('Choose a colour');
      colourRef.current?.focus();
      return;
    }
    if (sizes.length > 0 && !size) {
      setHint('Choose a size');
      sizeRef.current?.focus();
      return;
    }
    setHint('');
    onAdd();
    setAdded(true);
  }

  const selectCls =
    'h-9 min-w-0 flex-1 border border-espresso/25 bg-white px-2 text-sm text-espresso focus:border-burgundy focus:outline-none aria-[invalid=true]:border-red-700';

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Quick add to bag"
      className={`satc ${show ? 'on' : ''} ${mobileOnly ? 'mobile-only' : ''} border-t border-gold-deep/60 bg-ivory shadow-[0_-6px_20px_rgba(41,27,29,0.12)]`}
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 md:px-8">
        <div className="flex items-center gap-3">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={52}
              height={52}
              loading="lazy"
              className="h-[52px] w-[52px] shrink-0 border border-gold/70 object-cover"
            />
          ) : (
            <div className="h-[52px] w-[52px] shrink-0 bg-ivory-deep" aria-hidden="true" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[15px] leading-tight text-espresso">{product.name}</p>
            <p className="mt-0.5 text-sm leading-tight">
              <span className="font-medium text-burgundy">{inr(product.price)}</span>
              {hasCompare && (
                <span className="ml-2 text-xs text-espresso/50 line-through">
                  <span className="sr-only">Was </span>
                  {inr(product.original_price)}
                </span>
              )}
            </p>
            {note && <p className="mt-0.5 truncate text-[11px] leading-tight text-espresso/55">{note}</p>}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="h-11 shrink-0 bg-espresso px-4 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-burgundy-dark focus-visible:outline-gold"
          >
            <span aria-live="polite">{added ? 'Added ✓' : 'Add to bag'}</span>
          </button>
        </div>

        {(colours.length > 0 || sizes.length > 0) && (
          <div className="mt-2 flex items-center gap-2">
            {colours.length > 0 && (
              <select
                ref={colourRef}
                aria-label="Colour"
                aria-invalid={hint === 'Choose a colour' || undefined}
                value={colour}
                onChange={(e) => {
                  setColour(e.target.value);
                  setHint('');
                }}
                className={selectCls}
              >
                <option value="">Colour</option>
                {colours.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            {sizes.length > 0 && (
              <select
                ref={sizeRef}
                aria-label="Size"
                aria-invalid={hint === 'Choose a size' || undefined}
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setHint('');
                }}
                className={selectCls}
              >
                <option value="">Size</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        {hint && (
          <p role="alert" className="mt-1 text-xs text-red-700">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
