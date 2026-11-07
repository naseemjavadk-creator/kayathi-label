// Extra product fields shown in the owner dashboard, depending on the category's group.
const material = { key: 'material', label: 'Material' };
const finish = { key: 'finish', label: 'Finish' };
const dimensions = { key: 'dimensions', label: 'Product dimensions' };

export const GROUPS = [
  { value: 'saree', label: 'Sarees' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'bangle', label: 'Bangles & bracelets' },
  { value: 'ring', label: 'Rings' },
  { value: 'general', label: 'General accessories' },
];

export const ATTRIBUTE_FIELDS = {
  saree: [
    { key: 'fabric', label: 'Fabric type' },
    { key: 'length', label: 'Saree length', placeholder: 'e.g. 5.5 m' },
    { key: 'blouse_piece', label: 'Blouse piece', type: 'select', options: ['Included', 'Not included'] },
    { key: 'pattern', label: 'Design and pattern' },
    { key: 'care', label: 'Care instructions', type: 'textarea' },
  ],
  jewellery: [material, finish, dimensions, { key: 'jewellery_type', label: 'Jewellery type' }],
  bangle: [material, { key: 'available_sets', label: 'Available sets', placeholder: 'e.g. Set of 4' }],
  ring: [
    { key: 'ring_type', label: 'Ring size type', type: 'select', options: ['Adjustable', 'Fixed size'] },
    material,
    finish,
  ],
  general: [material, finish, dimensions],
};

// Every possible label, so the public page can show saved values for any group.
export const ALL_ATTRIBUTE_LABELS = Object.values(ATTRIBUTE_FIELDS)
  .flat()
  .reduce((acc, f) => ({ ...acc, [f.key]: f.label }), {});
