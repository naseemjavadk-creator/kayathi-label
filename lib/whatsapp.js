import { digitsOnly, inr } from './format';
import { SITE_CONFIG } from '@/config/site';

// wa.me opens the WhatsApp app on phones and WhatsApp Web / Desktop on computers.
export function waLink(number, text) {
  return `https://wa.me/${digitsOnly(number || SITE_CONFIG.whatsapp)}?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage({ product, size = '', colour = '', qty = 1, url = '' }) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://kayathi-label-6f9d.vercel.app').replace(/\/$/, '');
  const resolvedUrl = url || (product?.slug ? `${origin}/product/${product.slug}` : '');

  const lines = [
    'Hello KAYATHI LABEL!',
    '',
    'I would like to order this.',
    '',
    `Product Name: ${product?.name || ''}`,
  ];
  if (product?.sku) lines.push(`Product ID: ${product.sku}`);
  if (product?.price !== undefined && product?.price !== null) {
    lines.push(`Price: ${inr(product.price)}`);
  }
  if (size) lines.push(`Size: ${size}`);
  if (colour) lines.push(`Colour: ${colour}`);
  if (qty && qty > 1) lines.push(`Quantity: ${qty}`);
  if (resolvedUrl) lines.push(`Product URL: ${resolvedUrl}`);
  lines.push('', 'Please confirm availability and delivery details.');
  return lines.join('\n');
}

export function buildWhatsAppLink({ product, url = '', size = '', colour = '', qty = 1, whatsapp = SITE_CONFIG.whatsapp }) {
  return waLink(whatsapp, buildOrderMessage({ product, size, colour, qty, url }));
}

export function buildCartOrderMessage(items, total) {
  const lines = [
    'Hello KAYATHI LABEL!',
    '',
    'I would like to order these items from my cart:',
    '',
  ];
  items.forEach((it, idx) => {
    const details = [
      it.size ? `Size: ${it.size}` : null,
      it.colour ? `Colour: ${it.colour}` : null,
    ].filter(Boolean).join(', ');
    lines.push(
      `${idx + 1}. ${it.name} (ID: ${it.sku})`,
      `   Qty: ${it.qty} × ${inr(it.price)} = ${inr(Number(it.price) * it.qty)}${details ? ` (${details})` : ''}`
    );
    if (it.url) lines.push(`   Link: ${it.url}`);
  });
  lines.push('', `Total: ${inr(total)}`, '', 'Please confirm availability and delivery details.');
  return lines.join('\n');
}

export const GENERAL_MESSAGE =
  'Hello KAYATHI LABEL! I would like to know more about your collections.';
