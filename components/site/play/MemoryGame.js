'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { burst } from '@/lib/burst';

const COLOURS = [
  ['Maroon', '#64152D'], ['Gold', '#C9A45C'], ['Ivory', '#E9DFC9', true],
  ['Emerald', '#2F5D4A'], ['Rose', '#B5546B'], ['Plum', '#5D4A7A'],
];
const shuffled = () => [...COLOURS, ...COLOURS].map((c) => ({ c, r: Math.random() })).sort((a, b) => a.r - b.r);

export default function MemoryGame() {
  const [cards, setCards] = useState([]); // filled after load so server and browser agree
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  useEffect(() => { setCards(shuffled()); }, []);
  const won = matched.length === COLOURS.length;
  useEffect(() => {
    if (!won) return;
    const t = setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, 26), 500);
    return () => clearTimeout(t);
  }, [won]);

  function reset() { setCards(shuffled()); setOpen([]); setMatched([]); setMoves(0); setLock(false); }

  function flip(i) {
    if (lock || open.includes(i) || matched.includes(cards[i].c[0])) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (cards[a].c[0] === cards[b].c[0]) {
      setMatched((m) => [...m, cards[a].c[0]]);
      setOpen([]);
    } else {
      setLock(true);
      setTimeout(() => { setOpen([]); setLock(false); }, 900);
    }
  }

  return (
    <div>
      <div className="mb-4 flex max-w-[460px] items-center justify-between">
        <span className="text-sm text-espresso/70" aria-live="polite">Moves: {moves}</span>
        <button type="button" className="btn btn-outline !px-4 !py-2" onClick={reset}>Shuffle</button>
      </div>
      <div className="mg">
        {cards.map((x, i) => {
          const faceUp = open.includes(i) || matched.includes(x.c[0]);
          return (
            <button key={i} type="button" onClick={() => flip(i)} aria-label={faceUp ? x.c[0] : `Card ${i + 1}`}
              className={`mc ${faceUp ? 'flip' : ''} ${matched.includes(x.c[0]) ? 'ok' : ''}`}>
              <span className="in">
                <span className="bk" />
                <span className="fr" style={{ background: x.c[1], color: x.c[2] ? '#291B1D' : undefined }}>{x.c[0]}</span>
              </span>
            </button>
          );
        })}
      </div>
      {won && (
        <div className="qa-in mt-6">
          <h2 className="text-4xl">You matched them all</h2>
          <p className="mb-4 mt-1 text-sm text-espresso/65">Finished in {moves} moves.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-outline" onClick={reset}>Play again</button>
            <Link href="/shop" className="btn btn-primary">Browse the collection</Link>
          </div>
        </div>
      )}
    </div>
  );
}
