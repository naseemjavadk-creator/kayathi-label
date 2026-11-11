export const EMPTY_DELIVERY = {
  name: '',
  phone: '',
  altPhone: '',
  address: '',
  house: '',
  street: '',
  landmark: '',
  pin: '',
  city: '',
  district: '',
  state: '',
  notes: '',
  consent: false,
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// Normalize an Indian mobile input (allows "+91", "91", leading "0", spaces, or dashes) to 10 digits.
export function normalizeIndianPhone(v) {
  const raw = String(v || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(2, 12);
  return digits.slice(0, 10);
}

// Allows typing "+91" or 10 digits in the input while keeping it clean.
export const cleanPhone = (v) => {
  const str = String(v || '');
  const trimmed = str.replace(/[^\d+\s-]/g, '');
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.trim().startsWith('+91')) {
    const rest = digits.startsWith('91') ? digits.slice(2, 12) : digits.slice(0, 10);
    return rest ? `+91 ${rest}` : '+91';
  }
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2, 12);
  }
  return digits.slice(0, 10);
};

export const isPhone = (v) => /^[6-9]\d{9}$/.test(normalizeIndianPhone(v));

// PIN code: 6 digits, first digit 1-9.
export const cleanPin = (v) => String(v || '').replace(/\D/g, '').slice(0, 6);
export const isPin = (v) => /^[1-9]\d{5}$/.test(String(v || '').trim());

export function getCombinedAddress(d) {
  if (!d) return '';
  const t = (x) => String(x || '').trim();
  if (t(d.address)) return t(d.address);
  return [t(d.house), t(d.street), t(d.landmark)].filter(Boolean).join(', ');
}

export function validateDelivery(d = {}) {
  const t = (x) => String(x || '').trim();
  const errors = {};

  if (!t(d.name)) {
    errors.name = 'Please enter your full name.';
  }

  if (!t(d.phone)) {
    errors.phone = 'Please enter your 10-digit WhatsApp mobile number.';
  } else if (!isPhone(d.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).';
  }

  if (t(d.altPhone) && !isPhone(d.altPhone)) {
    errors.altPhone = 'Enter a valid 10-digit Indian phone number (or leave blank).';
  }

  const addr = getCombinedAddress(d);
  if (!addr) {
    errors.address = 'Please enter your house/flat and street address.';
  }

  if (!t(d.pin)) {
    errors.pin = 'Please enter your 6-digit PIN code.';
  } else if (!isPin(d.pin)) {
    errors.pin = 'Enter a valid 6-digit PIN code.';
  }

  if (!t(d.city)) {
    errors.city = 'Please enter your city or town.';
  }

  if (!t(d.district)) {
    errors.district = 'Please enter your district.';
  }

  if (!t(d.state) || !INDIAN_STATES.includes(t(d.state))) {
    errors.state = 'Please select your state.';
  }

  if (!d.consent) {
    errors.consent = 'Please confirm your consent to share these details on WhatsApp.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function formatIndianPhone(v) {
  const p = normalizeIndianPhone(v);
  if (p.length === 10) return `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
  return String(v || '').trim();
}

// Lines added to the WhatsApp message. Only filled-in fields are included.
export function deliveryLines(d) {
  if (!d) return [];
  const t = (x) => String(x || '').trim();
  const out = [];
  if (t(d.name)) out.push(`Name: ${t(d.name)}`);
  if (t(d.phone)) out.push(`Mobile (WhatsApp): ${formatIndianPhone(d.phone)}`);
  if (t(d.altPhone)) out.push(`Alternate Phone: ${formatIndianPhone(d.altPhone)}`);
  const address = getCombinedAddress(d);
  if (address) out.push(`Address: ${address.replace(/\s*\n\s*/g, ', ')}`);
  if (t(d.pin)) out.push(`PIN Code: ${t(d.pin)}`);
  if (t(d.city)) out.push(`City/Town: ${t(d.city)}`);
  if (t(d.district)) out.push(`District: ${t(d.district)}`);
  if (t(d.state)) out.push(`State: ${t(d.state)}`);
  if (t(d.notes)) out.push(`Notes: ${t(d.notes).replace(/\s*\n\s*/g, ' ')}`);
  return out;
}

// Remembered on the customer's own device only (never sent to our servers or placed in URLs).
const KEY = 'kl_delivery';
export function loadDelivery() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    const combined =
      saved.address ||
      [saved.house, saved.street, saved.landmark]
        .map((x) => String(x || '').trim())
        .filter(Boolean)
        .join(', ');
    return {
      ...EMPTY_DELIVERY,
      ...saved,
      address: combined || '',
      consent: Boolean(saved.consent),
    };
  } catch {
    return EMPTY_DELIVERY;
  }
}

export function saveDelivery(d) {
  try {
    const toSave = { ...d };
    localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch {
    /* storage unavailable */
  }
}
