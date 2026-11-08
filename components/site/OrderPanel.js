'use client';
import { useEffect, useState } from 'react';
import { BagIcon, WhatsAppIcon } from '@/components/Icons';
import { useCart } from './Cart';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function OrderPanel({ product, whatsapp }) {
  const { sizes = [], colours = [], stock } = product;
  const soldOut = !product.is_available || stock <= 0;
  const [size, setSize] = useState('');
  const [colour, setColour] = useState(colours.length === 1 ? colours[0] : '');
  const [qty, setQty] = useState(1);
  const [url, setUrl] = useState('');
  const { addItem } = useCart();

  useEffect(() => setUrl(window.location.origin + window.location.pathname), []);

  const missing = [sizes.length > 0 && !size && 'a size', colours.length > 0 && !colour && 'a colour'].filter(Boolean);
  const href = buildWhatsAppLink({ product, size, colour, qty, url, whatsapp });
  const maxQty = Math.max(1, Math.min(stock, 10));

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-[3rem] border px-4 py-2 text-sm transition-colors ${active ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/30 hover:border-burgundy'}`}
    >
      {children}
    </button>
  );

  if (soldOut) {
    return (
      <div className="mt-8 border border-espresso/20 bg-white p-5">
        <p className="font-serif text-2xl">Currently unavailable</p>
        <p className="mt-1 text-sm text-espresso/75">This piece is out of stock. Message us to ask about restocking or similar pieces.</p>
        <button type="button" disabled className="btn btn-primary mt-4 w-full">Order on WhatsApp</button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {colours.length > 0 && (
        <div>
          <p className="label">Colour{colour && <span className="ml-2 text-espresso">{colour}</span>}</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (<Chip key={c} active={colour === c} onClick={() => setColour(c)}>{c}</Chip>))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="label">Size{size && <span className="ml-2 text-espresso">{size}</span>}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (<Chip key={s} active={size === s} onClick={() => setSize(s)}>{s}</Chip>))}
          </div>
        </div>
      )}
      <div>
        <p className="label">Quantity</p>
        <div className="inline-flex items-center border border-espresso/30">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 text-lg">−</button>
          <span className="w-10 text-center" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(maxQty, qty + 1))} className="h-11 w-11 text-lg">+</button>
        </div>
      </div>

      {missing.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" disabled className="btn btn-outline w-full">
              <BagIcon /> Add to bag
            </button>
            <button type="button" disabled className="btn btn-primary w-full">
              <WhatsAppIcon /> Order on WhatsApp
            </button>
          </div>
          <p className="text-sm text-espresso/70">Please choose {missing.join(' and ')} to continue.</p>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => addItem({ product, size, colour, qty, image: product.image, url })}
            className="btn btn-outline w-full"
          >
            <BagIcon /> Add to bag
          </button>
          <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
            <WhatsAppIcon /> Order on WhatsApp
          </a>
        </div>
      )}
      <p className="text-sm text-espresso/70">
        Add pieces to your bag or order directly on WhatsApp. Your order is only confirmed once KAYATHI LABEL replies and agrees availability and delivery with you.
      </p>
    </div>
  );
}
