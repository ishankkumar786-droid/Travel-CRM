import Link from 'next/link';
import { MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const LINKS = {
  Destinations: ['Goa', 'Kerala', 'Rajasthan', 'Manali', 'Andaman', 'Ladakh'],
  'Travel Types': ['Beach Holidays', 'Adventure', 'Honeymoon', 'Family', 'Luxury', 'Group Tours'],
  Company: ['About Us', 'For Agencies', 'Blog', 'Careers', 'Contact'],
  Support: ['Help Center', 'Terms', 'Privacy Policy', 'Refund Policy'],
};

const SOCIAL = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Youtube, label: 'Youtube' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand — span 2 */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 11 19-9-9 19-2-8-8-2Z" />
                </svg>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Travel<span className="text-primary">Market</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-5 max-w-xs text-sm leading-relaxed">
              Your gateway to curated travel experiences across India. Verified agencies,
              transparent pricing.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="text-muted-foreground hover:bg-primary hover:border-primary flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className="text-foreground mb-4 text-sm font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/coming-soon"
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} TravelMarket. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Terms', 'Privacy', 'Cookies'].map((t) => (
              <Link
                key={t}
                href="/coming-soon"
                className="text-muted-foreground hover:text-primary text-xs transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
