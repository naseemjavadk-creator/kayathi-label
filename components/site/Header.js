'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import MobileNav from './MobileNav';
import { HeaderCartButton } from './Cart';
import { HeaderWishlistButton } from './Wishlist';
import { InstagramIcon, WhatsAppIcon, SearchIcon, CloseIcon } from '@/components/Icons';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';
import { SITE_CONFIG } from '@/config/site';

export const NAV = SITE_CONFIG.navigation;

export default function Header({ settings = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const isScrolled = window.scrollY > 28;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waNumber = settings.whatsapp || SITE_CONFIG.whatsapp;
  const igUrl = settings.instagram_url || SITE_CONFIG.instagramUrl;

  return (
    <header
      className={`sticky top-0 z-40 bg-logo text-ivory transition-shadow duration-200 ${
        scrolled ? 'shadow-lg shadow-espresso/25' : ''
      }`}
    >
      <div
        className={`container-x flex items-center justify-between transition-all duration-200 ${
          scrolled ? 'py-1' : 'py-2'
        }`}
      >
        <div className="flex w-28 items-center gap-2 lg:w-56">
          <MobileNav items={NAV} settings={settings} />
          <form action="/shop" className="hidden lg:flex lg:items-center lg:gap-1.5">
            <SearchIcon className="h-4 w-4 text-gold/85" />
            <input
              name="q"
              type="search"
              placeholder="Search sarees, jewellery…"
              aria-label="Search products"
              className="w-40 border-b border-ivory/40 bg-transparent py-1 text-sm text-ivory placeholder:text-ivory/75 focus:border-gold focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
            className="p-1.5 text-gold transition-colors hover:text-ivory lg:hidden"
          >
            {searchOpen ? <CloseIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
          </button>
        </div>

        <Link href="/" aria-label={`${SITE_CONFIG.brandName} home`} className="flex flex-col items-center">
          <Logo
            src={settings.logo_light_url}
            className={`transition-all duration-200 ${
              scrolled ? '!h-14 md:!h-16' : 'h-20 md:h-24'
            }`}
          />
        </Link>

        <div className="flex w-28 items-center justify-end gap-1.5 text-gold sm:gap-2.5 lg:w-56">
          <HeaderWishlistButton />
          <HeaderCartButton />
          {igUrl && (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${SITE_CONFIG.brandName} on Instagram`}
              className="hidden p-1.5 transition-colors hover:text-ivory sm:inline-flex"
            >
              <InstagramIcon />
            </a>
          )}
          <a
            href={waLink(waNumber, GENERAL_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order or chat on WhatsApp"
            className="p-1.5 transition-colors hover:text-ivory"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ivory/15 bg-burgundy-dark px-4 py-2.5 lg:hidden">
          <form action="/shop" onSubmit={() => setSearchOpen(false)} className="container-x flex gap-2">
            <input
              name="q"
              type="search"
              autoFocus
              placeholder="Search sarees, jhumkas, bangles, rings…"
              aria-label="Search products"
              className="field flex-1 !py-2 text-sm"
            />
            <button type="submit" className="btn btn-gold !px-4 !py-2 text-xs">
              Search
            </button>
          </form>
        </div>
      )}

      <nav aria-label="Main" className="border-t border-ivory/20">
        <ul
          className={`container-x flex items-center justify-start gap-5 overflow-x-auto whitespace-nowrap transition-all duration-200 lg:justify-center lg:gap-8 ${
            scrolled ? 'py-2' : 'py-3'
          }`}
        >
          {NAV.map((i) => (
            <li key={i.href + i.label}>
              <Link
                href={i.href}
                className={`text-[12px] uppercase tracking-[0.16em] transition-colors hover:text-gold md:text-[13px] ${
                  i.highlight ? 'font-medium text-gold' : 'text-ivory'
                }`}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
