'use client';
import Link from 'next/link';
import Photo from './Photo';
import { BagIcon } from '@/components/Icons';
import { useCart } from './Cart';
import { inr } from '@/lib/format';
import { sortedImages } from '@/lib/images';

export default function ProductCard({ p }) {
  const img = sortedImages(p)[0];
  const soldOut = !p.is_available || p.stock <= 0;
  const badge = soldOut ? 'Sold out' : p.is_new ? 'New' : p.discount_percent > 0 ? `${p.discount_percent}% off` : null;
  const { addItem } = useCart();

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem({
      product: {
        sku: p.sku || p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
      },
      size: (p.sizes || [])[0] || '',
      colour: (p.colours || [])[0] || '',
      qty: 1,
      image: img?.url || null,
      url: typeof window !== 'undefined' ? `${window.location.origin}/product/${p.slug}` : '',
    });
  }

  return (
    <div className="group relative">
      <Link href={`/product/${p.slug}`} className="block">
        <div className="card-im relative aspect-[3/4] overflow-hidden bg-gold/20">
          <Photo
            src={img?.url}
            alt={p.name}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className={`transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? 'opacity-70' : ''}`}
          />
          {badge && (
            <span className="absolute left-3 top-3 bg-ivory px-2.5 py-1 text-xs text-burgundy">{badge}</span>
          )}
          {!soldOut && (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${p.name} to bag`}
              className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-ivory shadow-md ring-1 ring-gold transition hover:bg-burgundy-dark"
            >
              <BagIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <h3 className="mt-3 text-lg leading-snug">{p.name}</h3>
        <p className="mt-1 text-sm">
          <span className="font-medium text-burgundy">{inr(p.price)}</span>
          {p.original_price > p.price && (
            <span className="ml-2 text-espresso/50 line-through">{inr(p.original_price)}</span>
          )}
        </p>
      </Link>
    </div>
  );
}
