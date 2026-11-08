export default function Loading() {
  return (
    <div className="w-full" role="status" aria-label="Loading storefront content">
      {/* Hero Skeleton */}
      <div className="min-h-[480px] w-full animate-pulse bg-burgundy/15" />

      {/* Trust Strip Skeleton */}
      <div className="border-b border-espresso/10 bg-ivory-deep py-7">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-burgundy/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-espresso/15 animate-pulse" />
                <div className="h-3 w-full bg-espresso/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tiles & Product Grid Skeleton */}
      <div className="container-x py-12 md:py-16">
        <div className="mb-6 h-8 w-52 animate-pulse bg-espresso/15" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="aspect-square w-full animate-pulse bg-gold/25" />
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="space-y-3">
              <div className="aspect-[3/4] w-full animate-pulse bg-gold/25" />
              <div className="h-4 w-3/4 animate-pulse bg-espresso/10" />
              <div className="h-4 w-1/3 animate-pulse bg-espresso/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
