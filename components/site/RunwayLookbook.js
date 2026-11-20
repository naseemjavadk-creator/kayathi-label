'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Michroma } from 'next/font/google';
import { useCart } from './Cart';
import { inr } from '@/lib/format';
import './runway-lookbook.css';

const display = Michroma({ weight: '400', subsets: ['latin'], variable: '--font-runway', display: 'swap' });

const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/*
 * Stage controller, ported from the Shopify section's vanilla JS.
 * It positions the models imperatively (transforms on every drag frame would be too
 * expensive through React state) and reports the active look back via onChange.
 */
class RunwayStage {
  constructor(root, { first, onChange, onSwipe }) {
    this.onSwipe = onSwipe;
    this.root = root;
    this.stage = root.querySelector('[data-rl-stage]');
    this.models = Array.from(root.querySelectorAll('[data-rl-model]'));
    this.odo = root.querySelector('[data-rl-odo]');
    this.n = this.models.length;
    this.first = first;
    this.onChange = onChange;
    this.active = 0;
    this.pos = 0;
    this.prevD = [];
    this.timers = {};
    this.drag = null;
    this.suppressClick = false;
    this.wheelAcc = 0;
    this.wheelLocked = false;
    this.mqMobile = window.matchMedia('(max-width: 819.98px)');
    this.mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ac = new AbortController();

    if (!this.n || !this.stage) {
      root.classList.add('rl-is-ready');
      return;
    }
    this.buildOdometer();
    this.setOdometer(this.first);
    this.bind();
    this.measure();
    this.layout(0, true);
    this.raf = requestAnimationFrame(() => {
      root.classList.add('rl-is-ready');
      this.reveal();
    });
  }

  reduced() { return this.mqMotion.matches; }

  reveal() {
    this.stage.classList.add('is-instant');
    this.prevD = [];
    this.layout(this.pos, true);
    requestAnimationFrame(() => this.stage && this.stage.classList.remove('is-instant'));
  }

  measure() {
    this.W = this.stage.clientWidth;
    this.H = this.stage.clientHeight;
    this.mw = this.models[0].offsetWidth;
    this.mobile = this.mqMobile.matches;
  }

  /* Signed distance of model i from the current position.
     0 = front, positive = further back, (-1, 0) = walking out past the camera. */
  dist(i, pos) {
    const n = this.n;
    let d = mod(i - pos, n);
    if (n >= 3 && d >= n - 1 - 1e-6) d -= n;
    return d;
  }

  geometry(d) {
    const { W, H, mobile: m } = this;
    const frontX = W * 0.5;
    const vpX = W * (m ? 0.74 : 0.72);
    const floorY = H * 0.95;
    const horizonY = H * (m ? 0.3 : 0.32);
    const limit = this.n >= 3 ? this.n - 1 : this.n;

    if (d < 0) {
      const t = -d;
      return { x: frontX - W * 0.42 * t, y: H * 0.03 * t, s: 1 + 0.22 * t, o: 1 - t, blur: 0, sat: 1, z: 1000 };
    }
    const s = 1 / (1 + 0.42 * d);
    const fade = clamp(limit - d, 0, 1);
    return {
      x: vpX + (frontX - vpX) * s,
      y: horizonY + (floorY - horizonY) * s - floorY,
      s,
      o: Math.max(0.28, 1 - 0.13 * d) * fade,
      blur: Math.min(7, d * 1.25),
      sat: Math.max(0.6, 1 - 0.07 * d),
      z: 900 - Math.round(d * 10),
    };
  }

  layout(pos, instant) {
    const animate = !instant && !this.reduced() && !this.drag;
    for (let i = 0; i < this.n; i++) {
      const el = this.models[i];
      const d = this.dist(i, pos);
      const g = this.geometry(d);
      const prev = this.prevD[i];
      const transform = `translate3d(${(g.x - this.mw / 2).toFixed(2)}px,${g.y.toFixed(2)}px,0) scale(${g.s.toFixed(4)})`;
      const filter = g.blur > 0.05 ? `blur(${g.blur.toFixed(2)}px) saturate(${g.sat.toFixed(3)})` : 'none';
      const opacity = g.o.toFixed(3);
      el.style.zIndex = g.z;

      if (animate && prev !== undefined && Math.abs(d - prev) > 1.5) {
        // Wrapping around the loop: move invisibly, then fade in place.
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = transform;
        el.style.filter = filter;
        void el.offsetWidth;
        el.style.transition = '';
        el.style.opacity = opacity;
      } else {
        el.style.transform = transform;
        el.style.filter = filter;
        el.style.opacity = opacity;
      }
      this.prevD[i] = d;
      const isFront = Math.abs(d) < 0.5;
      if (isFront) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
      el.setAttribute('data-depth', d > 0.5 ? 'back' : isFront ? 'front' : 'out');
    }
  }

  goTo(index, opts = {}) {
    if (!this.n) return;
    const target = mod(Math.round(index), this.n);
    const changed = target !== this.active;
    this.active = target;
    this.pos = target;
    this.layout(target, !!opts.instant);
    if (changed) {
      this.setOdometer(this.first + target);
      this.onChange(target);
    }
  }
  next() { if (this.n > 1) this.goTo(this.active + 1); }
  prev() { if (this.n > 1) this.goTo(this.active - 1); }

  buildOdometer() {
    if (!this.odo) return;
    this.digits = String(this.first + this.n - 1).length;
    this.odo.textContent = '';
    this.strips = [];
    this.cols = [];
    for (let c = 0; c < this.digits; c++) {
      const col = document.createElement('span');
      col.className = 'rl-odo__col';
      const strip = document.createElement('span');
      strip.className = 'rl-odo__strip';
      for (let k = 0; k < 10; k++) {
        const dEl = document.createElement('span');
        dEl.textContent = k;
        strip.appendChild(dEl);
      }
      col.appendChild(strip);
      this.odo.appendChild(col);
      this.cols.push(col);
      this.strips.push(strip);
    }
  }

  setOdometer(num) {
    if (!this.strips) return;
    const raw = String(num);
    const str = raw.padStart(this.digits, '0');
    const lead = this.digits - raw.length;
    for (let c = 0; c < this.digits; c++) {
      const digit = parseInt(str.charAt(c), 10) || 0;
      this.strips[c].style.transform = `translate3d(0,${-digit * 10}%,0)`;
      this.cols[c].classList.toggle('is-lead', c < lead);
    }
  }

  bind() {
    const opt = { signal: this.ac.signal };
    const { root, stage } = this;


    root.addEventListener('keydown', (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
    }, opt);

    // Drag (mouse) and swipe (touch / pen)
    stage.addEventListener('pointerdown', (e) => {
      if (this.n < 2) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('a, button')) return;
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, moving: false, t: performance.now(), vx: 0, lastX: e.clientX, lastT: performance.now() };
    }, opt);

    stage.addEventListener('pointermove', (e) => {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      let dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moving) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          d.moving = true;
          d.x = e.clientX;
          dx = 0;
          try { stage.setPointerCapture(e.pointerId); } catch {}
          stage.classList.add('is-dragging');
        } else if (Math.abs(dy) > 10) {
          this.drag = null;
          return;
        } else {
          return;
        }
      }
      d.dx = dx;
      const now = performance.now();
      if (now - d.lastT > 0) d.vx = (e.clientX - d.lastX) / (now - d.lastT);
      d.lastX = e.clientX;
      d.lastT = now;
      const step = Math.max(160, this.W * (this.mobile ? 0.55 : 0.32));
      this.pos = this.active - clamp(dx / step, -3, 3);
      this.layout(this.pos, true);
    }, opt);

    const endDrag = (e) => {
      const d = this.drag;
      if (!d || (e && e.pointerId !== d.id)) return;
      this.drag = null;
      if (!d.moving) return;
      stage.classList.remove('is-dragging');
      try { stage.releasePointerCapture(d.id); } catch {}
      let target = Math.round(this.pos);
      // A short, quick flick is enough to move one slide, like a phone gallery.
      const flick = Math.abs(d.vx) > 0.35 && Math.abs(d.dx) > 12;
      if (target === this.active && (Math.abs(d.dx) > 40 || flick)) target = this.active + (d.dx < 0 ? 1 : -1);
      this.onSwipe && this.onSwipe();
      this.suppressClick = true;
      clearTimeout(this.timers.click);
      this.timers.click = setTimeout(() => { this.suppressClick = false; }, 60);
      this.goTo(target);
    };
    stage.addEventListener('pointerup', endDrag, opt);
    stage.addEventListener('pointercancel', endDrag, opt);
    // Touch gives the touched model an implicit pointer capture; when we move capture to the
    // stage, the model's lostpointercapture bubbles up here. Only the stage's own loss ends a drag,
    // otherwise every phone swipe would be cancelled straight away.
    stage.addEventListener('lostpointercapture', (e) => { if (e.target === stage) endDrag(e); }, opt);
    stage.addEventListener('dragstart', (e) => e.preventDefault(), opt);

    stage.addEventListener('click', (e) => {
      if (this.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        this.suppressClick = false;
        return;
      }
    }, { signal: this.ac.signal, capture: true });

    // Horizontal scrolling (trackpad / shift + wheel). Vertical page scroll is left alone.
    stage.addEventListener('wheel', (e) => {
      if (this.n < 2) return;
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax <= ay || ax < 1) return;
      e.preventDefault();
      clearTimeout(this.timers.wheelIdle);
      if (this.wheelLocked) {
        this.timers.wheelIdle = setTimeout(() => { this.wheelLocked = false; this.wheelAcc = 0; }, 260);
        return;
      }
      this.wheelAcc += e.deltaX;
      this.timers.wheelIdle = setTimeout(() => { this.wheelAcc = 0; }, 200);
      if (Math.abs(this.wheelAcc) > 45) {
        if (this.wheelAcc > 0) this.next(); else this.prev();
        this.wheelAcc = 0;
        this.wheelLocked = true;
        this.timers.wheelIdle = setTimeout(() => { this.wheelLocked = false; }, 450);
      }
    }, { signal: this.ac.signal, passive: false });

    const relayout = () => {
      this.measure();
      stage.classList.add('is-instant');
      this.layout(this.pos, true);
      requestAnimationFrame(() => stage.classList.remove('is-instant'));
    };
    if ('ResizeObserver' in window) {
      let lastW = 0;
      let lastH = 0;
      this.ro = new ResizeObserver((entries) => {
        const r = entries[0].contentRect;
        if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
        lastW = r.width;
        lastH = r.height;
        relayout();
      });
      this.ro.observe(stage);
    } else {
      window.addEventListener('resize', relayout, opt);
    }
    this.mqMobile.addEventListener('change', relayout, opt);
  }

  destroy() {
    this.ac.abort();
    if (this.ro) this.ro.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
    Object.values(this.timers).forEach(clearTimeout);
  }
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M1 8h13M9.5 3.5 14 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

function AddButton({ product, onAdd }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (product.soldOut) {
    return (
      <button type="button" className="rl-add" disabled aria-label={`${product.name} is sold out`}>
        <svg className="rl-i-plus" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`rl-add${state === 'success' ? ' is-success' : ''}`}
      aria-label={`Add ${product.name} to bag`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd(product);
        setState('success');
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState('idle'), 1600);
      }}
    >
      <svg className="rl-i-plus" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <svg className="rl-i-tick" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
        <path d="m2.5 8.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  );
}

/**
 * Full-width 3D runway lookbook. Looks recede into the distance; the rail beside it
 * lists the products worn in the front look, with add-to-bag wired to the site cart.
 *
 * @param {{ looks: Array<{id:string,image:string,alt:string,shopUrl:string|null,products:any[]}>,
 *   title?: string, intro?: string, lookLabel?: string, shopText?: string, firstLookNumber?: number }} props
 */
export default function RunwayLookbook({
  looks = [],
  title = 'The Runway Edit',
  intro = '',
  lookLabel = 'Look',
  shopText = 'Shop the look',
  firstLookNumber = 1,
}) {
  const rootRef = useRef(null);
  const railRef = useRef(null);
  const ctrl = useRef(null);
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState('');
  const [swiped, setSwiped] = useState(false);
  const { addItem } = useCart();
  const first = Math.max(0, firstLookNumber);
  const n = looks.length;

  useEffect(() => {
    if (!rootRef.current) return undefined;
    ctrl.current = new RunwayStage(rootRef.current, {
      first,
      onSwipe: () => setSwiped(true),
      onChange: (i) => {
        setActive(i);
        setAnnounce(`${looks[i]?.title || `${lookLabel} ${first + i}`}, ${i + 1} of ${n}`);
      },
    });
    return () => ctrl.current?.destroy();
  }, [n, first, lookLabel]);

  // Start the rail at the first product whenever the slide changes.
  useEffect(() => {
    railRef.current?.scrollTo({ top: 0, left: 0 });
  }, [active]);

  if (!n) return null;

  const current = looks[active] || looks[0];
  // The rail lists every product of the front slide only, so categories never mix.
  const cards = (current.products || []).map((p) => ({ ...p, key: `${current.id}-${p.id}` }));
  const hasRail = looks.some((l) => (l.products || []).length > 0);
  const lookName = (i) => looks[i]?.title || `${lookLabel} ${first + i}`;

  function handleAdd(p) {
    addItem({
      product: { sku: p.sku, name: p.name, slug: p.slug, price: p.price, stock: p.stock },
      size: p.size,
      colour: p.colour,
      qty: 1,
      image: p.image,
    });
  }

  return (
    <section ref={rootRef} className={`rl-root ${display.variable}`} aria-label={title}>
      <div className={`rl${hasRail ? '' : ' rl--no-rail'}`}>
        <div className="rl-stage" data-rl-stage tabIndex={0} role="region" aria-roledescription="carousel" aria-label={title}>
          <div className="rl-floor" aria-hidden="true" />
          <div className="rl-models">
            {looks.map((look, i) => (
              <figure
                key={look.id}
                className="rl-model"
                data-rl-model
                data-index={i}
                aria-hidden={i === 0 ? undefined : 'true'}
              >
                <span className="rl-model__shadow" aria-hidden="true" />
                <Image
                  className="rl-model__img"
                  src={look.image}
                  alt={look.alt || `${lookLabel} ${first + i}`}
                  fill
                  sizes="(max-width: 820px) 60vw, 30vw"
                  priority={i === 0}
                  draggable={false}
                />
              </figure>
            ))}
          </div>

          <div className="rl-head">
            <h2 className="rl-head__title">{title}</h2>
            {intro && <p className="rl-head__intro">{intro}</p>}
          </div>

          <div className="rl-foot">
            {current.title && <p className="rl-look-title" aria-live="off">{current.title}</p>}
            <p className="rl-counter">
              <span className="rl-counter__label" aria-hidden="true">{lookLabel}</span>
              <span className="rl-odo" data-rl-odo aria-hidden="true">{first}</span>
              <span className="rl-sr">{lookName(active)}</span>
            </p>
            {current.shopUrl ? (
              <Link className="rl-shop" href={current.shopUrl}>
                <span>{current.title ? `${shopText} · ${current.title}` : shopText}</span>
                <ArrowIcon />
              </Link>
            ) : (
              <a className="rl-shop" aria-disabled="true" tabIndex={-1}>
                <span>{shopText}</span>
                <ArrowIcon />
              </a>
            )}
          </div>

          {n > 1 && (
            <div className="rl-swipe" aria-hidden="true">
              <span className={`rl-swipe__hint${swiped ? ' is-hidden' : ''}`}>
                <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 1.5 8 6 12.5M1.5 8h13M10 3.5 14.5 8 10 12.5" stroke="currentColor" strokeWidth="1.2" /></svg>
                Swipe
              </span>
              <span className="rl-dots">
                {looks.map((l, i) => <span key={l.id} className={`rl-dot${i === active ? ' is-on' : ''}`} />)}
              </span>
            </div>
          )}
          <p className="rl-sr" aria-live="polite" aria-atomic="true">{announce}</p>
        </div>

        {hasRail && (
          <aside className="rl-rail" aria-label={shopText}>
            <p className="rl-rail__head">
              <span>{shopText}</span>
              <span className="rl-rail__num">{`${lookName(active)} · ${cards.length}`}</span>
            </p>
            <ul className="rl-rail__list" ref={railRef} key={current.id}>
              {cards.map((p) => (
                <li key={p.key} className="rl-card is-active">
                  <div className="rl-card__media">
                    {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
                  </div>
                  <div className="rl-card__info">
                    <h3 className="rl-card__title">
                      <Link className="rl-card__link" href={`/product/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p className="rl-card__price">
                      {inr(p.price)}
                      {p.originalPrice && (
                        <s>
                          <span className="rl-sr">Regular price</span>
                          {inr(p.originalPrice)}
                        </s>
                      )}
                    </p>
                  </div>
                  <AddButton product={p} onAdd={handleAdd} />
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
