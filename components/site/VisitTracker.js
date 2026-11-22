'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

const KEY = 'kl_vid';
export const OWNER_KEY = 'kl_owner'; // set on any browser that has opened the owner dashboard

// A random number kept in this browser, so one person opening 5 pages counts as 1 visitor.
function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 64);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // private mode / storage blocked: skip counting
  }
}

// Turns the address the visitor came from into a simple name like "Instagram".
function sourceName() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_source');
    if (utm) return utm.toLowerCase().slice(0, 60);
    const ref = document.referrer;
    if (!ref) return '';
    const host = new URL(ref).hostname.replace(/^www\.|^m\.|^l\.|^lm\./, '');
    if (host === window.location.hostname) return '';
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('facebook') || host === 'fb.com') return 'facebook';
    if (host.includes('whatsapp') || host === 'wa.me') return 'whatsapp';
    if (host.includes('google')) return 'google';
    if (host.includes('youtube')) return 'youtube';
    if (host === 't.co' || host.includes('twitter') || host === 'x.com') return 'x / twitter';
    return host.slice(0, 60);
  } catch {
    return '';
  }
}

function deviceType() {
  const w = window.innerWidth || 0;
  if (w && w < 768) return 'mobile';
  if (w && w < 1100 && navigator.maxTouchPoints > 0) return 'tablet';
  return 'desktop';
}

let firstSource = null; // set once per page load

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || navigator.webdriver) return; // skip robots
    try {
      if (localStorage.getItem(OWNER_KEY)) return; // don't count the owner's own visits
    } catch {}
    const id = visitorId();
    if (!id) return;
    // Only the first page of a visit is the "entry", with where they came from.
    // A visit = same browser tab session (sessionStorage), so a refresh is not a new visit.
    let isEntry = false;
    let referrer = '';
    if (firstSource === null) {
      firstSource = sourceName();
      try {
        if (!sessionStorage.getItem(KEY)) {
          sessionStorage.setItem(KEY, '1');
          isEntry = true;
          referrer = firstSource;
        }
      } catch {
        isEntry = true;
        referrer = firstSource;
      }
    }
    supabaseBrowser()
      .from('page_views')
      .insert({ visitor_id: id, path: pathname.slice(0, 300), referrer, device: deviceType(), is_entry: isEntry })
      .then(() => {}, () => {});
  }, [pathname]);

  return null;
}
