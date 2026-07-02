'use client';

import { LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar navigation placeholder.
 * Phase 2 will add full navigation items, collapsible sections, and active states.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="border-sidebar-border bg-sidebar flex h-full w-64 flex-col border-r"
      aria-label="Main navigation"
    >
      <div className="border-sidebar-border flex h-14 items-center border-b px-6">
        <span className="text-sidebar-foreground text-sm font-semibold">Admin CRM</span>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Sidebar navigation">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
            aria-current={pathname === href ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
