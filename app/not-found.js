import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <h1 className="text-5xl">Page not found</h1>
      <p className="mt-3 text-espresso/75">The page you wanted may have moved, or the piece may no longer be listed.</p>
      <Link href="/shop" className="btn btn-primary mt-7">Browse the collection</Link>
    </div>
  );
}
