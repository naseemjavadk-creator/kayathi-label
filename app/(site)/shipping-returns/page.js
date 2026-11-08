import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

export const metadata = {
  title: 'Shipping & Returns Policy',
  description: 'Shipping, delivery across India, and exchange policy for KAYATHI LABEL orders.',
  alternates: { canonical: '/shipping-returns' },
};

export default function ShippingReturnsPage() {
  const policy = SITE_CONFIG.policies.shippingReturns;
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
        <Link href="/contact" className="btn btn-primary">Contact us on WhatsApp</Link>
        <Link href="/shop" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
