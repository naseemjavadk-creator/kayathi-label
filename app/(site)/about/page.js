import Link from 'next/link';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'About Us',
  description: 'About KAYATHI LABEL, a premium Indian ethnic fashion and accessories boutique.',
  alternates: { canonical: '/about' },
};

export default async function About() {
  const s = await getSettings();
  const blocks = [
    ['Our story', s.about_story],
    ['Our vision', s.about_vision],
    ['Our style', s.about_style],
    ['Our collections', s.about_collections],
    ['Our commitment to quality', s.about_commitment],
  ].filter(([, text]) => text && text.trim());

  return (
    <div className="container-x py-12 md:py-20">
      <h1 className="max-w-3xl text-5xl md:text-6xl">About KAYATHI LABEL</h1>
      <p className="mt-3 text-espresso/70">The art of ethnic elegance</p>
      <div className="mt-12 max-w-3xl divide-y divide-espresso/15 border-y border-espresso/15">
        {blocks.map(([title, text]) => (
          <section key={title} className="grid gap-3 py-8 md:grid-cols-[13rem_1fr] md:gap-10">
            <h2 className="text-2xl">{title}</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed">{text}</p>
          </section>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-primary">Shop now</Link>
        <Link href="/contact" className="btn btn-outline">Contact us</Link>
      </div>
    </div>
  );
}
