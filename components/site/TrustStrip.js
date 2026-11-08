import { SITE_CONFIG } from '@/config/site';
import { ShieldCheckIcon, RefreshIcon, PackageIcon, TruckIcon } from '@/components/Icons';

const ICON_MAP = {
  authentic: ShieldCheckIcon,
  exchange: RefreshIcon,
  packaging: PackageIcon,
  delivery: TruckIcon,
};

export default function TrustStrip({ items = SITE_CONFIG.trustItems }) {
  if (!items || items.length === 0) return null;
  return (
    <section aria-label="Our promises" className="border-b border-espresso/10 bg-ivory-deep">
      <div className="container-x grid grid-cols-2 gap-4 py-3.5 md:grid-cols-4 md:gap-6 md:py-4">
        {items.map((item) => {
          const Icon = ICON_MAP[item.id] || ShieldCheckIcon;
          return (
            <div key={item.id} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="font-serif text-sm font-medium leading-tight text-espresso md:text-base">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-espresso/70 md:text-xs">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
