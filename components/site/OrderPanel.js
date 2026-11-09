'use client';
import { useEffect, useState } from 'react';
import { WhatsAppIcon } from '@/components/Icons';
import { waLink, buildOrderMessage } from '@/lib/whatsapp';
import { EMPTY_DELIVERY, INDIAN_STATES, cleanPhone, cleanPin, isPhone, isPin, loadDelivery, saveDelivery } from '@/lib/delivery';

export default function OrderPanel({ product, whatsapp }) {
  const { sizes = [], colours = [], stock } = product;
  const soldOut = !product.is_available || stock <= 0;
  const [size, setSize] = useState('');
  const [colour, setColour] = useState(colours.length === 1 ? colours[0] : '');
  const [qty, setQty] = useState(1);
  const [url, setUrl] = useState('');
  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
    setDelivery(loadDelivery());
  }, []);

  const setField = (k, v) => {
    const next = { ...delivery, [k]: v };
    setDelivery(next);
    saveDelivery(next);
  };
  const phoneOk = !delivery.phone || isPhone(delivery.phone);
  const pinOk = !delivery.pin || isPin(delivery.pin);

  const missing = [sizes.length > 0 && !size && 'a size', colours.length > 0 && !colour && 'a colour'].filter(Boolean);
  const href = waLink(whatsapp, buildOrderMessage({ product, size, colour, qty, url, delivery }));
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

      <details open className="border border-espresso/15 bg-white p-4">
        <summary className="cursor-pointer text-sm">Delivery details (optional, helps us confirm faster)</summary>
        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="d-name">Full name</label>
            <input id="d-name" className="field" autoComplete="name" value={delivery.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="d-phone">Mobile number</label>
            <div className="flex">
              <span className="flex items-center border border-r-0 border-espresso/25 bg-ivory-deep px-3 text-sm">+91</span>
              <input id="d-phone" className="field" type="tel" inputMode="numeric" maxLength={13} autoComplete="tel-national" value={delivery.phone} onChange={(e) => setField('phone', cleanPhone(e.target.value))} />
            </div>
            {!phoneOk && <p className="mt-1 text-sm text-red-800">Enter a 10-digit mobile number.</p>}
          </div>
          <div>
            <label className="label" htmlFor="d-house">Flat, house no., building</label>
            <input id="d-house" className="field" autoComplete="address-line1" value={delivery.house} onChange={(e) => setField('house', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="d-street">Street, area, locality</label>
            <input id="d-street" className="field" autoComplete="address-line2" value={delivery.street} onChange={(e) => setField('street', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="d-landmark">Landmark (optional)</label>
            <input id="d-landmark" className="field" placeholder="e.g. Near the temple" value={delivery.landmark} onChange={(e) => setField('landmark', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="d-pin">PIN code</label>
              <input id="d-pin" className="field" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={delivery.pin} onChange={(e) => setField('pin', cleanPin(e.target.value))} />
              {!pinOk && <p className="mt-1 text-sm text-red-800">Enter a 6-digit PIN code.</p>}
            </div>
            <div>
              <label className="label" htmlFor="d-city">City, town or village</label>
              <input id="d-city" className="field" autoComplete="address-level2" value={delivery.city} onChange={(e) => setField('city', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="d-district">District</label>
              <input id="d-district" className="field" value={delivery.district} onChange={(e) => setField('district', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="d-state">State</label>
              <select id="d-state" className="field" autoComplete="address-level1" value={delivery.state} onChange={(e) => setField('state', e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((st) => (<option key={st} value={st}>{st}</option>))}
              </select>
            </div>
          </div>
          <p className="text-xs text-espresso/65">
            Shared only in your WhatsApp message to KAYATHI LABEL. Saved on this device so you do not have to type it again.
          </p>
        </div>
      </details>

      {missing.length > 0 ? (
        <>
          <button type="button" disabled className="btn btn-primary w-full"><WhatsAppIcon /> Order on WhatsApp</button>
          <p className="text-sm text-espresso/70">Please choose {missing.join(' and ')} to continue.</p>
        </>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
          <WhatsAppIcon /> Order on WhatsApp
        </a>
      )}
      <p className="text-sm text-espresso/70">
        This opens WhatsApp with your product details filled in. Your order is only confirmed once KAYATHI LABEL replies and agrees availability and delivery with you.
      </p>
    </div>
  );
}
