'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';
import { CloseIcon } from '@/components/Icons';

export default function AnnouncementBar() {
  const bar = SITE_CONFIG.announcementBar;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!bar?.enabled) return;
    try {
      const stored = window.localStorage.getItem(bar.storageKey || 'kayathi_announcement_dismissed_v1');
      if (stored === '1') setDismissed(true);
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, [bar]);

  if (!bar?.enabled || !bar?.text || dismissed) return null;

  if (bar.expiresAt) {
    const expMs = Date.parse(`${bar.expiresAt}T23:59:59`);
    if (!Number.isNaN(expMs) && Date.now() > expMs) return null;
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(bar.storageKey || 'kayathi_announcement_dismissed_v1', '1');
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <div
      role="region"
      aria-label="Store announcement"
      className="border-b border-gold/25 bg-burgundy-dark text-ivory"
    >
      <div className="container-x flex items-center justify-between gap-3 py-2 text-xs">
        <span className="hidden w-6 sm:inline-block" aria-hidden="true" />
        <p className="flex-1 truncate text-center tracking-wide text-ivory/95 sm:whitespace-normal">
          <span>{bar.text}</span>
          {bar.linkText && bar.linkHref && (
            <Link
              href={bar.linkHref}
              className="ml-2 font-medium text-gold underline-offset-4 hover:underline"
            >
              {bar.linkText}
            </Link>
          )}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ivory/80 transition hover:text-gold"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
