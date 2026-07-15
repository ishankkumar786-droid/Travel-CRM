import type { Metadata, Viewport } from 'next';

import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TravelMarket — Curated Travel Experiences',
    template: '%s — TravelMarket',
  },
  description:
    'Discover curated travel packages from verified agencies across India. From serene backwaters to majestic Himalayan peaks — find your perfect trip.',
  keywords: ['travel', 'packages', 'trips', 'India', 'marketplace', 'agencies', 'tours', 'tourism'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'TravelMarket',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1218' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
