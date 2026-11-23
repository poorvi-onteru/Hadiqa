import { ParallaxImage, ProximityText } from './fx';
import { IMG } from './images';

const REVIEWS = [
  { name: 'Kapil Kale', when: 'a week ago', meta: 'Dinner · ₹600–800', text: 'A perfect place for Italian food lovers, especially those who enjoy wood-fired pizzas and non-vegetarian dishes. Offers great food quality and quantity with excellent service. The open-air ambience, surrounded by trees and complemented by soothing background music, makes it a lovely place to visit.' },
  { name: 'Atihsan B', when: 'a month ago', meta: 'Local Guide · 91 photos', text: 'The open-air setting is fantastic, and the service is excellent. I loved the chicken supreme pizza, paneer tikka pizza, and marble cheesecake, but the lasagna and aglio olio were average. The portions for the pasta and noodles are huge. Overall, it is an affordable and great place to visit anytime.' },
  { name: 'R Shetty', when: '4 months ago', meta: '₹400–600', text: "I've been to Egg Factory (Hadiqa) multiple times, and it's one of the best hangout spots in Manipal. I've tried their Penne Pasta, Aglio Olio, Roasted Chicken Pizza, French Fries, Grilled Chicken, and every dish has been delicious." },
  { name: 'mitali rai', when: '3 months ago', meta: '₹400–600', text: 'Hadiqa is our go-to spot for Sunday brunch. Their wood-fired pizzas are fantastic, especially the burnt garlic chicken and sun-dried tomato with chicken and the thyme chicken sandwich is a winner.' },
  { name: 'Chanthana SJ', when: 'a month ago', meta: 'Lunch · ₹200–400', text: 'Had Chinese fried rice with Schezwan sauce and the veg Schezwan crispies. Really loved both! The flavors were amazing, and the spice level was perfect. Everything was fresh and delicious.' },
  { name: 'Munendra Rana', when: 'a month ago', meta: 'Dinner · ₹400–600', text: 'Great place to hang out and have an enjoyable dinner/ meal. Great place overall. Open air, ambiance is good. Hats off to the service staff.' },
];

const MENTIONS = ['musty mushroom pasta · 41', 'cilantro pesto · 27', 'malabar chicken biryani · 10', 'outdoor seating · 4'];

export function Reviews() {
  return (
    <section className="section themed reviews" id="reviews" data-theme="ink">
      <div className="head">
        <p className="label">What people say</p>
        <ProximityText as="h2" className="h2" parts={['Word ', { t: 'of mouth.', accent: true }]} radius={160} strength={10} spin={0} />
        <div className="rating">
          <strong>4.45</strong>
          <span>420 Google reviews</span>
        </div>
      </div>
      <ul className="mentions" aria-label="Often mentioned in reviews">
        {MENTIONS.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <div className="review-grid">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="review">
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <strong>{r.name}</strong>
              <span>{r.meta} · {r.when}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

const SHOTS = [
  { src: IMG.glow, alt: 'Backlit citrus segment', cls: 'g-tall' },
  { src: IMG.bbq, alt: 'Chicken pizza with crispy onions', cls: '' },
  { src: IMG.window, alt: 'Red lit window', cls: 'g-tall' },
  { src: IMG.slices, alt: 'Dried orange slices', cls: '' },
  { src: IMG.chilli, alt: 'Pizza and chilli paneer at the table', cls: 'g-tall' },
  { src: IMG.layers, alt: 'Layered papaya and pineapple', cls: '' },
];

export function Gallery() {
  return (
    <section className="section themed gallery" id="gallery" data-theme="scarlet">
      <p className="label">After dark</p>
      <ProximityText as="h2" className="h2 h2-small" parts={['Fire, smoke ', { t: 'and citrus.', accent: true }]} radius={160} strength={10} spin={0} />
      <div className="gallery-grid">
        {SHOTS.map((s) => (
          <ParallaxImage key={s.src} className={`gshot ${s.cls}`} src={s.src} alt={s.alt} amount={4} />
        ))}
      </div>
    </section>
  );
}