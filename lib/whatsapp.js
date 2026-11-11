import { digitsOnly, inr } from './format';
import { deliveryLines } from './delivery';

const DEFAULT_WHATSAPP = '+917907139297';

// wa.me opens the WhatsApp app on phones and WhatsApp Web / Desktop on computers.
export function waLink(number, text) {
  return `https://wa.me/${digitsOnly(number || DEFAULT_WHATSAPP)}?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage({ product, size, colour, qty = 1, url, delivery }) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://kayathi-label-s6aa.vercel.app').replace(/\/$/, '');
  const resolvedUrl = url || (product?.slug ? `${origin}/product/${product.slug}` : '');
  const unitPrice = Number(product?.price) || 0;
  const lineTotal = unitPrice * Number(qty || 1);

  const lines = [
    'Hello KAYATHI LABEL!',
    '',
    'I would like to place an order for this product:',
    '',
    `Product Name: ${product?.name || ''}`,
  ];
  if (product?.sku) lines.push(`SKU: ${product.sku}`);
  if (colour) lines.push(`Colour: ${colour}`);
  if (size) lines.push(`Size: ${size}`);
  lines.push(`Quantity: ${qty}`);
  lines.push(`Price: ${inr(unitPrice)}`);
  lines.push(`Line Total: ${inr(lineTotal)}`);
  if (resolvedUrl) lines.push(`Product Link: ${resolvedUrl}`);
  lines.push('', `Grand Total: ${inr(lineTotal)}`);

  const dl = deliveryLines(delivery);
  if (dl.length) lines.push('', 'Customer & Delivery Details:', ...dl);
  lines.push('', 'Please confirm availability and delivery details.');
  return lines.join('\n');
}

export function buildWhatsAppLink({
  product,
  url = '',
  size = '',
  colour = '',
  qty = 1,
  delivery,
  whatsapp = DEFAULT_WHATSAPP,
}) {
  return waLink(whatsapp, buildOrderMessage({ product, size, colour, qty, url, delivery }));
}

export function buildCartOrderMessage(items, total, delivery) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://kayathi-label-s6aa.vercel.app').replace(/\/$/, '');

  const lines = [
    'Hello KAYATHI LABEL!',
    '',
    'I would like to place an order for the following items:',
    '',
  ];

  items.forEach((it, idx) => {
    const unitPrice = Number(it.price) || 0;
    const qty = Number(it.qty) || 1;
    const lineTotal = unitPrice * qty;
    const details = [
      it.colour ? `Colour: ${it.colour}` : null,
      it.size ? `Size: ${it.size}` : null,
    ]
      .filter(Boolean)
      .join(' | ');
    const resolvedUrl = it.url || (it.slug ? `${origin}/product/${it.slug}` : '');

    lines.push(`${idx + 1}. ${it.name}`);
    if (it.sku) lines.push(`   SKU: ${it.sku}`);
    if (details) lines.push(`   ${details}`);
    lines.push(`   Quantity: ${qty} × ${inr(unitPrice)} = ${inr(lineTotal)}`);
    if (resolvedUrl) lines.push(`   Product Link: ${resolvedUrl}`);
  });

  lines.push('', `Grand Total: ${inr(total)}`);

  const dl = deliveryLines(delivery);
  if (dl.length) {
    lines.push('', 'Customer & Delivery Details:', ...dl);
  }

  lines.push('', 'Please confirm availability and delivery details.');
  return lines.join('\n');
}

export const GENERAL_MESSAGE =
  'Hello KAYATHI LABEL! I would like to know more about your collections.';
