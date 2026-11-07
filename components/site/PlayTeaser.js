'use client';
import { useState } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import QuizGame from './play/QuizGame';
import SpinWheel from './play/SpinWheel';
import MemoryGame from './play/MemoryGame';

export const GAMES = [
  { id: 'quiz', href: '/play/quiz', icon: '?', title: 'Style quiz', text: 'Three quick questions and we pick pieces for you.' },
  { id: 'spin', href: '/play/spin', icon: '✦', title: 'Spin the wheel', text: 'Let the wheel choose a collection to explore today.' },
  { id: 'memory', href: '/play/memory', icon: '◆', title: 'Colour match', text: 'Flip the cards and find every pair of matching colours.' },
];

export function GameCards({ activeGame, onSelect }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GAMES.map((g) => {
        const isActive = activeGame === g.id;
        if (onSelect) {
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(isActive ? null : g.id)}
              className={`group block w-full border p-6 text-left transition duration-300 hover:-translate-y-1.5 hover:border-burgundy hover:shadow-lg ${
                isActive ? 'border-burgundy bg-ivory-deep shadow-md' : 'border-espresso/15 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-burgundy font-serif text-3xl text-gold transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110">
                  {g.icon}
                </span>
                <span className="text-xs uppercase tracking-widest text-burgundy font-medium">
                  {isActive ? 'Playing now ▴' : 'Play here ▾'}
                </span>
              </div>
              <h3 className="mt-4 text-3xl">{g.title}</h3>
              <p className="mt-1.5 text-espresso/70">{g.text}</p>
            </button>
          );
        }
        return (
          <Link
            key={g.href}
            href={g.href}
            className="group block border border-espresso/15 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-burgundy hover:shadow-lg"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-burgundy font-serif text-3xl text-gold transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110">
              {g.icon}
            </span>
            <h3 className="mt-4 text-3xl">{g.title}</h3>
            <p className="mt-1.5 text-espresso/70">{g.text}</p>
          </Link>
        );
      })}
    </div>
  );
}

export function FunZonePlayground({ products = [], whatsapp = '', defaultGame = 'quiz' }) {
  const [activeGame, setActiveGame] = useState(defaultGame);
  const current = GAMES.find((g) => g.id === activeGame);

  return (
    <div>
      <GameCards activeGame={activeGame} onSelect={setActiveGame} />

      {current && (
        <div className="mt-6 border border-burgundy/25 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-burgundy">Fun Zone</span>
              <h3 className="text-3xl md:text-4xl">{current.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <Link href={current.href} className="text-sm text-burgundy underline underline-offset-4 hover:text-espresso">
                Open full page
              </Link>
              <button
                type="button"
                onClick={() => setActiveGame(null)}
                className="border border-espresso/20 px-3 py-1 text-xs uppercase tracking-wider text-espresso/70 hover:border-burgundy hover:text-burgundy"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            {activeGame === 'quiz' && <QuizGame products={products} whatsapp={whatsapp} />}
            {activeGame === 'spin' && <SpinWheel products={products} />}
            {activeGame === 'memory' && <MemoryGame />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayTeaser({ products = [], whatsapp = '' }) {
  return (
    <Reveal as="section" id="fun-zone" className="container-x py-12 md:py-16">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-burgundy">Fun zone</span>
          <h2 className="mt-1 text-3xl md:text-4xl">Play &amp; discover</h2>
        </div>
        <Link href="/play" className="shrink-0 text-sm text-burgundy underline-offset-4 hover:underline">
          Open the fun zone →
        </Link>
      </div>
      <FunZonePlayground products={products} whatsapp={whatsapp} defaultGame="quiz" />
    </Reveal>
  );
}
