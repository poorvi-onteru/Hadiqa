import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories, cuisines, menuData, type MenuCategory, type MenuItem } from './menuData';
import { initEngine, reducedMotion, registerFx } from './engine';
import { Cursor, Floaters, FoodPile, ParallaxImage, ProximityText, ScrollBand, ScrollWords, type Floater } from './fx';
import { Food, PIZZA_LAYER_COUNT, PizzaLayer } from './food';
import { Reviews, Gallery } from './Extras';
import { IMG } from './images';

const HERO_IMAGE = IMG.chilli;
const DISH_IMAGE = IMG.paneer;
const INTERIOR_IMAGE = IMG.room;

const PHONE_DISPLAY = '+91 820 429 4455';
const PHONE_TEL = '+918204294455';
const ADDRESS = 'Smrithi Bhavan, Madhuvan Serai Building, behind T.M.A. Pai Park, Eshwar Nagar, Manipal 576104';

/** Put the restaurant's WhatsApp number here, digits only with country code (e.g. '919876543210').
 *  Left empty, the booking buttons fall back to calling. */
const WHATSAPP = '';
const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/** Open daily 10:00 to 23:00, India time. */
function openStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= 10 && h < 23 ? { open: true, text: 'Open now · until 11 PM' } : { open: false, text: h < 10 ? 'Closed · opens at 10 AM' : 'Closed · opens tomorrow at 10 AM' };
}

function OpenNow() {
  const [st, setSt] = useState(openStatus);
  useEffect(() => {
    const id = setInterval(() => setSt(openStatus()), 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className={`open-now ${st.open ? 'is-open' : ''}`}>
      <i aria-hidden="true" />
      {st.text}
    </p>
  );
}

/** Different dishes get different photos instead of one picture for everything. */
function dishImage(d: MenuItem) {
  const n = d.name.toLowerCase();
  if (/pasta|penne|spaghetti|lasagn|aglio|alfredo/.test(n)) return IMG.spaghetti;
  if (d.category === 'Pizzas & Wood-Fired') return d.id % 2 ? IMG.paneer : IMG.bbq;
  if (/chilli|manchurian|schezwan|kung|noodle|rice/.test(n)) return IMG.chilli;
  return IMG.table;
}

const PICKS = ['burnt garlic chicken', 'paneer tikka', 'chicken supreme', 'mushroom pasta', 'cilantro pesto', 'cheesecake'];
const MAPS_LINK = 'https://maps.google.com/?q=Smrithi+Bhavan+Eshwar+Nagar+Manipal';

type CuisineFilter = (typeof cuisines)[number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const HERO_FLOATERS: Floater[] = [
  { food: 'pizza', left: 4, top: 14, size: 150, rot: -14, depth: 0.9, speed: -0.1 },
  { food: 'chilli', left: 23, top: 9, size: 84, rot: 24, depth: 0.5, speed: -0.2 },
  { food: 'burger', left: 42, top: 7, size: 118, rot: 8, depth: 1.1, speed: -0.06 },
  { food: 'egg', left: 63, top: 11, size: 112, rot: -10, depth: 0.7, speed: -0.16 },
  { food: 'icecream', left: 84, top: 20, size: 122, rot: 16, depth: 1, speed: -0.08 },
  { food: 'tomato', left: 12, top: 56, size: 92, rot: -6, depth: 0.6, speed: -0.22 },
  { food: 'cup', left: 33, top: 60, size: 96, rot: 10, depth: 0.8, speed: -0.04 },
  { food: 'slice', left: 57, top: 58, size: 108, rot: -18, depth: 1.2, speed: -0.14 },
  { food: 'cake', left: 78, top: 54, size: 112, rot: 12, depth: 0.7, speed: -0.1 },
];

const BAND_A = [
  { word: 'WOOD-FIRED PIZZA', food: 'pizza' as const },
  { word: 'EGGS ON TOAST', food: 'egg' as const },
  { word: 'HOUSE PASTA', food: 'tomato' as const },
  { word: 'SUNDAES', food: 'icecream' as const },
];
const BAND_B = [
  { word: 'OMELETTES', food: 'egg' as const },
  { word: 'BURGERS', food: 'burger' as const },
  { word: 'THAI BOWLS', food: 'chilli' as const },
  { word: 'CAKES', food: 'cake' as const },
];

const BUILD_STEPS = [
  { title: 'Dough', copy: 'Hand-stretched, thin crust.' },
  { title: 'Tomato', copy: 'House tomato sugo.' },
  { title: 'Mozzarella', copy: 'On every pizza we make.' },
  { title: 'Herbs and oil', copy: 'Fresh herbs and olive oil.' },
  { title: 'Wood fire', copy: 'Into the wood-fired oven.' },
];

const TILTS = [-4, 3, -2, 5, -5, 2, -3, 4];

/* ------------------------------------------------------------------ */
/* Pizza that builds itself while you scroll                           */
/* ------------------------------------------------------------------ */

function PizzaBuild() {
  const sec = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    const n = PIZZA_LAYER_COUNT;
    const span = 0.9;
    const show = (p: number) => {
      let now = 0;
      layers.current.forEach((layer, i) => {
        if (!layer) return;
        const k = clamp01((p - (i / n) * span) / ((span / n) * 1.1));
        const e = 1 - Math.pow(1 - k, 3);
        const dir = i % 2 ? 1 : -1;
        layer.style.opacity = String(Math.min(1, e * 1.6));
        layer.style.transform = `translate3d(0,${(-(1 - e) * 140).toFixed(1)}px,0) rotate(${(dir * (1 - e) * 28).toFixed(1)}deg) scale(${(1 + (1 - e) * 0.22).toFixed(3)})`;
        if (k > 0.02) now = i;
      });
      steps.current.forEach((step, i) => {
        if (!step) return;
        step.classList.toggle('on', i <= now);
        step.classList.toggle('now', i === now);
      });
      if (bar.current) bar.current.style.transform = `scaleX(${clamp01(p / span).toFixed(3)})`;
    };
    if (reducedMotion()) {
      el.classList.add('flat');
      show(1);
      return;
    }
    return registerFx(el, 'pin', show, 0.16);
  }, []);

  return (
    <section className="build themed scallop" id="build" data-theme="chrome" ref={sec}>
      <div className="build-pin">
        <div className="build-copy">
          <p className="label">How a pizza gets made here</p>
          <ProximityText as="h2" className="h2" parts={['Five layers,\n', { t: 'one fire.', accent: true }]} radius={190} strength={30} />
          <ol className="build-steps">
            {BUILD_STEPS.map((s, i) => (
              <li key={s.title} ref={(node) => {(steps.current[i] = node)}}>
                <span className="build-no">{String(i + 1).padStart(2, '0')}</span>
                <strong>{s.title}</strong>
                <small>{s.copy}</small>
              </li>
            ))}
          </ol>
        </div>
        <div className="build-stage" aria-hidden="true">
          {Array.from({ length: PIZZA_LAYER_COUNT }, (_, i) => (
            <div key={i} className="build-layer" ref={(node) => {(layers.current[i] = node)}}>
              <PizzaLayer index={i} />
            </div>
          ))}
        </div>
        <div className="build-track" aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* A row of tilted names that slides sideways as you scroll            */
/* ------------------------------------------------------------------ */

function NameRow({ items, from, to, onPick }: { items: MenuItem[]; from: number; to: number; onPick: (d: MenuItem) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    const tr = track.current;
    if (!el || !tr || reducedMotion()) return;
    return registerFx(el, 'enter', (p) => {
      tr.style.transform = `translate3d(${(from + (to - from) * p).toFixed(2)}%,0,0)`;
    });
  }, [from, to]);

  return (
    <div className="names-row" ref={box}>
      <div className="names-track" ref={track}>
        {items.map((d, i) => (
          <button
            key={d.id}
            className={`name-chip c${i % 3}`}
            style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
            onClick={() => onPick(d)}
            data-cursor="Open"
            aria-label={d.name}
          >
            <ProximityText as="span" parts={[d.name.toUpperCase()]} radius={150} strength={24} spin={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The room: cards that travel sideways while the section is pinned    */
/* ------------------------------------------------------------------ */

function Room({ onReserve }: { onReserve: () => void }) {
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sec.current;
    const tr = track.current;
    if (!el || !tr) return;
    if (reducedMotion()) {
      el.classList.add('flat');
      return;
    }
    let max = 0;
    const measure = () => {
      max = Math.max(0, tr.scrollWidth - window.innerWidth);
      el.style.height = `${window.innerHeight + max}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    window.addEventListener('resize', measure);
    const off = registerFx(
      el,
      'pin',
      (p) => {
        tr.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
      },
      0.2,
    );
    return () => {
      off();
      ro.disconnect();
      window.removeEventListener('resize', measure);
      el.style.height = '';
    };
  }, []);

  return (
    <section className="room themed scallop" id="room" data-theme="orange" ref={sec}>
      <div className="room-pin">
        <div className="room-head">
          <p className="label">The room</p>
          <ProximityText as="h2" className="h2 h2-small" parts={['Come for breakfast. ', { t: 'Stay for dessert.', accent: true }]} radius={170} strength={26} />
        </div>
        <div className="room-track" ref={track}>
          <figure className="card card-photo" style={{ '--tilt': '-3deg' } as CSSProperties}>
            <img src={INTERIOR_IMAGE} alt="The dining room at Hadiqa" loading="lazy" />
            <figcaption>The room</figcaption>
          </figure>
          <div className="card card-text card-sun" style={{ '--tilt': '2deg' } as CSSProperties}>
            <p className="card-big">10 AM</p>
            <p>Eggs, omelettes, toasts and burgers from the first hour.</p>
          </div>
          <figure className="card card-photo" style={{ '--tilt': '3deg' } as CSSProperties}>
            <img src={DISH_IMAGE} alt="A plate from the Hadiqa kitchen" loading="lazy" />
            <figcaption>On the table</figcaption>
          </figure>
          <div className="card card-text card-scarlet" style={{ '--tilt': '-2deg' } as CSSProperties}>
            <p className="card-big">₹250</p>
            <p>For two, approximately. Pizza, pasta, shakes and cake all fit.</p>
          </div>
          <figure className="card card-photo" style={{ '--tilt': '-2deg' } as CSSProperties}>
            <img src={HERO_IMAGE} alt="Inside Hadiqa" loading="lazy" style={{ objectPosition: '30% 50%' }} />
            <figcaption>Pull up a chair</figcaption>
          </figure>
          <button className="card-cta" onClick={onReserve} data-cursor="Book">
            <Food name="pizza" className="card-cta-icon" />
            <span>Reserve a table</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  const [activeCategory, setActiveCategory] = useState<'All' | MenuCategory>('All');
  const [activeCuisine, setActiveCuisine] = useState<CuisineFilter>('All');
  const [topDishesOnly, setTopDishesOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [shortlist, setShortlist] = useState<number[]>([]);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [current, setCurrent] = useState('');

  useEffect(() => initEngine(), []);

  const visibleDishes = useMemo(
    () =>
      menuData.filter(
        (dish) =>
          (activeCategory === 'All' || dish.category === activeCategory) &&
          (activeCuisine === 'All' || dish.cuisine === activeCuisine) &&
          (!topDishesOnly || dish.topDish) &&
          (!vegOnly || dish.vegetarian) &&
          (!query.trim() || `${dish.name} ${dish.description} ${dish.ingredients}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [activeCategory, activeCuisine, topDishesOnly, vegOnly, query],
  );

  const pizzas = useMemo(() => {
    const all = menuData.filter((d) => d.category === 'Pizzas & Wood-Fired');
    const priced = all.filter((d) => d.price.startsWith('₹') && !d.name.startsWith('Extra'));
    const specials = all.filter((d) => d.price === 'Chef special');
    const half = Math.ceil(specials.length / 2);
    return {
      veg: priced.filter((d) => d.vegetarian),
      chicken: priced.filter((d) => !d.vegetarian),
      specialsA: specials.slice(0, half),
      specialsB: specials.slice(half),
      specialCount: specials.length,
    };
  }, []);

  const picks = useMemo(() => PICKS.map((p) => menuData.find((d) => d.name.toLowerCase().includes(p))).filter((d): d is MenuItem => !!d), []);

  const shortlisted = useMemo(() => menuData.filter((d) => shortlist.includes(d.id)), [shortlist]);

  // The nav pills take their colours from whichever section sits under them.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-theme], footer[data-theme]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) document.documentElement.dataset.theme = (entry.target as HTMLElement).dataset.theme;
        });
      },
      { rootMargin: '-4% 0px -92% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Highlights the nav link for the section you are reading.
  useEffect(() => {
    const ids = ['top', 'pizza', 'menu', 'room', 'visit'];
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id === 'top' ? '' : entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedDish || reservationOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDish, reservationOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedDish(null);
      setReservationOpen(false);
      setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleShortlist = (id: number) => setShortlist((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const openReservation = () => {
    setNavOpen(false);
    setReservationOpen(true);
  };

  const link = (id: string) => `nav-link${current === id ? ' is-current' : ''}`;

  return (
    <main>
      <Cursor />

      {/* NAV (three floating pills) */}
      <header className="nav">
        <a className="pill nav-logo" href="#top" aria-label="Hadiqa, back to top">
          HADIQA
        </a>
        <nav className={`pill nav-links ${navOpen ? 'is-open' : ''}`} aria-label="Main">
          <a className={link('pizza')} href="#pizza" onClick={() => setNavOpen(false)}>Pizza</a>
          <a className={link('menu')} href="#menu" onClick={() => setNavOpen(false)}>Menu</a>
          <a className={link('room')} href="#room" onClick={() => setNavOpen(false)}>The room</a>
          <a className={link('visit')} href="#visit" onClick={() => setNavOpen(false)}>Visit</a>
        </nav>
        <div className="nav-right">
          {shortlist.length > 0 && (
            <a className="pill pill-quiet" href="#menu">
              Shortlist {shortlist.length}
            </a>
          )}
          <button className="pill nav-toggle" onClick={() => setNavOpen((open) => !open)} aria-expanded={navOpen}>
            {navOpen ? 'Close' : 'Menu'}
          </button>
          <button className="pill pill-cta" onClick={openReservation}>
            Reserve
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero themed" id="top" data-theme="scarlet">
        <span className="hero-shape hero-shape-a" aria-hidden="true" />
        <span className="hero-shape hero-shape-b" aria-hidden="true" />
        <Floaters items={HERO_FLOATERS} />
        <div className="badge" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path id="badge-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#badge-path" textLength="486" lengthAdjust="spacing">
                OPEN DAILY · 10 AM TO 11 PM · MANIPAL ·
              </textPath>
            </text>
          </svg>
          <Food name="pizza" className="badge-icon" />
        </div>

        <div className="hero-title-wrap">
          <ProximityText as="h1" className="hero-title" parts={['HADI', { t: 'QA', accent: true }]} tilt={[-4, 3, -2, 4, -3, 2]} radius={330} strength={64} spin={16} />
        </div>

        <div className="hero-bottom">
          <div className="hero-copy">
            <p>Wood-fired pizza, eggs on toast, house pasta and a dessert list that keeps going.</p>
            <OpenNow />
            <div className="hero-actions">
              <a className="btn btn-solid" href="#menu">See the menu</a>
              <button className="btn" onClick={openReservation}>Reserve a table</button>
              <a className="btn" href={MAPS_LINK} target="_blank" rel="noreferrer">Directions</a>
            </div>
          </div>
          <a className="hero-scroll label" href="#build" aria-label="Scroll down">
            <span>Scroll</span>
            <i />
          </a>
          <p className="hero-sign">
            See you
            <br />
            at ten.
          </p>
        </div>
      </section>

      {/* TILTED BANDS */}
      <div className="bands" aria-hidden="true">
        <div className="tilt tilt-a">
          <ScrollBand items={BAND_A} from={4} to={-40} />
        </div>
        <div className="tilt tilt-b">
          <ScrollBand items={BAND_B} from={-40} to={4} />
        </div>
      </div>

      {/* STORY */}
      <section className="section themed story" id="story" data-theme="cream">
        <p className="label">About Hadiqa</p>
        <ScrollWords
          className="story-text"
          text="Hadiqa is a restaurant and bar in Eshwar Nagar, Manipal. We cook *wood-fired pizza*, serve *eggs on toast* from ten, toss *pasta* to order and keep a dessert list that never quite ends."
        />
        <div className="story-bottom">
          <dl className="facts">
            <div>
              <dt>On the menu</dt>
              <dd>{menuData.length} items</dd>
            </div>
            <div>
              <dt>For two</dt>
              <dd>₹250 approx.</dd>
            </div>
            <div>
              <dt>Open</dt>
              <dd>10 AM to 11 PM</dd>
            </div>
          </dl>
          <div className="story-pics">
            <ParallaxImage className="pic pic-a" src={INTERIOR_IMAGE} alt="The dining room at Hadiqa" amount={8} />
            <ParallaxImage className="pic pic-b" src={DISH_IMAGE} alt="A plate from the Hadiqa kitchen" amount={10} />
          </div>
        </div>
      </section>

      {/* PIZZA BUILD (pinned) */}
      <PizzaBuild />

      {/* PIZZA LIST */}
      <section className="section themed plist" id="pizza" data-theme="ink">
        <div className="head">
          <p className="label">Wood-fired</p>
          <ProximityText as="h2" className="h2" parts={['The pizza ', { t: 'list.', accent: true }]} radius={190} strength={30} />
          <p className="head-note">Thin crust, house tomato and mozzarella on every one. Tap a name for the details.</p>
        </div>
        <div className="plist-grid">
          <div className="plist-col">
            <h3>
              Veg <small>{pizzas.veg[0]?.price}</small>
            </h3>
            {pizzas.veg.map((d) => (
              <button key={d.id} className="plist-item" onClick={() => setSelectedDish(d)} data-cursor="Open">
                <span>{d.name}</span>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>
          <div className="plist-col">
            <h3>
              Chicken <small>{pizzas.chicken[0]?.price}</small>
            </h3>
            {pizzas.chicken.map((d) => (
              <button key={d.id} className="plist-item" onClick={() => setSelectedDish(d)} data-cursor="Open">
                <span>{d.name}</span>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
            <p className="plist-foot">Extra toppings: ₹40 veg, ₹60 non-veg. Or build your own, just ask.</p>
          </div>
        </div>
      </section>

      {/* CHEF SPECIALS */}
      <section className="section themed specials scallop" id="specials" data-theme="scarlet">
        <p className="label">Not on the board</p>
        <ProximityText as="h2" className="h2 h2-small" parts={[`${pizzas.specialCount} chef specials.\n`, { t: 'One piece of advice:', accent: true }, ' ask the kitchen.']} radius={190} strength={30} />
        <div className="names">
          <NameRow items={pizzas.specialsA} from={2} to={-34} onPick={setSelectedDish} />
          <NameRow items={pizzas.specialsB} from={-34} to={2} onPick={setSelectedDish} />
        </div>
      </section>

      {/* MENU */}
      <section className="section themed menu" id="menu" data-theme="cream">
        <div className="head">
          <p className="label">The whole menu</p>
          <ProximityText as="h2" className="h2" parts={['Start ', { t: 'anywhere.', accent: true }]} radius={190} strength={30} />
          <p className="head-note">Tap any dish for ingredients, allergens and what to drink with it.</p>
        </div>

        {picks.length > 0 && (
          <div className="picks">
            <span className="label">Start here · most mentioned in reviews</span>
            <div className="picks-row">
              {picks.map((d) => (
                <button key={d.id} className="pick" onClick={() => setSelectedDish(d)} data-cursor="Open">
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="toolbar">
          <div className="chip-row" role="group" aria-label="Menu categories">
            {categories.map((category) => (
              <button key={category} className={`chip ${activeCategory === category ? 'is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            ))}
          </div>
          <div className="chip-row" role="group" aria-label="Cuisine">
            <span className="label chip-label">Cuisine</span>
            {cuisines.map((cuisine) => (
              <button key={cuisine} className={`chip chip-small ${activeCuisine === cuisine ? 'is-active' : ''}`} aria-pressed={activeCuisine === cuisine} onClick={() => setActiveCuisine(cuisine)}>
                {cuisine}
              </button>
            ))}
            <input className="menu-search" type="search" placeholder="Search dishes" aria-label="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={`chip chip-small ${vegOnly ? 'is-active' : ''}`} aria-pressed={vegOnly} onClick={() => setVegOnly((on) => !on)}>
              Veg only
            </button>
            <button className={`chip chip-small chip-top ${topDishesOnly ? 'is-active' : ''}`} aria-pressed={topDishesOnly} onClick={() => setTopDishesOnly((on) => !on)}>
              Top dishes
            </button>
            <span className="label chip-count">{visibleDishes.length} dishes</span>
          </div>
        </div>

        {shortlisted.length > 0 && (
          <div className="shortlist-bar">
            <span className="label">Your shortlist</span>
            {shortlisted.map((d) => (
              <button key={d.id} className="shortlist-chip" onClick={() => toggleShortlist(d.id)} aria-label={`Remove ${d.name}`}>
                {d.name} <span aria-hidden="true">✕</span>
              </button>
            ))}
          </div>
        )}

        <div className="dishes" key={`${activeCategory}|${activeCuisine}|${topDishesOnly}|${vegOnly}|${query}`}>
          <div className="dishes-head label">
            <span>No.</span>
            <span>Dish</span>
            <span className="col-tags" />
            <span className="col-price">Price</span>
            <span />
          </div>
          {visibleDishes.map((dish, i) => (
            <button key={dish.id} className="dish" style={{ '--i': Math.min(i, 12) } as CSSProperties} onClick={() => setSelectedDish(dish)} data-cursor="Open">
              <span className="dish-no">{String(dish.id).padStart(2, '0')}</span>
              <span className="dish-name">
                <strong>{dish.name}</strong>
                <small>{dish.description}</small>
              </span>
              <span className="dish-tags">
                {dish.topDish && <em>Top dish</em>}
                {dish.vegetarian && <b title="Vegetarian">V</b>}
              </span>
              <span className="dish-price">{dish.price}</span>
              <span className="dish-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
          {visibleDishes.length === 0 && <p className="empty">Nothing matches those filters. Loosen one and try again.</p>}
        </div>
        <p className="menu-foot">Tell us about allergies when you order or book.</p>
      </section>

      {/* ROOM (pinned, sideways) */}
      <Room onReserve={openReservation} />
      <Gallery />
      <Reviews />

      {/* VISIT */}
      <section className="section themed visit" id="visit" data-theme="ink">
        <div className="visit-grid">
          <div>
            <p className="label">Visit</p>
            <ProximityText as="h2" className="h2" parts={['Find us in\n', { t: 'Manipal.', accent: true }]} radius={190} strength={30} />
            <p className="aka">Also known as Egg Factory.</p>
            <dl className="visit-list">
              <div>
                <dt>Address</dt>
                <dd>
                  <a href={MAPS_LINK} target="_blank" rel="noreferrer">{ADDRESS} ↗</a>
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>10 AM to 11 PM</dd>
              </div>
              <div>
                <dt>For two</dt>
                <dd>₹250 approx.</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                </dd>
              </div>
            </dl>
            <button className="btn btn-solid" onClick={openReservation}>Reserve a table</button>
          </div>
          <div className="map-frame">
            <iframe title="Hadiqa on the map" src="https://www.google.com/maps?q=Smrithi+Bhavan+Eshwar+Nagar+Manipal&output=embed" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot themed scallop" data-theme="scarlet">
        <div className="foot-card">
          <p>Hungry? Tables are confirmed by phone.</p>
          <button className="foot-link" onClick={openReservation}>
            Reserve a table <i aria-hidden="true">↗</i>
          </button>
        </div>
        <div className="foot-stage">
          <ProximityText as="p" className="foot-word" parts={['HADI', { t: 'QA', accent: true }]} radius={320} strength={60} spin={14} />
          <FoodPile />
        </div>
        <div className="foot-row">
          <span>{ADDRESS}</span>
          <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
          <span>10 AM to 11 PM</span>
        </div>
      </footer>

      <nav className="quickbar" aria-label="Quick actions">
        <a href={`tel:${PHONE_TEL}`}>Call</a>
        <a href={MAPS_LINK} target="_blank" rel="noreferrer">Directions</a>
        {WHATSAPP ? (
          <a className="quick-main" href={waLink('Hi Hadiqa, I would like to book a table.')} target="_blank" rel="noreferrer">Book</a>
        ) : (
          <button className="quick-main" onClick={openReservation}>Book</button>
        )}
      </nav>

      <AnimatePresence>
        {selectedDish && (
          <DishDrawer dish={selectedDish} isShortlisted={shortlist.includes(selectedDish.id)} onClose={() => setSelectedDish(null)} onToggle={() => toggleShortlist(selectedDish.id)} />
        )}
      </AnimatePresence>
      <AnimatePresence>{reservationOpen && <ReservationModal onClose={() => setReservationOpen(false)} />}</AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

function DishDrawer({ dish, isShortlisted, onClose, onToggle }: { dish: MenuItem; isShortlisted: boolean; onClose: () => void; onToggle: () => void }) {
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}>
      <motion.aside
        className="drawer"
        data-theme="ink"
        data-native-scroll
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
        <div className="drawer-image">
          <img src={dishImage(dish)} alt={dish.name} />
        </div>
        <div className="drawer-content">
          <p className="label">{dish.category}</p>
          <div className="drawer-title">
            <h2>{dish.name}</h2>
            <strong>{dish.price}</strong>
          </div>
          <p className="drawer-description">{dish.description}</p>
          <dl className="drawer-specs">
            <div>
              <dt>Cuisine</dt>
              <dd>{dish.cuisine}</dd>
            </div>
            <div>
              <dt>Allergens</dt>
              <dd>{dish.allergens}</dd>
            </div>
            <div>
              <dt>Ingredients</dt>
              <dd>{dish.ingredients}</dd>
            </div>
            <div>
              <dt>Pair it with</dt>
              <dd>{dish.pairing}</dd>
            </div>
          </dl>
          <button className={`btn btn-solid btn-block ${isShortlisted ? 'is-added' : ''}`} onClick={onToggle}>
            {isShortlisted ? 'On your shortlist (tap to remove)' : 'Add to shortlist'}
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function ReservationModal({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('7:30 PM');

  const prettyDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <motion.div className="overlay overlay-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}>
      <motion.div
        className="modal"
        data-theme="ink"
        data-native-scroll
        role="dialog"
        aria-modal="true"
        aria-label="Reserve a table"
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        exit={{ y: 24 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>
            Find your <span className="accent">table.</span>
          </h2>
          <button className="close-button close-inline" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="field">
          <span className="label">Party size</span>
          <div className="stepper">
            <button onClick={() => setPartySize((n) => Math.max(1, n - 1))} aria-label="Fewer guests">−</button>
            <strong>{partySize} {partySize === 1 ? 'guest' : 'guests'}</strong>
            <button onClick={() => setPartySize((n) => Math.min(12, n + 1))} aria-label="More guests">+</button>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="res-date">Date</label>
          <input id="res-date" className="date-input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value || today)} />
        </div>

        <div className="field">
          <span className="label">Time</span>
          <div className="pill-row">
            {['1:00 PM', '4:00 PM', '7:30 PM', '9:00 PM'].map((slot) => (
              <button key={slot} className={`chip ${time === slot ? 'is-active' : ''}`} aria-pressed={time === slot} onClick={() => setTime(slot)}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        <p className="modal-summary">
          Table for {partySize} on {prettyDate} at {time}.
        </p>
        {WHATSAPP ? (
          <>
            <a className="btn btn-solid btn-block" href={waLink(`Hi Hadiqa, I would like a table for ${partySize} on ${prettyDate} at ${time}.`)} target="_blank" rel="noreferrer">
              Book on WhatsApp
            </a>
            <a className="btn btn-block" href={`tel:${PHONE_TEL}`}>Or call {PHONE_DISPLAY}</a>
          </>
        ) : (
          <a className="btn btn-solid btn-block" href={`tel:${PHONE_TEL}`}>
            Call {PHONE_DISPLAY} to confirm
          </a>
        )}
        <p className="modal-note">Tables are confirmed by phone or WhatsApp. Groups of 8 or more, please call ahead.</p>
      </motion.div>
    </motion.div>
  );
}

export default App;