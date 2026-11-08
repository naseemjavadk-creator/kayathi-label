'use client';
import Link from 'next/link';
import Photo from './Photo';
import { BagIcon, HeartIcon, WhatsAppIcon } from '@/components/Icons';
import { useCart } from './Cart';
import { useWishlist } from './Wishlist';
import { inr } from '@/lib/format';
import { sortedImages } from '@/lib/images';
import { isProductNew, hasRealDiscount } from '@/lib/data';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function ProductCard({ p }) {
  const images = sortedImages(p);
  const img = images[0];
  const secondImg = images[1];
  const soldOut = !p.is_available || p.stock <= 0;
  const isNew30d = Boolean(p.is_new) && isProductNew(p);
  const discounted = hasRealDiscount(p);
  const discountPct = discounted
    ? p.discount_percent > 0
      ? p.discount_percent
      : Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100)
    : 0;
  const badge = soldOut
    ? 'Sold out'
    : discountPct > 0
    ? `${discountPct}% off`
    : isNew30d
    ? 'New'
    : null;

  const { addItem } = useCart();
  const { isSaved, toggleItem } = useWishlist();
  const saved = isSaved(p.id || p.slug);

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

  function handleWishlistToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      id: p.id || p.slug,
      slug: p.slug,
      sku: p.sku || '',
      name: p.name,
      price: p.price,
      image: img?.url || null,
    });
  }

  return (
    <div className="group relative flex flex-col">
      <div className="card-im relative aspect-[3/4] overflow-hidden bg-gold/20">
        <Link href={`/product/${p.slug}`} className="relative block h-full w-full">
          <Photo
            src={img?.url}
            alt={p.name}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className={`transition-all duration-500 group-hover:scale-[1.03] ${
              secondImg?.url ? 'group-hover:opacity-0' : ''
            } ${soldOut ? 'opacity-70' : ''}`}
          />
          {secondImg?.url && (
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <Photo
                src={secondImg.url}
                alt={`${p.name} alternate view`}
                sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          )}
        </Link>

        {/* Badges (Top-Left) */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {badge && (
            <span
              className={`px-2.5 py-1 text-xs font-medium shadow-sm ${
                discountPct > 0
                  ? 'bg-burgundy text-gold'
                  : 'bg-ivory text-burgundy'
              }`}
            >
              {badge}
            </span>
          )}
          {discountPct > 0 && isNew30d && !soldOut && (
            <span className="bg-ivory px-2.5 py-0.5 text-[11px] font-medium text-burgundy shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          aria-pressed={saved}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
            saved
              ? 'bg-burgundy text-gold ring-1 ring-gold'
              : 'bg-ivory/90 text-burgundy hover:bg-ivory'
          }`}
        >
          <HeartIcon filled={saved} className="h-4 w-4" />
        </button>

        {/* Quick Action Buttons (Bottom-Right) */}
        {!soldOut && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <a
              href={quickWaHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${p.name} on WhatsApp`}
              title="Order on WhatsApp"
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#1F7A4C] px-3 text-xs font-medium text-ivory shadow-md ring-1 ring-gold transition hover:bg-[#17603B]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Order</span>
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
        <h3 className="mt-3 text-lg leading-snug group-hover:text-burgundy">{p.name}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-burgundy">{inr(p.price)}</span>
          {discounted && (
            <>
              <span className="text-espresso/50 line-through">{inr(p.original_price)}</span>
              {discountPct > 0 && (
                <span className="text-xs font-medium text-[#1F7A4C]">({discountPct}% off)</span>
              )}
            </>
          )}
        </p>
      </Link>
    </div>
  );
}
