'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/coming-soon', label: 'Coming soon' },
  { href: '/admin/settings', label: 'Website' },
];

export default function AdminShell({ email, children }) {
  const path = usePathname();
  const router = useRouter();
  const active = (href) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ivory-deep md:flex">
      <aside className="border-b border-espresso/15 bg-burgundy text-ivory md:min-h-screen md:w-60 md:shrink-0 md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:block md:px-6 md:py-6">
          <p className="font-serif text-xl tracking-[0.2em] text-gold">KAYATHI LABEL</p>
          <button type="button" onClick={signOut} className="text-sm text-ivory/80 underline-offset-4 hover:underline md:mt-2 md:block">Sign out</button>
        </div>
        <nav aria-label="Owner dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? 'page' : undefined}
              className={`whitespace-nowrap px-4 py-2.5 text-sm ${active(l.href) ? 'bg-ivory text-burgundy' : 'text-ivory/85 hover:bg-burgundy-dark'}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="whitespace-nowrap px-4 py-2.5 text-sm text-gold hover:bg-burgundy-dark">View website</Link>
        </nav>
        <p className="hidden px-6 pt-6 text-xs text-ivory/60 md:block">Signed in as<br />{email}</p>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-10">{children}</div>
    </div>
  );
}
