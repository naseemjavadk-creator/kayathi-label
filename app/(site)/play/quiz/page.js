import PlayShell from '@/components/site/play/PlayShell';
import QuizGame from '@/components/site/play/QuizGame';
import { getSettings } from '@/lib/data';
import { loadPlayProducts } from '@/lib/playData';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Style quiz', description: 'Answer three quick questions and get piece suggestions from KAYATHI LABEL.' };

export default async function QuizPage() {
  const [products, settings] = await Promise.all([loadPlayProducts(), getSettings()]);
  return (
    <PlayShell title="Style quiz" intro="Answer three quick questions and we will suggest pieces from the collection.">
      <QuizGame products={products} whatsapp={settings.whatsapp} />
    </PlayShell>
  );
}
