import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for browsing and ordering from KAYATHI LABEL via WhatsApp.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  const policy = SITE_CONFIG.policies.terms;
  return (
    <div className="container-x py-12 md:py-20">
      <h1 className="max-w-3xl text-4xl md:text-5xl">{policy.title}</h1>
      <p className="mt-2 text-sm text-espresso/60">Last updated: {policy.lastUpdated}</p>
      <div className="mt-10 max-w-3xl divide-y divide-espresso/15 border-y border-espresso/15">
        {policy.sections.map((sec) => (
          <section key={sec.heading} className="py-7">
            <h2 className="text-2xl">{sec.heading}</h2>
            <p className="mt-2.5 whitespace-pre-line leading-relaxed text-espresso/85">{sec.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-primary">Explore collections</Link>
      </div>
    </div>
  );
}
