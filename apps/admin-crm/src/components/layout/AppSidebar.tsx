'use client';

import {
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  Package,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useUnreadCount } from '@/hooks/usePhase6';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agencies', href: '/dashboard/agencies', icon: Building2 },
  { label: 'Packages', href: '/dashboard/packages', icon: Package },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Import', href: '/dashboard/import', icon: Upload },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: unread } = useUnreadCount();

  return (
    <aside
      className="border-sidebar-border bg-sidebar hidden w-60 flex-col border-r lg:flex"
      aria-label="Main navigation"
    >
      <div className="border-sidebar-border flex h-14 items-center border-b px-5">
        <span className="text-sidebar-foreground text-sm font-bold">Travel Marketplace</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Sidebar navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/dashboard/notifications'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
          Notifications
          {unread !== undefined && unread > 0 && (
            <span className="bg-primary text-primary-foreground ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <p className="text-sidebar-foreground/40 px-3 text-xs">v0.6.0</p>
      </div>
    </aside>
  );
}
