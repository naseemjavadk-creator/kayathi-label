import PlayShell from '@/components/site/play/PlayShell';
import MemoryGame from '@/components/site/play/MemoryGame';

export const metadata = { title: 'Colour match', description: 'Find all six pairs of matching colours in as few moves as you can.' };

export default function MemoryPage() {
  return (
    <PlayShell title="Colour match" intro="Find all six pairs of matching colours in as few moves as you can.">
      <MemoryGame />
    </PlayShell>
  );
}
