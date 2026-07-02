'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/Button';

/**
 * Top navigation bar placeholder.
 * Phase 2 will add navigation items, user menu, and notifications.
 */
export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center gap-4 border-b px-4 backdrop-blur sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <span className="text-foreground text-sm font-semibold">Travel Marketplace</span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun
              className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
              aria-hidden="true"
            />
            <Moon
              className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
