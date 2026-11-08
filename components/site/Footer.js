import Link from 'next/link';
import Logo from './Logo';
import { InstagramIcon, WhatsAppIcon, MailIcon, PhoneIcon } from '@/components/Icons';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';
import { SITE_CONFIG } from '@/config/site';

export default function Footer({ settings = {} }) {
  const s = settings;
  const links = SITE_CONFIG.footerLinks;
  const email = s.email || SITE_CONFIG.email;
  const phone = s.phone || SITE_CONFIG.phone;
  const whatsapp = s.whatsapp || SITE_CONFIG.whatsapp;
  const igUrl = s.instagram_url || SITE_CONFIG.instagramUrl;
  const igHandle = s.instagram_handle || SITE_CONFIG.instagramHandle;

  return (
    <footer className="mt-10 bg-logo text-ivory">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Column 1: Brand, Tagline, Contact & Socials */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo src={s.logo_light_url} className="!h-24" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold">
            {SITE_CONFIG.tagline}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/90">
            <li>
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all hover:text-gold">
                <MailIcon className="h-4 w-4 shrink-0 text-gold" /> {email}
              </a>
            </li>
            <li>
              <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-gold">
                <PhoneIcon className="h-4 w-4 shrink-0 text-gold" /> {phone}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={waLink(whatsapp, GENERAL_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat with ${SITE_CONFIG.brandName} on WhatsApp`}
              className="inline-flex items-center gap-1.5 border border-gold/40 bg-burgundy-dark px-3 py-1.5 text-xs text-ivory transition hover:border-gold hover:text-gold"
            >
              <WhatsAppIcon className="h-4 w-4 text-gold" /> WhatsApp
            </a>
            {igUrl && (
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow ${igHandle} on Instagram`}
                className="inline-flex items-center gap-1.5 border border-gold/40 bg-burgundy-dark px-3 py-1.5 text-xs text-ivory transition hover:border-gold hover:text-gold"
              >
                <InstagramIcon className="h-4 w-4 text-gold" /> {igHandle}
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Shop */}
        <div>
          <h3 className="mb-3 text-xl !text-gold">Shop</h3>
          <ul className="space-y-2 text-sm text-ivory/90">
            {(links?.shop || []).map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Help */}
        <div>
          <h3 className="mb-3 text-xl !text-gold">Help</h3>
          <ul className="space-y-2 text-sm text-ivory/90">
            {(links?.help || []).map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Company */}
        <div>
          <h3 className="mb-3 text-xl !text-gold">Company</h3>
          <ul className="space-y-2 text-sm text-ivory/90">
            {(links?.company || []).map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Policies */}
        <div>
          <h3 className="mb-3 text-xl !text-gold">Policies</h3>
          <ul className="space-y-2 text-sm text-ivory/90">
            {(links?.policies || []).map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar (extra bottom/right padding so floating buttons never overlap links) */}
      <div className="border-t border-ivory/15 pb-24 md:pb-8 md:pr-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-ivory/85">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.brandName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/faq" className="hover:text-gold">FAQ</Link>
            <Link href="/size-guide" className="hover:text-gold">Size Guide</Link>
            <Link href="/shipping-returns" className="hover:text-gold">Shipping &amp; Returns</Link>
            <Link href="/privacy-policy" className="hover:text-gold">Privacy</Link>
            <Link href="/terms" className="hover:text-gold">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
