import { digitsOnly, inr } from './format';
import { deliveryLines } from './delivery';

// wa.me opens the WhatsApp app on phones and WhatsApp Web / Desktop on computers.
export function waLink(number, text) {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage({ product, size, colour, qty, url, delivery }) {
  const lines = [
    'Hello KAYATHI LABEL!',
    '',
    'I am interested in ordering this product.',
    '',
    `Product Name: ${product.name}`,
    `Product ID: ${product.sku}`,
    `Price: ${inr(product.price)}`,
  ];
  if (size) lines.push(`Size: ${size}`);
  if (colour) lines.push(`Colour: ${colour}`);
  lines.push(`Quantity: ${qty}`);
  if (url) lines.push(`Product Link: ${url}`);
  const dl = deliveryLines(delivery);
  if (dl.length) lines.push('', 'Delivery details:', ...dl);
  lines.push('', 'Please confirm availability and delivery details.');
  return lines.join('\n');
}

export const GENERAL_MESSAGE =
  'Hello KAYATHI LABEL! I would like to know more about your collections.';

export function buildWhatsAppLink({ product, url = '', size = '', colour = '', qty = 1, delivery, whatsapp = '+917907139297' }) {
  return waLink(whatsapp, buildOrderMessage({ product, size, colour, qty, url, delivery }));
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

