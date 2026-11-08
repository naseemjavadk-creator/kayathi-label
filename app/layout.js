import './globals.css';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { siteUrl } from '@/lib/data';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Jost({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'KAYATHI LABEL | The Art of Ethnic Elegance', template: '%s | KAYATHI LABEL' },
  description:
    'KAYATHI LABEL is a premium Indian ethnic fashion and accessories boutique. Shop sarees, jewellery, bangles, rings and accessories and order on WhatsApp.',
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: 'website',
    siteName: 'KAYATHI LABEL',
    title: 'KAYATHI LABEL | The Art of Ethnic Elegance',
    description: 'Handpicked sarees, jewellery, bangles, rings & ethnic accessories. Order easily on WhatsApp with delivery across India.',
    url: siteUrl(),
    locale: 'en_IN',
    images: [{ url: `${siteUrl()}/brand/hero-banner.jpg`, width: 1024, height: 559, alt: 'KAYATHI LABEL — The Art of Ethnic Elegance' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAYATHI LABEL | The Art of Ethnic Elegance',
    description: 'Handpicked sarees, jewellery, bangles, rings & ethnic accessories. Order easily on WhatsApp.',
    images: [`${siteUrl()}/brand/hero-banner.jpg`],
  },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#64152D' };

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('kl_splash'))document.documentElement.classList.add('kl-seen')}catch(e){}" }} />
        <noscript><style>{'.rv{opacity:1!important;transform:none!important}#splash{display:none!important}'}</style></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
