'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MenuIcon, CloseIcon, WhatsAppIcon, InstagramIcon } from '@/components/Icons';
import { SITE_CONFIG } from '@/config/site';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';

export default function MobileNav({ items = SITE_CONFIG.navigation, settings }) {
  const [open, setOpen] = useState(false);
  const waNumber = settings?.whatsapp || SITE_CONFIG.whatsapp;
  const igUrl = settings?.instagram_url || SITE_CONFIG.instagramUrl;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="p-2 text-gold transition-colors hover:text-ivory"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full z-50 max-h-[82vh] overflow-y-auto border-t border-ivory/20 bg-logo px-5 pb-6 pt-4 shadow-2xl"
        >
          <form action="/shop" className="mb-4" onSubmit={() => setOpen(false)}>
            <input
              name="q"
              type="search"
              placeholder="Search sarees, jhumkas, bangles…"
              className="field"
              aria-label="Search products"
            />
          </form>
          <ul className="divide-y divide-ivory/15">
            {items.map((i) => (
              <li key={i.href + i.label}>
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-sm uppercase tracking-[0.14em] transition-colors hover:text-gold ${
                    i.highlight ? 'font-medium text-gold' : 'text-ivory'
                  }`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm uppercase tracking-[0.14em] text-ivory/85 hover:text-gold"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm uppercase tracking-[0.14em] text-ivory/85 hover:text-gold"
              >
                Contact & FAQ
              </Link>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ivory/15 pt-4">
            <a
              href={waLink(waNumber, GENERAL_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 bg-[#1F7A4C] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-ivory"
            >
              <WhatsAppIcon className="h-4 w-4" /> Order on WhatsApp
            </a>
            {igUrl && (
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_CONFIG.brandName} on Instagram`}
                className="inline-flex items-center justify-center border border-gold/50 p-2.5 text-gold hover:text-ivory"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
