'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Twinkles from './Twinkles';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { HERO_CONFIG, HERO_SLIDES, getActiveHeroSlides } from '@/config/hero';
import { SITE_CONFIG } from '@/config/site';

export default function HeroCarousel({ dbBanners = [] }) {
  const mappedDbSlides = (dbBanners || []).map((b, idx) => ({
    id: b.id || `db-banner-${idx}`,
    active: true,
    desktopImage: b.image_url || '',
    mobileImage: b.mobile_image_url || b.image_url || '',
    imageAlt: b.title || `${SITE_CONFIG.brandName} featured banner`,
    eyebrow: SITE_CONFIG.tagline.toUpperCase(),
    heading: b.title || SITE_CONFIG.tagline,
    subheading: b.subtitle || SITE_CONFIG.valueProposition,
    ctaLabel: 'Shop now',
    ctaHref: b.link_url || '/shop',
    secondaryCtaLabel: 'New arrivals',
    secondaryCtaHref: '/new-arrivals',
  }));

  const configSlides = getActiveHeroSlides(HERO_SLIDES);
  const slides = [...mappedDbSlides, ...configSlides].slice(0, 5);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const count = slides.length;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const next = useCallback(() => {
    if (count <= 1) return;
    setIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count <= 1) return;
    setIndex((curr) => (curr - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = setInterval(next, HERO_CONFIG.autoPlayIntervalMs || 5000);
    return () => clearInterval(timer);
  }, [count, paused, reducedMotion, next]);

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  }

  function handleTouchStart(e) {
    setPaused(true);
    if (e.touches && e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    if (
      touchStartX.current !== null &&
      e.changedTouches &&
      e.changedTouches.length === 1
    ) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setPaused(false);
  }

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${SITE_CONFIG.brandName} featured collections`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden bg-burgundy text-ivory focus:outline-none"
    >
      <div className="relative min-h-[540px] w-full md:min-h-[480px] lg:min-h-[540px]">
        {slides.map((slide, idx) => {
          const isActive = idx === index;
          const isFirst = idx === 0;
          const HeadingTag = 'h2';
          const hasPhoto = Boolean(slide.desktopImage || slide.mobileImage);
          const zoomClass =
            !reducedMotion && HERO_CONFIG.enableSubtleZoom && isActive
              ? 'scale-[1.02] transition-transform duration-[5000ms] ease-out'
              : 'scale-100 transition-transform duration-700';

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${count}: ${slide.heading}`}
              aria-hidden={!isActive}
              className={` inset-0 transition-opacity duration-700 ${
                isActive
                  ? 'relative z-10 opacity-100'
                  : 'pointer-events-none absolute z-0 opacity-0'
              }`}
            >
              <div className="grid min-h-[540px] items-center md:min-h-[480px] md:grid-cols-2 lg:min-h-[540px]">
                {/* Left Editorial Copy Panel */}
                <div className="relative flex flex-col justify-center overflow-hidden px-6 py-12 md:pl-16 md:pr-12 md:py-14 lg:pl-20 lg:pr-16">
                  <Twinkles />
                  {slide.eyebrow && (
                    <p className="relative z-10 mb-3 text-xs font-medium uppercase tracking-[0.24em] text-gold">
                      {slide.eyebrow}
                    </p>
                  )}
                  <HeadingTag className="relative z-10 max-w-lg font-serif text-5xl leading-[1.05] !text-ivory md:text-6xl lg:text-7xl">
                    {slide.heading}
                  </HeadingTag>
                  {slide.valueProp && (
                    <p className="relative z-10 mt-4 max-w-md font-medium text-gold md:text-lg">
                      {slide.valueProp}
                    </p>
                  )}
                  {slide.subheading && (
                    <p className="relative z-10 mt-3 max-w-md text-sm leading-relaxed text-ivory/85 md:text-base">
                      {slide.subheading}
                    </p>
                  )}
                  <div className="relative z-10 mt-9 flex flex-wrap gap-3">
                    {slide.ctaLabel && slide.ctaHref && (
                      <Link
                        href={slide.ctaHref}
                        tabIndex={isActive ? 0 : -1}
                        className="btn btn-gold"
                      >
                        {slide.ctaLabel}
                      </Link>
                    )}
                    {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                      <Link
                        href={slide.secondaryCtaHref}
                        tabIndex={isActive ? 0 : -1}
                        className="btn btn-outline-light"
                      >
                        {slide.secondaryCtaLabel}
                      </Link>
                    )}
                    {slide.tertiaryCtaLabel && slide.tertiaryCtaHref && (
                      <Link
                        href={slide.tertiaryCtaHref}
                        tabIndex={isActive ? 0 : -1}
                        className="btn btn-outline-light"
                      >
                        {slide.tertiaryCtaLabel}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Visual / Banner Panel (Reserved Aspect Ratio, No Layout Shift) */}
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-burgundy-dark/50">
                  {hasPhoto ? (
                    <Link
                      href={slide.ctaHref || '/shop'}
                      tabIndex={isActive ? 0 : -1}
                      aria-label={slide.ctaLabel || slide.heading}
                      className="group relative block w-full"
                    >
                      {/* Desktop Image */}
                      <div className={slide.mobileImage && slide.mobileImage !== slide.desktopImage ? 'hidden md:block' : 'block'}>
                        <Image
                          src={slide.desktopImage || slide.mobileImage}
                          alt={slide.imageAlt || slide.heading}
                          width={1024}
                          height={559}
                          priority={isFirst}
                          loading={isFirst ? 'eager' : 'lazy'}
                          sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw"
                          className={`block h-auto w-full object-contain ${zoomClass}`}
                        />
                      </div>
                      {/* Optional Dedicated Mobile Image */}
                      {slide.mobileImage && slide.mobileImage !== slide.desktopImage && (
                        <div className="block md:hidden">
                          <Image
                            src={slide.mobileImage}
                            alt={slide.imageAlt || slide.heading}
                            width={900}
                            height={1200}
                            priority={isFirst}
                            loading={isFirst ? 'eager' : 'lazy'}
                            sizes="100vw"
                            className={`block h-auto w-full object-cover ${zoomClass}`}
                          />
                        </div>
                      )}
                      {slide.desktopImage === '/brand/hero-banner.jpg' && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-[65.8%] top-[80.3%] h-[7.8%] w-[18.1%] rounded-full transition duration-200 group-hover:bg-gold/20 group-hover:ring-2 group-hover:ring-gold group-active:scale-95"
                        />
                      )}
                    </Link>
                  ) : (
                    /* Branded Burgundy & Gold Gradient Fallback with Logo */
                    <Link
                      href={slide.ctaHref || '/shop'}
                      tabIndex={isActive ? 0 : -1}
                      aria-label={slide.ctaLabel || slide.heading}
                      className="group relative flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-burgundy-dark via-burgundy to-[#7A1B38] p-8 text-center"
                    >
                      <div className="pointer-events-none absolute inset-4 border border-gold/35 transition-all duration-500 group-hover:inset-5 group-hover:border-gold/60" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.18)_0%,transparent_70%)]" />
                      <div className={`relative h-32 w-44 md:h-40 md:w-56 ${zoomClass}`}>
                        <Image
                          src="/brand/logo-on-burgundy.png"
                          alt={SITE_CONFIG.brandName}
                          fill
                          sizes="224px"
                          loading={isFirst ? 'eager' : 'lazy'}
                          className="object-contain"
                        />
                      </div>
                      <span className="relative mt-3 text-xs uppercase tracking-[0.26em] text-gold/90">
                        {slide.eyebrow || SITE_CONFIG.tagline}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Control Bar: Prev Arrow, Slide Dots, Next Arrow (never overlaps slide text) */}
      {count > 1 && (
        <div className="relative z-20 flex items-center justify-center gap-4 border-t border-gold/15 bg-burgundy-dark/60 py-2.5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-burgundy-dark/80 text-gold transition hover:border-gold hover:bg-burgundy hover:text-ivory"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5" role="tablist" aria-label="Choose slide">
            {slides.map((s, idx) => {
              const active = idx === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show slide ${idx + 1}: ${s.heading}`}
                  onClick={() => setIndex(idx)}
                  className={`h-2.5 rounded-full border border-gold transition-all duration-300 ${
                    active ? 'w-7 bg-gold' : 'w-2.5 bg-transparent hover:bg-gold/40'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-burgundy-dark/80 text-gold transition hover:border-gold hover:bg-burgundy hover:text-ivory"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}

