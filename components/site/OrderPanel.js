'use client';
import { useEffect, useState } from 'react';
import { BagIcon, ShieldCheckIcon, WhatsAppIcon } from '@/components/Icons';
import { useCart } from './Cart';
import { sortedImages } from '@/lib/images';
import { waLink, buildOrderMessage } from '@/lib/whatsapp';
import {
  EMPTY_DELIVERY,
  INDIAN_STATES,
  cleanPhone,
  cleanPin,
  loadDelivery,
  saveDelivery,
  validateDelivery,
} from '@/lib/delivery';

export default function OrderPanel({ product, whatsapp = '+917907139297' }) {
  const { sizes = [], colours = [], stock } = product;
  const soldOut = !product.is_available || stock <= 0;
  const [size, setSize] = useState('');
  const [colour, setColour] = useState(colours.length === 1 ? colours[0] : '');
  const [qty, setQty] = useState(1);
  const [url, setUrl] = useState('');
  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);
  const [submitted, setSubmitted] = useState(false);
  const [sentWaUrl, setSentWaUrl] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
    setDelivery(loadDelivery());
  }, []);

  const setField = (k, v) => {
    const next = { ...delivery, [k]: v };
    setDelivery(next);
    saveDelivery(next);
  };

  const missing = [
    sizes.length > 0 && !size && 'a size',
    colours.length > 0 && !colour && 'a colour',
  ].filter(Boolean);

  const { errors, isValid } = validateDelivery(delivery);
  const maxQty = Math.max(1, Math.min(stock, 10));

  function handleAddToBag() {
    if (soldOut || missing.length > 0) return;
    const firstImg = sortedImages(product)[0]?.url || null;
    addItem(
      {
        product: {
          sku: product.sku || product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          stock: product.stock,
        },
        size,
        colour,
        qty,
        image: firstImg,
        url,
      },
      { openCheckout: false }
    );
  }

  function handleOrderSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (missing.length > 0) return;
    const check = validateDelivery(delivery);
    if (!check.isValid) return;

    saveDelivery(delivery);
    const targetUrl = waLink(
      whatsapp || '+917907139297',
      buildOrderMessage({ product, size, colour, qty, url, delivery })
    );
    setSentWaUrl(targetUrl);
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-[3rem] border px-4 py-2 text-sm transition-colors ${
        active ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/30 hover:border-burgundy'
      }`}
    >
      {children}
    </button>
  );

  if (soldOut) {
    return (
      <div className="mt-8 border border-espresso/20 bg-white p-5">
        <p className="font-serif text-2xl">Currently unavailable</p>
        <p className="mt-1 text-sm text-espresso/75">
          This piece is out of stock. Message us to ask about restocking or similar pieces.
        </p>
        <button type="button" disabled className="btn btn-primary mt-4 w-full">
          Order on WhatsApp
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleOrderSubmit} noValidate className="mt-8 space-y-6">
      {colours.length > 0 && (
        <div>
          <p className="label">
            Colour{colour && <span className="ml-2 text-espresso">{colour}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <Chip key={c} active={colour === c} onClick={() => setColour(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="label">
            Size{size && <span className="ml-2 text-espresso">{size}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <Chip key={s} active={size === s} onClick={() => setSize(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="label">Quantity</p>
        <div className="inline-flex items-center border border-espresso/30">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="h-11 w-11 text-lg"
          >
            −
          </button>
          <span className="w-10 text-center" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className="h-11 w-11 text-lg"
          >
            +
          </button>
        </div>
      </div>

      <div className="border border-espresso/15 bg-white p-4">
        <p className="font-medium text-sm text-espresso">
          Customer &amp; delivery details (required to place order on WhatsApp)
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="d-name">
              Full name <span className="text-red-700">*</span>
            </label>
            <input
              id="d-name"
              className="field"
              autoComplete="name"
              required
              value={delivery.name}
              onChange={(e) => setField('name', e.target.value)}
            />
            {submitted && errors.name && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="d-phone">
              Mobile number (WhatsApp) <span className="text-red-700">*</span>
            </label>
            <input
              id="d-phone"
              className="field"
              type="tel"
              inputMode="tel"
              placeholder="e.g. 9876543210 or +91 9876543210"
              autoComplete="tel"
              required
              value={delivery.phone}
              onChange={(e) => setField('phone', cleanPhone(e.target.value))}
            />
            {submitted && errors.phone && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="d-alt-phone">
              Alternate phone number <span className="text-espresso/50">(optional)</span>
            </label>
            <input
              id="d-alt-phone"
              className="field"
              type="tel"
              inputMode="tel"
              placeholder="Optional 10-digit number"
              autoComplete="tel"
              value={delivery.altPhone || ''}
              onChange={(e) => setField('altPhone', cleanPhone(e.target.value))}
            />
            {submitted && errors.altPhone && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {errors.altPhone}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="d-address">
              House/flat and street address <span className="text-red-700">*</span>
            </label>
            <textarea
              id="d-address"
              rows={2}
              className="field"
              placeholder="House/flat no., building, street, locality"
              autoComplete="street-address"
              required
              value={delivery.address || ''}
              onChange={(e) => setField('address', e.target.value)}
            />
            {submitted && errors.address && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="d-pin">
                PIN code <span className="text-red-700">*</span>
              </label>
              <input
                id="d-pin"
                className="field"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 digits"
                autoComplete="postal-code"
                required
                value={delivery.pin}
                onChange={(e) => setField('pin', cleanPin(e.target.value))}
              />
              {submitted && errors.pin && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.pin}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="d-city">
                City or town <span className="text-red-700">*</span>
              </label>
              <input
                id="d-city"
                className="field"
                autoComplete="address-level2"
                required
                value={delivery.city}
                onChange={(e) => setField('city', e.target.value)}
              />
              {submitted && errors.city && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="d-district">
                District <span className="text-red-700">*</span>
              </label>
              <input
                id="d-district"
                className="field"
                required
                value={delivery.district}
                onChange={(e) => setField('district', e.target.value)}
              />
              {submitted && errors.district && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.district}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="d-state">
                State <span className="text-red-700">*</span>
              </label>
              <select
                id="d-state"
                className="field"
                autoComplete="address-level1"
                required
                value={delivery.state}
                onChange={(e) => setField('state', e.target.value)}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {submitted && errors.state && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="d-notes">
              Notes <span className="text-espresso/50">(optional)</span>
            </label>
            <textarea
              id="d-notes"
              rows={2}
              className="field"
              placeholder="Delivery instructions, landmark, or gift note (optional)"
              value={delivery.notes || ''}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>

          <div className="pt-1">
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-espresso/85">
              <input
                type="checkbox"
                checked={Boolean(delivery.consent)}
                onChange={(e) => setField('consent', e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-burgundy"
              />
              <span>
                I consent to share my contact and delivery details with KAYATHI LABEL via WhatsApp
                to confirm and process this order. <span className="text-red-700">*</span>
              </span>
            </label>
            {submitted && errors.consent && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {errors.consent}
              </p>
            )}
          </div>

          <p className="text-xs text-espresso/65">
            Shared only in your WhatsApp message to KAYATHI LABEL. Saved on this device so you do
            not have to type it again.
          </p>
        </div>
      </div>

      {missing.length > 0 && (
        <p role="alert" className="text-sm font-medium text-red-700">
          Please choose {missing.join(' and ')} to continue.
        </p>
      )}

      {submitted && !isValid && (
        <p role="alert" className="text-sm font-medium text-red-700">
          Please complete all required delivery details above before opening WhatsApp.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={missing.length > 0}
          onClick={handleAddToBag}
          className="btn btn-outline flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BagIcon className="h-4 w-4" /> Add to bag
        </button>

        <button
          type="submit"
          disabled={missing.length > 0}
          className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <WhatsAppIcon /> Order on WhatsApp
        </button>
      </div>

      {sentWaUrl && (
        <div className="border border-[#1F7A4C]/30 bg-[#1F7A4C]/10 p-4 text-sm text-espresso">
          <div className="flex items-center gap-2 font-medium text-[#1F7A4C]">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Thank you! WhatsApp has been opened with your order details.</span>
          </div>
          <p className="mt-1 text-xs text-espresso/80">
            Please send the pre-filled message in WhatsApp so our team can confirm your order.
          </p>
          <a
            href={sentWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-burgundy underline underline-offset-4"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" /> Open WhatsApp again
          </a>
        </div>
      )}

      <p className="text-sm text-espresso/70">
        This opens WhatsApp with your product and delivery details filled in. Your order is only
        confirmed once KAYATHI LABEL replies and agrees availability and delivery with you.
      </p>
    </form>
  );
}
