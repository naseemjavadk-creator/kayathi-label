'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RunwayLookbook from './RunwayLookbook';

/**
 * One sheet per category (Earrings, Chains, Bracelets, each saree type…). Pick a sheet from the
 * swipeable row of buttons, then swipe the runway to go through every product in it.
 */
export default function LookbookSheets({ sheets = [], title, intro, lookLabel, shopText }) {
  const [id, setId] = useState(sheets[0]?.id);
  // Where the runway starts in the chosen sheet: 0 = first item, -1 = last item
  // (used when swiping backwards out of the next category).
  const [start, setStart] = useState(0);
  const [moved, setMoved] = useState(false);
  const [visit, setVisit] = useState(0); // bumps on every change so the runway restarts cleanly
  const barRef = useRef(null);

  // Allow linking straight to a sheet: /lookbook#earrings
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
    if (!slug) return;
    const s = sheets.find((x) => x.href.toLowerCase().endsWith(`=${slug}`) || x.href.toLowerCase().endsWith(`/${slug}`) || x.title.toLowerCase() === slug);
    if (s) { setStart(0); setId(s.id); }
  }, [sheets]);

  // Keep the chosen button in view in the row.
  useEffect(() => {
    const btn = barRef.current?.querySelector('[aria-selected="true"]');
    btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [id]);

  if (!sheets.length) return null;
  const index = Math.max(0, sheets.findIndex((s) => s.id === id));
  const sheet = sheets[index];

  // Swiping past the last item opens the next category; swiping back past the
  // first item opens the previous one at its last item. Loops at both ends.
  const onBoundary = (dir) => {
    const next = sheets[(index + dir + sheets.length) % sheets.length];
    setStart(dir > 0 ? 0 : next.looks.length - 1);
    setMoved(true);
    setVisit((v) => v + 1);
    setId(next.id);
  };

  return (
    <div>
      <div className="container-x pb-5">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {intro && <p className="mt-2 text-sm text-espresso/70">{intro}</p>}
        <div
          ref={barRef}
          role="tablist"
          aria-label="Lookbook categories"
          className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
        >
          {sheets.map((s) => {
            const on = s.id === sheet.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => { setStart(0); setVisit((v) => v + 1); setId(s.id); }}
                className={`flex shrink-0 snap-start items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm tracking-wide transition-colors ${
                  on ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/20 bg-white text-espresso hover:border-burgundy'
                }`}
              >
                <span className="relative h-9 w-9 overflow-hidden rounded-full bg-gold/30">
                  {s.thumb && <Image src={s.thumb} alt="" fill sizes="36px" className="object-cover" />}
                </span>
                {s.title}
                <span className={`text-xs ${on ? 'text-gold' : 'text-espresso/50'}`}>{s.looks.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" aria-label={sheet.title}>
        <RunwayLookbook
          key={`${sheet.id}:${visit}`}
          looks={sheet.looks}
          startIndex={start}
          onBoundary={sheets.length > 1 ? onBoundary : undefined}
          hideHint={moved}
          title={sheet.title}
          lookLabel={lookLabel}
          shopText={shopText}
        />
        <div className="container-x pt-3 text-right">
          <Link href={sheet.href} className="text-sm text-burgundy underline-offset-4 hover:underline">
            See all {sheet.title} in the shop →
          </Link>
        </div>
      </div>
    </div>
  );
}
