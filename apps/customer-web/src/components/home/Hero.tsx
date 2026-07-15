'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=80', // kerala backwaters
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80', // taj mahal
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80', // tropical beach
];

export function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  // Background image carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/packages?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/packages');
    }
  };

  return (
    <section className="relative flex h-[100svh] max-h-[900px] min-h-[600px] items-center overflow-hidden">
      {/* Animated Background Images */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_IMAGES[currentImage]})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark & Warm Overlays for text legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0f1218] via-transparent to-black/30" />
      <div className="bg-primary/10 absolute inset-0 z-0 mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl pt-16">
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="bg-primary h-px w-10" />
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">
              Curated Travel Experiences
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Explore India&apos;s Most <span className="text-primary italic">Breathtaking</span>{' '}
            Destinations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Handpicked packages from 100+ verified travel agencies. Plan your dream trip with
            confidence.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onSubmit={handleSearch}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="focus-within:border-primary/50 flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 backdrop-blur-md transition-colors focus-within:bg-black/60">
              <Search className="h-5 w-5 shrink-0 text-white/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations, packages…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <button
              type="submit"
              className="bg-primary shadow-primary/25 hover:shadow-primary/30 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-12 flex items-center gap-8"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {[
              { value: '500+', label: 'Packages' },
              { value: '100+', label: 'Agencies' },
              { value: '4.8★', label: 'Avg Rating' },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-xl font-bold text-white">{s.value}</span>
                <span className="text-[0.6875rem] uppercase tracking-wider text-white/50">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Progress Indicators for Carousel */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentImage === i ? 'bg-primary w-8' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
