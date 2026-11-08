'use client';
import Link from 'next/link';
import Photo from './Photo';
import { BagIcon, WhatsAppIcon } from '@/components/Icons';
import { useCart } from './Cart';
import { inr } from '@/lib/format';
import { sortedImages } from '@/lib/images';
import { isProductNew, hasRealDiscount } from '@/lib/data';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function ProductCard({ p }) {
  const img = sortedImages(p)[0];
  const soldOut = !p.is_available || p.stock <= 0;
  const isNew30d = Boolean(p.is_new) && isProductNew(p);
  const discounted = hasRealDiscount(p);
  const discountPct = discounted
    ? p.discount_percent > 0
      ? p.discount_percent
      : Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100)
    : 0;
  const badge = soldOut ? 'Sold out' : isNew30d ? 'New' : discountPct > 0 ? `${discountPct}% off` : null;
  const { addItem } = useCart();
  const quickWaHref = buildWhatsAppLink({
    product: p,
    size: (p.sizes || [])[0] || '',
    colour: (p.colours || [])[0] || '',
    qty: 1,
  });

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
      <div className="card-im relative aspect-[3/4] overflow-hidden bg-gold/20">
        <Link href={`/product/${p.slug}`} className="block h-full w-full">
          <Photo
            src={img?.url}
            alt={p.name}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className={`transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? 'opacity-70' : ''}`}
          />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 bg-ivory px-2.5 py-1 text-xs text-burgundy">
            {badge}
          </span>
        )}
        {!soldOut && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <a
              href={quickWaHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${p.name} on WhatsApp`}
              title="Quick order on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F7A4C] text-ivory shadow-md ring-1 ring-gold transition hover:bg-[#17603B]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${p.name} to bag`}
              title="Add to bag"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-ivory shadow-md ring-1 ring-gold transition hover:bg-burgundy-dark"
            >
              <BagIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <Link href={`/product/${p.slug}`} className="block">
        <h3 className="mt-3 text-lg leading-snug">{p.name}</h3>
        <p className="mt-1 text-sm">
          <span className="font-medium text-burgundy">{inr(p.price)}</span>
          {discounted && (
            <span className="ml-2 text-espresso/50 line-through">{inr(p.original_price)}</span>
          )}
        </p>
      </Link>
    </div>
  );
}
