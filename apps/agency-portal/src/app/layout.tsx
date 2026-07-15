import { Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import { Providers } from '@/components/providers/Providers';

import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Travel Marketplace — Agency Portal',
    template: '%s | Agency Portal',
  },
  description: 'Manage your travel agency, packages, and bookings on the Travel Marketplace.',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
