import { ShieldCheck, Headphones, CreditCard, MapPinned, Award, Clock } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Agencies',
    desc: 'Every agency on our platform undergoes thorough GST and business document verification before listing.',
  },
  {
    icon: MapPinned,
    title: '500+ Destinations',
    desc: 'From coastal paradises to Himalayan retreats — discover every corner of incredible India.',
  },
  {
    icon: CreditCard,
    title: 'Best Price Guarantee',
    desc: 'Transparent pricing directly from agencies. No middlemen markups, no hidden costs.',
  },
  {
    icon: Headphones,
    title: '24/7 Travel Support',
    desc: 'Round-the-clock customer support via phone, email, and chat — even during your trip.',
  },
  {
    icon: Award,
    title: 'Rated & Reviewed',
    desc: 'Every package is rated by real travelers. Make informed decisions with authentic reviews.',
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    desc: 'Book with confidence — get instant confirmation and detailed itineraries from agencies.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="section">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="section-header mx-auto max-w-xl text-center">
          <span className="section-label">Why TravelMarket</span>
          <h2 className="section-title">Trusted by 50,000+ Travelers</h2>
          <p className="section-subtitle mx-auto">
            We connect you with the best travel agencies in India, so you can focus on making
            memories.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card hover:border-primary/30 card-lift group rounded-2xl border p-7 transition-all duration-300"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
