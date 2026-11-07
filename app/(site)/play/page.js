import { FunZonePlayground } from '@/components/site/PlayTeaser';
import { getSettings } from '@/lib/data';
import { loadPlayProducts } from '@/lib/playData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Fun zone',
  description: 'Play a style quiz, spin the wheel or match colours while you browse KAYATHI LABEL.',
};

export default async function Play() {
  const [products, settings] = await Promise.all([loadPlayProducts(), getSettings()]);
  return (
    <div className="container-x py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl">Fun zone</h1>
      <p className="mt-3 max-w-xl text-espresso/75">
        A little fun while you browse. No prizes or discounts here, just a nicer way to discover our pieces.
      </p>
      <div className="mt-8">
        <FunZonePlayground products={products} whatsapp={settings.whatsapp} defaultGame="quiz" />
      </div>
    </div>
  );
}
