import Link from 'next/link';
import Logo from './Logo';
import { InstagramIcon } from '@/components/Icons';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';

export default function Footer({ settings }) {
  const s = settings;
  return (
    <footer className="mt-10 bg-logo text-ivory">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo src={s.logo_light_url} className="!h-28" />
          <p className="mt-2 text-sm tracking-[0.2em] text-gold">THE ART OF ETHNIC ELEGANCE</p>
        </div>

        <div>
          <h3 className="mb-3 text-xl !text-gold">Shop</h3>
          <ul className="space-y-2 text-sm text-ivory/85">
            <li><Link href="/category/sarees" className="hover:text-gold">Sarees</Link></li>
            <li><Link href="/category/jewellery" className="hover:text-gold">Jewellery</Link></li>
            <li><Link href="/category/bangles-bracelets" className="hover:text-gold">Bangles & bracelets</Link></li>
            <li><Link href="/category/rings" className="hover:text-gold">Rings</Link></li>
            <li><Link href="/category/accessories" className="hover:text-gold">Accessories</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-gold">New arrivals</Link></li>
            <li><Link href="/play" className="hover:text-gold">Fun zone</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xl !text-gold">Contact</h3>
          <ul className="space-y-2 text-sm text-ivory/85">
            <li><a href={`mailto:${s.email}`} className="break-all hover:text-gold">{s.email}</a></li>
            <li><a href={`tel:${s.phone}`} className="hover:text-gold">{s.phone}</a></li>
            <li><a href={waLink(s.whatsapp, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Message on WhatsApp</a></li>
            <li><Link href="/contact" className="hover:text-gold">Visit & hours</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xl !text-gold">Follow us</h3>
          <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-ivory/85 hover:text-gold">
            <InstagramIcon /> {s.instagram_handle}
          </a>
          <p className="mt-6 text-sm"><Link href="/about" className="text-ivory/85 hover:text-gold">About KAYATHI LABEL</Link></p>
        </div>
      </div>
      <div className="border-t border-ivory/15">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-ivory/65">
          <p>© {new Date().getFullYear()} KAYATHI LABEL. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-gold">Owner login</Link>
        </div>
      </div>
    </footer>
  );
}
