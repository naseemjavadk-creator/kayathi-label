import Image from 'next/image';
import { DEFAULT_LOGO } from './Logo';

// Fills its (relative, sized) parent. Shows a tasteful branded burgundy-gradient + logo fallback when there is no photo yet.
export default function Photo({ src, alt = 'KAYATHI LABEL', sizes = '100vw', priority = false, className = '' }) {
  if (!src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-burgundy via-logo to-burgundy-dark p-6"
        aria-label={alt || 'KAYATHI LABEL'}
      >
        <Image
          src={DEFAULT_LOGO}
          alt={alt || 'KAYATHI LABEL'}
          width={240}
          height={193}
          sizes="180px"
          className="h-auto max-h-[60%] w-3/5 max-w-[160px] object-contain opacity-85"
        />
      </div>
    );
  }
  return (
    <Image src={src} alt={alt || 'KAYATHI LABEL'} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
  );
}
