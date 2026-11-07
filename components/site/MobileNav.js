'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MenuIcon, CloseIcon } from '@/components/Icons';

export default function MobileNav({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="p-2 text-gold"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {open && (
        <nav
          aria-label="Main"
          className="absolute left-0 right-0 top-full z-40 border-t border-ivory/20 bg-logo px-5 pb-5 pt-3 shadow-lg"
        >
          <form action="/shop" className="mb-3">
            <input name="q" type="search" placeholder="Search products" className="field" aria-label="Search products" />
          </form>
          <ul>
            {items.map((i) => (
              <li key={i.href} className="border-b border-ivory/15">
                <Link href={i.href} onClick={() => setOpen(false)} className="block py-3 text-sm tracking-[0.12em] text-ivory">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
