import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';
import { siteUrl } from '@/lib/data';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/Icons';

export function generateMetadata() {
  const canonical = `${siteUrl()}/faq`;
  const title = 'Frequently Asked Questions (FAQ)';
  const description =
    'Answers to common questions about ordering KAYATHI LABEL sarees, jewellery, bangles, and rings on WhatsApp, delivery across India, payments, and exchanges.';
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.brandName}`,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

export default function FaqPage() {
  const faqs = SITE_CONFIG.faqs || [];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="container-x max-w-3xl py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
        HELP &amp; CUSTOMER CARE
      </p>
      <h1 className="mt-2 text-4xl md:text-5xl">Frequently Asked Questions</h1>
      <p className="mt-3 text-sm text-espresso/75 md:text-base">
        TODO (Owner: review or add store-specific questions in <code>/config/site.js</code>): Everything you need to know about ordering from {SITE_CONFIG.brandName} via WhatsApp, shipping timelines, and exchanges.
      </p>

      <div className="mt-8 space-y-4">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            open={idx === 0}
            className="group border border-espresso/15 bg-white p-5"
          >
            <summary className="cursor-pointer font-serif text-xl text-burgundy">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-espresso/80 md:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 border border-gold/40 bg-ivory-deep p-6 text-center">
        <h2 className="font-serif text-2xl text-burgundy">Still have a question?</h2>
        <p className="mt-2 text-sm text-espresso/80">
          Message us directly on WhatsApp and our team will assist you personally.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={waLink(SITE_CONFIG.whatsapp, GENERAL_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <Link href="/size-guide" className="btn btn-outline">
            View Size Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
