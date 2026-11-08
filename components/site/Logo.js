import Image from 'next/image';

// The original KAYATHI LABEL logo, shown untouched (only scaled). It is gold artwork on burgundy,
// so it is used on burgundy backgrounds (header and footer). The owner can replace the file
// from the dashboard (Website > Logo); the default is the supplied file in /public/brand.
export const DEFAULT_LOGO = '/brand/logo-on-burgundy.png';

export default function Logo({ src, className = '', priority = false }) {
  return (
    <Image
      src={src || DEFAULT_LOGO}
      alt="KAYATHI LABEL"
      width={747}
      height={600}
      priority={priority}
      sizes="(min-width: 768px) 140px, 120px"
      className={`h-24 w-auto md:h-28 ${className}`}
    />
  );
}
