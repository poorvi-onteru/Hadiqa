/**
 * Small, dependency-free motion engine.
 *
 *  - Inertial smooth scrolling for mouse and trackpad (touch keeps native scrolling).
 *  - One shared pointer position that every cursor-reactive piece reads from.
 *  - Scroll-linked effects: register an element and get a 0..1 progress value every frame.
 */

export const pointer = { x: -9999, y: -9999 };
const pointerSubs = new Set<() => void>();

export function onPointer(fn: () => void) {
  pointerSubs.add(fn);
  return () => {
    pointerSubs.delete(fn);
  };
}

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/* ------------------------------------------------------------------ */
/* Scroll-linked effects                                               */
/* ------------------------------------------------------------------ */

/** enter: 0 when the element's top touches the bottom of the screen, 1 when its bottom leaves the top.
 *  pin:   0 to 1 while a tall element is pinned (sticky) in view.
 *  read:  0 to 1 while the element crosses the reading zone of the screen. */
export type FxMode = 'enter' | 'pin' | 'read';

interface Fx {
  el: HTMLElement;
  mode: FxMode;
  cb: (p: number) => void;
  smooth: number;
  value: number;
  last: number;
  ready: boolean;
}

const fxs = new Set<Fx>();

/** `smooth` is an extra easing factor per frame (1 = none, 0.15 = soft). Returns an unregister function. */
export function registerFx(el: HTMLElement, mode: FxMode, cb: (p: number) => void, smooth = 1) {
  const fx: Fx = { el, mode, cb, smooth, value: 0, last: NaN, ready: false };
  fxs.add(fx);
  return () => {
    fxs.delete(fx);
  };
}

function progressOf(fx: Fx) {
  const r = fx.el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (fx.mode === 'enter') return clamp((vh - r.top) / (vh + r.height));
  if (fx.mode === 'pin') {
    const span = r.height - vh;
    return span <= 0 ? 0 : clamp(-r.top / span);
  }
  return clamp((vh * 0.9 - r.top) / (r.height + vh * 0.4));
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function initEngine() {
  const root = document.documentElement;
  const lerpOn = finePointer() && !reducedMotion();
  if (lerpOn) root.classList.add('lerp-scroll');

  const s = {
    current: window.scrollY,
    target: window.scrollY,
    selfSet: window.scrollY,
    anim: null as null | { from: number; to: number; t0: number; dur: number },
  };
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const locked = () => document.body.style.overflow === 'hidden';

  /* ---- wheel ---- */
  const onWheel = (e: WheelEvent) => {
    if (!lerpOn || e.ctrlKey || e.defaultPrevented || locked()) return;
    if ((e.target as HTMLElement | null)?.closest?.('[data-native-scroll]')) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    if (s.anim) {
      s.anim = null;
      s.target = s.current;
    }
    s.target = clamp(s.target + d, 0, maxScroll());
  };

  /* ---- keyboard ---- */
  const onKey = (e: KeyboardEvent) => {
    if (!lerpOn || locked() || e.ctrlKey || e.metaKey || e.altKey) return;
    const a = document.activeElement as HTMLElement | null;
    if (a && a !== document.body && (/^(INPUT|TEXTAREA|SELECT|BUTTON|A|IFRAME)$/.test(a.tagName) || a.isContentEditable)) return;
    const vh = window.innerHeight;
    let to: number | null = null;
    switch (e.key) {
      case 'ArrowDown': to = s.target + 80; break;
      case 'ArrowUp': to = s.target - 80; break;
      case 'PageDown': to = s.target + vh * 0.88; break;
      case 'PageUp': to = s.target - vh * 0.88; break;
      case ' ': to = s.target + (e.shiftKey ? -1 : 1) * vh * 0.88; break;
      case 'Home': to = 0; break;
      case 'End': to = maxScroll(); break;
    }
    if (to === null) return;
    e.preventDefault();
    s.anim = null;
    s.target = clamp(to, 0, maxScroll());
  };

  /* ---- anchor links ---- */
  const goTo = (y: number) => {
    y = clamp(y, 0, maxScroll());
    if (!lerpOn) {
      window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    const dist = Math.abs(y - s.current);
    s.anim = { from: s.current, to: y, t0: performance.now(), dur: 900 + Math.min(1500, dist / 4) };
    s.target = y;
  };
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const hash = a.getAttribute('href') || '';
    const id = hash.slice(1);
    let y = 0;
    if (id && id !== 'top') {
      const el = document.getElementById(id);
      if (!el) return;
      y = el.getBoundingClientRect().top + window.scrollY;
    }
    e.preventDefault();
    history.replaceState(null, '', hash === '#' ? location.pathname : hash);
    goTo(y);
  };

  /* ---- external scroll (scrollbar drag, etc.) keeps us in sync ---- */
  const onScroll = () => {
    if (!lerpOn || s.anim) return;
    if (Math.abs(window.scrollY - s.selfSet) > 2) {
      s.current = s.target = s.selfSet = window.scrollY;
    }
  };

  /* ---- pointer ---- */
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointerSubs.forEach((fn) => fn());
  };
  const onLeave = () => {
    pointer.x = pointer.y = -9999;
    pointerSubs.forEach((fn) => fn());
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('click', onClick);
  root.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);

  /* ---- frame loop ---- */
  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (lerpOn) {
      if (s.anim) {
        const k = (now - s.anim.t0) / s.anim.dur;
        if (k >= 1) {
          s.current = s.target = s.anim.to;
          s.anim = null;
        } else {
          s.current = s.anim.from + (s.anim.to - s.anim.from) * easeInOutCubic(k);
          s.target = s.current;
        }
      } else {
        const diff = s.target - s.current;
        s.current = Math.abs(diff) < 0.1 ? s.target : s.current + diff * (1 - Math.exp(-dt * 8));
      }
      if (Math.abs(s.current - window.scrollY) > 0.01) {
        s.selfSet = s.current;
        window.scrollTo(0, s.current);
      }
    }

    // read everything first, then write
    const fresh: [Fx, number][] = [];
    fxs.forEach((fx) => {
      const t = progressOf(fx);
      if (!fx.ready) {
        fx.value = t;
        fx.ready = true;
      } else {
        const k = fx.smooth >= 1 ? 1 : 1 - Math.pow(1 - fx.smooth, dt * 60);
        fx.value += (t - fx.value) * k;
        if (Math.abs(t - fx.value) < 0.0004) fx.value = t;
      }
      if (fx.value !== fx.last) fresh.push([fx, fx.value]);
    });
    fresh.forEach(([fx, v]) => {
      fx.last = v;
      fx.cb(v);
    });

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('click', onClick);
    root.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('blur', onLeave);
    root.classList.remove('lerp-scroll');
  };
}
