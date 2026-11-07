import Link from 'next/link';
import ProductCard from './ProductCard';
import Reveal from './Reveal';

export default function ProductRow({ title, href, products, linkLabel = 'View all' }) {
  if (!products || products.length === 0) return null;
  return (
    <Reveal as="section" className="container-x py-12 md:py-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm text-burgundy underline-offset-4 hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </Reveal>
  );
}
