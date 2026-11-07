'use client';
import { useCallback, useState } from 'react';

export function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((message, type = 'ok') => {
    setT({ message, type });
    setTimeout(() => setT(null), 4500);
  }, []);
  const node = t ? (
    <div
      role={t.type === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 px-5 py-3 text-sm shadow-lg ${t.type === 'error' ? 'bg-red-800 text-white' : 'bg-espresso text-ivory'}`}
    >
      {t.message}
    </div>
  ) : null;
  return [node, show];
}
