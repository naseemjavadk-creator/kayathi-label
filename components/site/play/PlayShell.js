import Link from 'next/link';

export default function PlayShell({ title, intro, children }) {
  return (
    <div className="container-x py-12 md:py-16">
      <p className="mb-2 text-sm"><Link href="/play" className="underline underline-offset-4">Fun zone</Link></p>
      <h1 className="text-5xl md:text-6xl">{title}</h1>
      <p className="mt-3 max-w-xl text-espresso/75">{intro}</p>
      <div className="mt-8 max-w-3xl">{children}</div>
    </div>
  );
}
