import type { CSSProperties, ReactElement } from 'react';

export type FoodName = 'pizza' | 'chilli' | 'burger' | 'egg' | 'icecream' | 'tomato' | 'cup' | 'slice' | 'cake';

const INK = '#1a0d08';

/* Flat, sticker-style icons on a 100 x 100 grid. */
const ART: Record<FoodName, ReactElement> = {
  pizza: (
    <>
      <circle cx="50" cy="50" r="44" fill="#d9942f" />
      <circle cx="50" cy="50" r="36" fill="#ffd35c" />
      <circle cx="36" cy="38" r="7" fill="#c4261b" />
      <circle cx="64" cy="40" r="7" fill="#c4261b" />
      <circle cx="46" cy="64" r="7" fill="#c4261b" />
      <circle cx="70" cy="66" r="5" fill="#c4261b" />
      <circle cx="30" cy="60" r="5" fill="#c4261b" />
    </>
  ),
  chilli: (
    <>
      <path d="M30 24 C58 14 86 34 80 64 C78 80 70 92 62 88 C70 70 62 46 30 36 Z" fill="#e0261b" />
      <path d="M30 24 C26 14 20 12 14 14 C18 20 22 24 30 36 Z" fill="#2f8f3a" />
    </>
  ),
  burger: (
    <>
      <path d="M14 46 C14 16 86 16 86 46 Z" fill="#e8a24a" />
      <path d="M10 54 Q20 44 30 54 T50 54 T70 54 T90 54 L90 60 L10 60 Z" fill="#5cb85c" />
      <rect x="12" y="60" width="76" height="14" rx="7" fill="#6b3418" />
      <path d="M14 76 H86 C86 90 78 92 70 92 H30 C22 92 14 90 14 76 Z" fill="#e8a24a" />
      <g stroke="none" fill="#fff1dc">
        <ellipse cx="38" cy="32" rx="4" ry="2" />
        <ellipse cx="54" cy="28" rx="4" ry="2" />
        <ellipse cx="66" cy="36" rx="4" ry="2" />
      </g>
    </>
  ),
  egg: (
    <>
      <path d="M50 12 C70 8 92 26 88 50 C86 74 70 90 48 88 C24 86 10 72 14 48 C16 28 32 14 50 12 Z" fill="#fffdf6" />
      <circle cx="50" cy="50" r="19" fill="#ffb81c" />
      <circle cx="43" cy="43" r="4" fill="#fff0b0" stroke="none" />
    </>
  ),
  icecream: (
    <>
      <path d="M28 52 L50 96 L72 52 Z" fill="#e8a24a" />
      <path d="M38 60 L58 76 M50 54 L62 70 M34 72 L46 82" fill="none" strokeWidth="2" />
      <circle cx="34" cy="40" r="18" fill="#ff8fb1" />
      <circle cx="66" cy="40" r="18" fill="#fff1dc" />
      <circle cx="50" cy="26" r="18" fill="#8b4a2b" />
    </>
  ),
  tomato: (
    <>
      <circle cx="50" cy="56" r="36" fill="#e0261b" />
      <path d="M50 22 L57 33 L70 27 L63 39 L76 44 L61 47 L50 39 L39 47 L24 44 L37 39 L30 27 L43 33 Z" fill="#2f8f3a" />
      <path d="M30 56 Q32 44 42 40" fill="none" stroke="#ff8a7a" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  cup: (
    <>
      <ellipse cx="48" cy="84" rx="40" ry="8" fill="#fff1dc" />
      <path d="M72 42 H80 C92 42 92 64 76 64 H70" fill="none" />
      <path d="M18 38 H74 V58 C74 74 62 82 46 82 C30 82 18 74 18 58 Z" fill="#fff1dc" />
      <ellipse cx="46" cy="38" rx="28" ry="6" fill="#6b3418" />
      <path d="M34 26 Q30 18 36 12 M48 26 Q44 18 50 10 M62 26 Q58 18 64 12" fill="none" strokeLinecap="round" />
    </>
  ),
  slice: (
    <>
      <path d="M10 24 Q50 2 90 24 L50 94 Z" fill="#ffd35c" />
      <path d="M10 24 Q50 2 90 24 L86 32 Q50 14 14 32 Z" fill="#d9942f" />
      <circle cx="40" cy="46" r="6" fill="#c4261b" />
      <circle cx="60" cy="42" r="6" fill="#c4261b" />
      <circle cx="50" cy="66" r="5" fill="#c4261b" />
    </>
  ),
  cake: (
    <>
      <rect x="14" y="48" width="72" height="40" rx="6" fill="#8b4a2b" />
      <path d="M14 54 V48 C14 38 86 38 86 48 V54 Q78 64 70 54 Q62 64 54 54 Q46 64 38 54 Q30 64 22 54 Z" fill="#fff1dc" />
      <path d="M50 32 Q52 22 60 20" fill="none" />
      <circle cx="50" cy="34" r="8" fill="#e0261b" />
    </>
  ),
};

export function Food({ name, className, style }: { name: FoodName; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      stroke={INK}
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {ART[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pizza layers (stacked while you scroll)                             */
/* ------------------------------------------------------------------ */

export const PIZZA_LAYER_COUNT = 5;

const CHEESE: [number, number, number][] = [
  [200, 150, 34], [150, 200, 38], [255, 205, 36], [205, 255, 36], [150, 150, 28],
  [262, 148, 26], [148, 258, 26], [258, 258, 28], [200, 205, 32],
];
const BASIL: [number, number, number][] = [
  [170, 168, -30], [242, 185, 40], [190, 242, 15], [252, 252, -50], [145, 215, 70], [215, 140, 10],
];
const OIL: [number, number][] = [[185, 190], [225, 215], [160, 240], [250, 170], [205, 130], [235, 255], [140, 185]];
const CRUST_CHAR = Array.from({ length: 10 }, (_, i) => {
  const a = (i * 36 + 14) * (Math.PI / 180);
  return { x: 200 + Math.cos(a) * 178, y: 200 + Math.sin(a) * 178, r: 8 + ((i * 5) % 7) };
});

export function PizzaLayer({ index }: { index: number }) {
  let art: ReactElement;
  switch (index) {
    case 0: // dough
      art = (
        <>
          <circle cx="200" cy="200" r="188" fill="#d38f3a" />
          <circle cx="200" cy="200" r="168" fill="#efc27a" />
        </>
      );
      break;
    case 1: // tomato
      art = (
        <>
          <circle cx="200" cy="200" r="150" fill="#cf2a1c" />
          <path d="M110 190 Q200 138 292 200 M120 252 Q200 304 282 240" fill="none" stroke="#a31a10" strokeWidth="9" strokeLinecap="round" />
        </>
      );
      break;
    case 2: // mozzarella
      art = (
        <>
          {CHEESE.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fff1b8" opacity="0.96" />
          ))}
        </>
      );
      break;
    case 3: // herbs and oil
      art = (
        <>
          {BASIL.map(([x, y, a], i) => (
            <ellipse key={i} cx={x} cy={y} rx="21" ry="11" fill="#2f8f3a" transform={`rotate(${a} ${x} ${y})`} />
          ))}
          {OIL.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="#ffe9a0" opacity="0.75" />
          ))}
        </>
      );
      break;
    default: // wood fire char
      art = (
        <>
          {CRUST_CHAR.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#4a210e" opacity="0.55" />
          ))}
          <circle cx="170" cy="160" r="9" fill="#b8641f" opacity="0.5" />
          <circle cx="240" cy="232" r="11" fill="#b8641f" opacity="0.5" />
          <circle cx="200" cy="262" r="7" fill="#b8641f" opacity="0.5" />
        </>
      );
  }
  return (
    <svg viewBox="0 0 400 400" className="build-layer-svg" aria-hidden="true" focusable="false">
      {art}
    </svg>
  );
}