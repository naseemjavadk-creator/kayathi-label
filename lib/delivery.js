export const EMPTY_DELIVERY = {
  name: '', phone: '', house: '', street: '', landmark: '', city: '', district: '', state: '', pin: '',
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// Mobile: 10 digits starting 6-9. A pasted "+91 98765 43210" is reduced to the 10 digits.
export const cleanPhone = (v) => {
  const d = String(v || '').replace(/\D/g, '');
  return (d.length > 10 && d.startsWith('91') ? d.slice(2) : d).slice(0, 10);
};
export const isPhone = (v) => /^[6-9]\d{9}$/.test(String(v || '').trim());
// PIN code: 6 digits, first digit 1-9.
export const cleanPin = (v) => String(v || '').replace(/\D/g, '').slice(0, 6);
export const isPin = (v) => /^[1-9]\d{5}$/.test(String(v || '').trim());

// Lines added to the WhatsApp message. Only filled-in fields are included.
export function deliveryLines(d) {
  if (!d) return [];
  const t = (x) => String(x || '').trim();
  const out = [];
  if (t(d.name)) out.push(`Name: ${t(d.name)}`);
  if (t(d.phone)) {
    const p = t(d.phone);
    out.push(`Mobile: +91 ${p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p}`);
  }
  const street = t(d.street) || t(d.address); // older saved data used a single address box
  const address = [t(d.house), street].filter(Boolean).join(', ');
  if (address) out.push(`Address: ${address.replace(/\s*\n\s*/g, ', ')}`);
  if (t(d.landmark)) out.push(`Landmark: ${t(d.landmark)}`);
  if (t(d.pin)) out.push(`PIN code: ${t(d.pin)}`);
  if (t(d.city)) out.push(`City: ${t(d.city)}`);
  if (t(d.district)) out.push(`District: ${t(d.district)}`);
  if (t(d.state)) out.push(`State: ${t(d.state)}`);
  return out;
}

// Remembered on the customer's own device only (never sent to our servers).
const KEY = 'kl_delivery';
export function loadDelivery() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved.address && !saved.street) saved.street = saved.address;
    delete saved.address;
    return { ...EMPTY_DELIVERY, ...saved };
  } catch {
    return EMPTY_DELIVERY;
  }
}
export function saveDelivery(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable */ }
}
