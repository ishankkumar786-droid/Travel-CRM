import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { Destinations } from '@/components/home/Destinations';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { CTA } from '@/components/home/CTA';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Destinations />
        <FeaturedPackages />
        <WhyChooseUs />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
