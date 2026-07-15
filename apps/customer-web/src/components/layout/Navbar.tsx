'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Destinations', href: '/#destinations' },
  { label: 'Agencies', href: '/agencies' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showSolid = scrolled || !isHome;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        showSolid
          ? 'bg-background/90 backdrop-blur-xl border-b shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[4.5rem] lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 11 19-9-9 19-2-8-8-2Z" />
            </svg>
          </div>
          <span className={cn(
            'text-lg font-bold tracking-tight transition-colors',
            showSolid ? 'text-foreground' : isHome ? 'text-white' : 'text-foreground',
          )} style={{ fontFamily: 'var(--font-display)' }}>
            Travel<span className="text-primary">Market</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-[0.8125rem] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : showSolid
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      : isHome
                        ? 'text-white/75 hover:text-white hover:bg-white/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                showSolid
                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  : isHome
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-[1.125rem] w-[1.125rem]" /> : <Moon className="h-[1.125rem] w-[1.125rem]" />}
            </button>
          )}

          {/* CTA */}
          <Link
            href="/agencies"
            className="hidden md:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
          >
            Find Agencies
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'flex md:hidden h-9 w-9 items-center justify-center rounded-lg transition-colors',
              showSolid
                ? 'text-foreground hover:bg-muted'
                : isHome ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted',
            )}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-background border-t',
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-0',
        )}
      >
        <nav className="mx-auto max-w-7xl flex flex-col gap-1 px-5 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
