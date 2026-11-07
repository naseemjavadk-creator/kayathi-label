import Link from 'next/link';
import Logo from './Logo';
import MobileNav from './MobileNav';
import { HeaderCartButton } from './Cart';
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';

export const NAV = [
  { label: 'HOME', href: '/' },
  { label: 'SAREES', href: '/category/sarees' },
  { label: 'JEWELLERY', href: '/category/jewellery' },
  { label: 'BANGLES', href: '/category/bangles-bracelets' },
  { label: 'ACCESSORIES', href: '/category/accessories' },
  { label: 'NEW ARRIVALS', href: '/new-arrivals' },
  { label: 'FUN ZONE', href: '/play' },
  { label: 'ABOUT US', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
];

export default function Header({ settings }) {
  return (
    <header className="relative bg-logo text-ivory">
      <div className="container-x flex items-center justify-between py-2">
        <div className="w-24 lg:w-48">
          <MobileNav items={NAV} />
          <form action="/shop" className="hidden lg:block">
            <input name="q" type="search" placeholder="Search" aria-label="Search products" className="w-36 border-b border-ivory/40 bg-transparent py-1 text-sm text-ivory placeholder:text-ivory/60 focus:border-gold focus:outline-none" />
          </form>
        </div>

        <Link href="/" aria-label="KAYATHI LABEL home" className="flex flex-col items-center">
          <Logo src={settings.logo_light_url} />
        </Link>

        <div className="flex w-28 items-center justify-end gap-3 text-gold lg:w-48">
          <HeaderCartButton />
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="KAYATHI LABEL on Instagram" className="p-1.5 hover:text-ivory">
            <InstagramIcon />
          </a>
          <a href={waLink(settings.whatsapp, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="p-1.5 hover:text-ivory">
            <WhatsAppIcon />
          </a>
        </div>
      </div>

      <nav aria-label="Main" className="border-t border-ivory/20">
        <ul className="container-x flex items-center justify-start gap-6 overflow-x-auto py-3.5 whitespace-nowrap lg:justify-center lg:gap-9">
          {NAV.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`text-[13px] tracking-[0.16em] transition-colors hover:text-gold ${
                  i.href === '/play' ? 'font-medium text-gold' : 'text-ivory'
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
