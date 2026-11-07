import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import FloatingWhatsApp from '@/components/site/FloatingWhatsApp';
import Splash from '@/components/site/Splash';
import BackToTop from '@/components/site/BackToTop';
import { CartProvider } from '@/components/site/Cart';
import { getSettings, getComingSoon } from '@/lib/data';
import { ComingSoonTicker } from '@/components/site/ComingSoon';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const [settings, soon] = await Promise.all([getSettings(), getComingSoon()]);
  return (
    <CartProvider whatsapp={settings.whatsapp}>
      <Splash logoSrc={settings.logo_light_url} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-ivory focus:p-3">
        Skip to content
      </a>
      <ComingSoonTicker items={soon} />
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp number={settings.whatsapp} instagram={settings.instagram_url} />
      <BackToTop />
    </CartProvider>
  );
}
