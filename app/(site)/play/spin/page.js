import PlayShell from '@/components/site/play/PlayShell';
import SpinWheel from '@/components/site/play/SpinWheel';
import { loadPlayProducts } from '@/lib/playData';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Spin the wheel', description: 'Spin to discover a collection and a piece to look at today.' };

export default async function SpinPage() {
  const products = await loadPlayProducts();
  return (
    <PlayShell title="Spin the wheel" intro="Spin to discover a collection and a piece to look at today.">
      <SpinWheel products={products} />
    </PlayShell>
  );
}
