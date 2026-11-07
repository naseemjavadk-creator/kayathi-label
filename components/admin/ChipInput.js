'use client';
import { useState } from 'react';

// Type a value and press Enter (or comma) to add it. Used for colours and sizes.
export default function ChipInput({ label, values, onChange, placeholder, hint }) {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setText('');
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="field"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="btn btn-outline !px-4">Add</button>
      </div>
      {hint && <p className="mt-1 text-xs text-espresso/60">{hint}</p>}
      {values.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <li key={v} className="inline-flex items-center gap-2 border border-espresso/25 bg-white px-3 py-1 text-sm">
              {v}
              <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="text-burgundy">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
