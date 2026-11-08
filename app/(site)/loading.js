export default function Loading() {
  return (
    <div className="container-x py-12 md:py-16" role="status" aria-label="Loading page">
      <div className="h-64 w-full animate-pulse bg-burgundy/15 md:h-96" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="space-y-3">
            <div className="aspect-[3/4] w-full animate-pulse bg-gold/25" />
            <div className="h-4 w-3/4 animate-pulse bg-espresso/10" />
            <div className="h-4 w-1/3 animate-pulse bg-espresso/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
