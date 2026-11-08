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
      <div className="container-x grid grid-cols-2 gap-6 py-7 md:grid-cols-4 md:gap-8 md:py-9">
        {items.map((item) => {
          const Icon = ICON_MAP[item.id] || ShieldCheckIcon;
          return (
            <div key={item.id} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-burgundy text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-medium leading-snug text-espresso md:text-xl">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed text-espresso/75 md:text-sm">
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
