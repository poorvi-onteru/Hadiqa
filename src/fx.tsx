import { useEffect, useMemo, useRef } from 'react';
import type { ElementType, ReactElement, RefObject } from 'react';
import { finePointer, onPointer, pointer, reducedMotion, registerFx } from './engine';
import { Food, type FoodName } from './food';

/* ------------------------------------------------------------------ */
/* Cursor: a ring that trails the pointer and a dot that sticks to it  */
/* ------------------------------------------------------------------ */

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    let rx = 0, ry = 0, raf = 0, seen = false;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!seen) {
        seen = true;
        rx = e.clientX;
        ry = e.clientY;
        root.classList.add('cursor-on');
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const tagged = t?.closest?.('[data-cursor]') as HTMLElement | null;
      const hot = !!t?.closest?.('a, button, input, [role="button"]');
      ring.current?.classList.toggle('is-hot', hot);
      ring.current?.classList.toggle('has-label', !!tagged);
      if (label.current) label.current.textContent = tagged?.dataset.cursor ?? '';
    };
    const onDown = () => ring.current?.classList.add('is-down');
    const onUp = () => ring.current?.classList.remove('is-down');
    const onLeave = () => root.classList.remove('cursor-on');
    const onEnter = () => seen && root.classList.add('cursor-on');

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (seen) {
        const k = 1 - Math.exp(-dt * 16);
        rx += (pointer.x - rx) * k;
        ry += (pointer.y - ry) * k;
        if (ring.current) ring.current.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0)`;
        if (dot.current) dot.current.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('mouseenter', onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('mouseenter', onEnter);
      root.classList.remove('has-cursor', 'cursor-on');
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <i />
        <span ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sizes one line of text so it spans its parent, whatever font loads  */
/* ------------------------------------------------------------------ */

export function useFitWidth(ref: RefObject<HTMLElement | null>, opts: { maxVh?: number; fill?: number; enabled?: boolean } = {}) {
  const { maxVh = 100, fill = 0.98, enabled = true } = opts;
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const fit = () => {
      el.style.fontSize = '100px';
      const w = el.offsetWidth;
      if (!w) return;
      const size = Math.min((100 * parent.clientWidth * fill) / w, (window.innerHeight * maxVh) / 100);
      el.style.fontSize = `${size.toFixed(1)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
      el.style.fontSize = '';
    };
  }, [ref, maxVh, fill, enabled]);
}

/* ------------------------------------------------------------------ */
/* Text whose letters drift away from the cursor                       */
/* ------------------------------------------------------------------ */

type Part = string | { t: string; accent?: boolean };

interface ProximityProps {
  parts: Part[];
  as?: ElementType;
  className?: string;
  /** How close the cursor has to be (px) before letters react. */
  radius?: number;
  /** Max push distance in px. */
  strength?: number;
  /** Max extra rotation in degrees. */
  spin?: number;
  /** Resting rotation for each letter in degrees (cycled). */
  tilt?: number[];
  /** When set, the text is sized to fill its parent's width, but never taller than this % of the screen height. */
  fitVh?: number;
}

export function ProximityText({ parts, as, className = '', radius = 150, strength = 26, spin = 12, tilt, fitVh }: ProximityProps) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement>(null);
  useFitWidth(ref, { maxVh: fitVh ?? 100, enabled: fitVh !== undefined });

  // `parts` is usually a fresh array every render, so key everything off its content.
  const sig = JSON.stringify(parts) + '|' + (tilt ? tilt.join(',') : '');
  const plain = useMemo(() => parts.map((p) => (typeof p === 'string' ? p : p.t)).join('').replace(/\n/g, ' '), [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const content = useMemo(() => {
    const out: (string | ReactElement)[] = [];
    let li = 0;
    parts.forEach((p, pi) => {
      const part = typeof p === 'string' ? { t: p, accent: false } : p;
      part.t.split('\n').forEach((line, lineIdx) => {
        if (lineIdx > 0) out.push(<br key={`br-${pi}-${lineIdx}`} />);
        line.split(/(\s+)/).forEach((tok, ti) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) {
            out.push(' ');
            return;
          }
          out.push(
            <span key={`w-${pi}-${lineIdx}-${ti}`} className={`pt-word${part.accent ? ' accent' : ''}`}>
              {Array.from(tok).map((ch, ci) => {
                const deg = tilt && tilt.length ? tilt[li++ % tilt.length] : 0;
                return (
                  <span key={ci} className="pt-l" data-t={deg} style={deg ? { transform: `rotate(${deg}deg)` } : undefined}>
                    {ch}
                  </span>
                );
              })}
            </span>,
          );
        });
      });
    });
    return out;
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion() || !finePointer()) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>('.pt-l'));
    const rest = letters.map((l) => parseFloat(l.dataset.t || '0'));
    const st = letters.map(() => ({ x: 0, y: 0, r: 0 }));
    letters.forEach((l) => (l.style.willChange = 'transform'));
    let raf = 0;
    let near = false;

    const frame = () => {
      const rects = letters.map((l) => l.getBoundingClientRect()); // reads
      let moving = false;
      letters.forEach((l, i) => {
        const s = st[i];
        const r = rects[i];
        const cx = r.left + r.width / 2 - s.x;
        const cy = r.top + r.height / 2 - s.y;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.pow(Math.max(0, 1 - d / radius), 2);
        const tx = (-dx / d) * f * strength;
        const ty = (-dy / d) * f * strength;
        const tr = -Math.sign(dx) * f * spin;
        s.x += (tx - s.x) * 0.15;
        s.y += (ty - s.y) * 0.15;
        s.r += (tr - s.r) * 0.15;
        if (Math.abs(s.x - tx) > 0.05 || Math.abs(s.y - ty) > 0.05 || Math.abs(s.r - tr) > 0.05) moving = true;
      });
      letters.forEach((l, i) => {
        // writes
        const s = st[i];
        if (!moving && !near) {
          s.x = s.y = s.r = 0;
          l.style.transform = rest[i] ? `rotate(${rest[i]}deg)` : '';
        } else {
          l.style.transform = `translate3d(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px,0) rotate(${(rest[i] + s.r).toFixed(2)}deg)`;
        }
      });
      raf = near || moving ? requestAnimationFrame(frame) : 0;
    };

    const check = () => {
      const r = root.getBoundingClientRect();
      near = pointer.x > r.left - radius && pointer.x < r.right + radius && pointer.y > r.top - radius && pointer.y < r.bottom + radius;
      if (near && !raf) raf = requestAnimationFrame(frame);
    };
    const off = onPointer(check);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [sig, radius, strength, spin]);

  return (
    <Tag ref={ref} className={className} aria-label={plain}>
      <span aria-hidden="true" style={{ display: 'contents' }}>
        {content}
      </span>
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Paragraph whose words light up as you read down the page            */
/* ------------------------------------------------------------------ */

export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  const words = useMemo(() => {
    const list: { w: string; hot: boolean; glue: boolean }[] = [];
    text.split('*').forEach((seg, i) => {
      // A segment that starts right after the previous one (no space) continues that word, e.g. "*pizza*, serve".
      const glueFirst = list.length > 0 && !/^\s/.test(seg);
      seg
        .split(/\s+/)
        .filter(Boolean)
        .forEach((w, j) => list.push({ w, hot: i % 2 === 1, glue: j === 0 && glueFirst }));
    });
    return list;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
    const n = spans.length;
    return registerFx(
      el,
      'read',
      (p) => {
        spans.forEach((s, i) => {
          const k = Math.min(1, Math.max(0, p * (n + 6) - i - 3 + 1));
          s.style.opacity = (0.16 + 0.84 * k).toFixed(3);
        });
      },
      0.2,
    );
  }, [words]);

  return (
    <p ref={ref} className={`scroll-words ${className}`}>
      {words.map((w, i) => (
        <span key={i} data-w="" className={w.hot ? 'hot' : ''}>
          {w.w}
          {words[i + 1] && !words[i + 1].glue ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* A strip of big words that slides sideways as you scroll             */
/* ------------------------------------------------------------------ */

export function ScrollBand({ items, from, to }: { items: { word: string; food: FoodName }[]; from: number; to: number }) {
  const row = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = row.current;
    const tr = track.current;
    if (!el || !tr || reducedMotion()) return;
    return registerFx(el, 'enter', (p) => {
      tr.style.transform = `translate3d(${(from + (to - from) * p).toFixed(2)}%,0,0)`;
    });
  }, [from, to]);

  return (
    <div className="band-row" ref={row}>
      <div className="band-track" ref={track}>
        {[0, 1, 2].flatMap((rep) =>
          items.map((it, i) => (
            <span key={`${rep}-${i}`}>
              {it.word}
              <Food name={it.food} className="band-icon" />
            </span>
          )),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image that drifts inside its frame                                  */
/* ------------------------------------------------------------------ */

export function ParallaxImage({ src, alt, className = '', amount = 8 }: { src: string; alt: string; className?: string; amount?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = box.current;
    const im = img.current;
    if (!el || !im || reducedMotion()) return;
    const scale = 1 + amount / 50;
    return registerFx(
      el,
      'enter',
      (p) => {
        im.style.transform = `translate3d(0,${((0.5 - p) * 2 * amount).toFixed(2)}%,0) scale(${scale})`;
      },
      0.18,
    );
  }, [amount]);

  return (
    <div className={`frame ${className}`} ref={box}>
      <img ref={img} src={src} alt={alt} loading="lazy" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero floaters: food that follows the mouse and the scroll           */
/* ------------------------------------------------------------------ */

export interface Floater {
  food: FoodName;
  left: number; // % of width
  top: number; // % of height
  size: number; // px
  rot: number; // deg
  depth: number; // mouse parallax multiplier
  speed: number; // extra scroll speed (negative = rises faster than the page)
}

export function Floaters({ items }: { items: Floater[] }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current;
    if (!root || reducedMotion()) return;
    const els = Array.from(root.children) as HTMLElement[];
    const hasMouse = finePointer();
    let mx = 0, my = 0, raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sy = window.scrollY;
      if (sy < window.innerHeight * 1.3) {
        const tx = hasMouse && pointer.x > -999 ? pointer.x / window.innerWidth - 0.5 : 0;
        const ty = hasMouse && pointer.y > -999 ? pointer.y / window.innerHeight - 0.5 : 0;
        const k = 1 - Math.exp(-dt * 5);
        mx += (tx - mx) * k;
        my += (ty - my) * k;
        els.forEach((el, i) => {
          const it = items[i];
          const x = -mx * it.depth * 70;
          const y = -my * it.depth * 70 + sy * it.speed * 2;
          el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(it.rot + sy * 0.02 * it.depth + mx * 14 * it.depth).toFixed(2)}deg)`;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  return (
    <div className="floaters" ref={box} aria-hidden="true">
      {items.map((it, i) => (
        <div
          key={i}
          className="floater"
          style={{ left: `${it.left}%`, top: `${it.top}%`, width: it.size, height: it.size, transform: `rotate(${it.rot}deg)` }}
        >
          <Food name={it.food} style={{ width: '100%', height: '100%' }} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer pile: food that gets shoved around by the cursor             */
/* ------------------------------------------------------------------ */

const PILE_FOODS: FoodName[] = ['pizza', 'burger', 'egg', 'icecream', 'tomato', 'cup', 'slice', 'cake', 'chilli'];
const PILE = Array.from({ length: 16 }, (_, i) => ({
  food: PILE_FOODS[i % PILE_FOODS.length],
  fx: (i + 0.5) / 16 + (((i * 37) % 7) - 3) * 0.006,
  size: 74 + ((i * 53) % 5) * 14,
  row: i % 3,
  rot: ((i * 47) % 60) - 30,
}));
const ROW_LIFT = [0, 0.5, 0.95];

export function FoodPile() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const els = Array.from(root.children) as HTMLElement[];
    const rest = PILE.map(() => ({ x: 0, y: 0 }));
    const p = PILE.map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0 }));
    let raf = 0;
    let near = false;

    const place = (i: number) => {
      const it = PILE[i];
      els[i].style.transform = `translate3d(${(rest[i].x + p[i].ox).toFixed(1)}px,${(rest[i].y + p[i].oy).toFixed(1)}px,0) rotate(${(it.rot + p[i].ox * 0.12).toFixed(1)}deg)`;
    };
    const layout = () => {
      const W = root.clientWidth;
      const H = root.clientHeight;
      PILE.forEach((it, i) => {
        rest[i].x = it.fx * W - it.size / 2;
        rest[i].y = H - it.size * (0.85 + ROW_LIFT[it.row] * 0.55);
        place(i);
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(root);
    if (reducedMotion() || !finePointer()) return () => ro.disconnect();

    const R = 170;
    const frame = () => {
      const rc = root.getBoundingClientRect();
      const px = pointer.x - rc.left;
      const py = pointer.y - rc.top;
      let moving = false;
      PILE.forEach((it, i) => {
        const s = p[i];
        const cx = rest[i].x + it.size / 2 + s.ox;
        const cy = rest[i].y + it.size / 2 + s.oy;
        const dx = cx - px;
        const dy = cy - py;
        const d = Math.hypot(dx, dy) || 1;
        if (near && d < R) {
          const f = Math.pow(1 - d / R, 2) * 3.2;
          s.vx += (dx / d) * f;
          s.vy += (dy / d) * f;
        }
        s.vx += -s.ox * 0.045;
        s.vy += -s.oy * 0.045;
        s.vx *= 0.86;
        s.vy *= 0.86;
        s.ox += s.vx;
        s.oy += s.vy;
        if (Math.abs(s.ox) > 0.1 || Math.abs(s.oy) > 0.1 || Math.abs(s.vx) > 0.1 || Math.abs(s.vy) > 0.1) moving = true;
        else s.ox = s.oy = s.vx = s.vy = 0;
        place(i);
      });
      raf = near || moving ? requestAnimationFrame(frame) : 0;
    };
    const check = () => {
      const r = root.getBoundingClientRect();
      near = pointer.x > r.left - R && pointer.x < r.right + R && pointer.y > r.top - R && pointer.y < r.bottom + R;
      if (near && !raf) raf = requestAnimationFrame(frame);
    };
    const off = onPointer(check);
    return () => {
      off();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pile" ref={box} aria-hidden="true">
      {PILE.map((it, i) => (
        <div key={i} className="pile-item" style={{ width: it.size, height: it.size }}>
          <Food name={it.food} style={{ width: '100%', height: '100%' }} />
        </div>
      ))}
    </div>
  );
}