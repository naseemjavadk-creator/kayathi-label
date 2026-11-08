'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/site/ProductCard';
import { waLink } from '@/lib/whatsapp';
import { SITE_CONFIG } from '@/config/site';
import { inr } from '@/lib/format';
import { burst } from '@/lib/burst';

const QUIZ = [
  { q: 'What are you shopping for?', a: [['A saree', 'saree'], ['Jewellery', 'jewellery'], ['Bangles and rings', 'bangle'], ['Little extras', 'accessories']] },
  { q: 'Pick a colour mood', a: [['Deep maroon', 'maroon'], ['Soft gold', 'gold'], ['Fresh green', 'green'], ['Ivory and light', 'ivory']] },
  { q: 'What is the occasion?', a: [['Wedding or festival', 'festive'], ['Party night', 'party'], ['Everyday elegance', 'daily']] },
];
const CATS = { saree: ['sarees'], jewellery: ['jewellery'], bangle: ['bangles-bracelets', 'rings'], accessories: ['accessories'] };
const SYN = { maroon: ['maroon', 'red', 'burgundy'], gold: ['gold', 'antique'], green: ['green', 'emerald'], ivory: ['ivory', 'white', 'cream'] };
const soldOut = (p) => !p.is_available || p.stock <= 0;

function pick(products, [what, colour, occ]) {
  const cats = CATS[what] || [];
  const syn = SYN[colour] || [colour];
  return products
    .filter((p) => !soldOut(p))
    .map((p) => {
      let s = 0;
      if (cats.includes(p.categories?.slug)) s += 4;
      if ((p.colours || []).some((c) => syn.some((k) => c.toLowerCase().includes(k)))) s += 3;
      if (occ === 'festive' && (p.is_featured || p.subcategories?.name === 'Festive Collection')) s += 1;
      if (occ === 'party' && (p.is_best_seller || p.is_new)) s += 1;
      if (occ === 'daily' && Number(p.price) <= 2500) s += 1;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s || String(b.p.id).localeCompare(String(a.p.id)))
    .slice(0, 3)
    .map((x) => x.p);
}

export default function QuizGame({ products, whatsapp }) {
  const [ans, setAns] = useState([]);
  const step = ans.length;
  const done = step === QUIZ.length;
  const picks = useMemo(() => (done ? pick(products, ans) : []), [done, products, ans]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 3, 22), 250);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (!done) {
    const q = QUIZ[step];
    return (
      <div key={step}>
        <div className="mb-3 h-1 bg-espresso/15"><div className="bar-in h-full bg-gold" style={{ width: `${(step / QUIZ.length) * 100}%` }} /></div>
        <p className="text-sm text-espresso/65">Question {step + 1} of {QUIZ.length}</p>
        <h2 className="mb-5 mt-1 text-4xl">{q.q}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {q.a.map(([label, value], i) => (
            <button key={value} type="button" onClick={() => setAns([...ans, value])} style={{ animationDelay: `${i * 60}ms` }}
              className="qa-in border border-espresso/20 bg-white px-5 py-4 text-left text-lg transition hover:-translate-y-0.5 hover:border-burgundy">
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const matchedCategorySlug = (CATS[ans[0]] && CATS[ans[0]][0]) || 'sarees';
  const categoryHref = `/category/${matchedCategorySlug}`;

  const msg = picks.length
    ? [
        'Hello KAYATHI LABEL!',
        '',
        'I would like to order this from my Style Quiz picks:',
        '',
        ...picks.map((p, n) => `${n + 1}. ${p.name} (ID: ${p.sku}) — ${inr(p.price)}`),
        '',
        'Please confirm availability and delivery details.',
      ].join('\n')
    : `Hello KAYATHI LABEL! I completed the Style Quiz (${ans.join(', ')}) and would like to order from your ${matchedCategorySlug} collection.`;

  return (
    <div className="qa-in">
      <h2 className="text-4xl">Your style picks</h2>
      <p className="mb-6 mt-1 text-sm text-espresso/65">Chosen for your style and occasion preferences.</p>
      {picks.length > 0 && (
        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {picks.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href={categoryHref} className="btn btn-primary">
          See your picks
        </Link>
        <a
          href={waLink(whatsapp || SITE_CONFIG.whatsapp, msg)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold"
        >
          Order on WhatsApp
        </a>
        <button type="button" className="btn btn-outline" onClick={() => setAns([])}>
          Try again
        </button>
      </div>
    </div>
  );
}
