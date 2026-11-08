import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';
import { siteUrl } from '@/lib/data';
import { waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/Icons';

export function generateMetadata() {
  const canonical = `${siteUrl()}/size-guide`;
  const title = SITE_CONFIG.sizeGuide?.title || 'Size & Fit Guide';
  const description =
    'Saree length, unstitched blouse piece dimensions, Indian bangle size chart (2.2 to 2.10), and ring sizing guide for KAYATHI LABEL.';
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

export default function SizeGuidePage() {
  const sg = SITE_CONFIG.sizeGuide;

  return (
    <div className="container-x max-w-3xl py-12 md:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
        FIT &amp; MEASUREMENTS
      </p>
      <h1 className="mt-2 text-4xl md:text-5xl">{sg.title}</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-espresso/60">
        Last updated: {sg.lastUpdated}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-espresso/80 md:text-base">
        {sg.intro}
      </p>

      <div className="mt-10 space-y-10">
        {/* Saree Length Guide */}
        <section className="border border-espresso/15 bg-white p-6">
          <h2 className="text-2xl text-burgundy">{sg.sarees.heading}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-espresso/85 md:text-base">
            {sg.sarees.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </section>

        {/* Bangles Size Chart */}
        <section className="border border-espresso/15 bg-white p-6">
          <h2 className="text-2xl text-burgundy">{sg.bangles.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-espresso/80">
            {sg.bangles.howToMeasure}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-espresso/20 bg-ivory-deep text-xs uppercase tracking-wider text-burgundy">
                  <th className="px-3 py-2.5">Indian Size</th>
                  <th className="px-3 py-2.5">Inner Diameter (in)</th>
                  <th className="px-3 py-2.5">Inner Diameter (mm)</th>
                  <th className="px-3 py-2.5">Circumference (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/10">
                {sg.bangles.rows.map((r) => (
                  <tr key={r.size}>
                    <td className="px-3 py-2.5 font-medium text-burgundy">{r.size}</td>
                    <td className="px-3 py-2.5 text-espresso/85">{r.innerDiameterIn}</td>
                    <td className="px-3 py-2.5 text-espresso/85">{r.innerDiameterMm}</td>
                    <td className="px-3 py-2.5 text-espresso/85">{r.circumferenceIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ring Sizing Notes */}
        <section className="border border-espresso/15 bg-white p-6">
          <h2 className="text-2xl text-burgundy">{sg.rings.heading}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-espresso/85 md:text-base">
            {sg.rings.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 border border-gold/40 bg-ivory-deep p-6 text-center">
        <h2 className="font-serif text-2xl text-burgundy">Unsure about your bangle or ring size?</h2>
        <p className="mt-2 text-sm text-espresso/80">
          Send us a photo of a bangle next to a ruler on WhatsApp and we will confirm the exact size for you.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={waLink(
              SITE_CONFIG.whatsapp,
              'Hello KAYATHI LABEL! Can you help me pick the right size for bangles/rings?'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
          </a>
          <Link href="/shop" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
