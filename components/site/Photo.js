import Image from 'next/image';

// Fills its (relative, sized) parent. Shows an honest placeholder when there is no photo yet.
export default function Photo({ src, alt = '', sizes = '100vw', priority = false, className = '' }) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gold/30 px-4 text-center font-serif text-lg italic text-burgundy/60">
        Photo coming soon
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
  );
}
