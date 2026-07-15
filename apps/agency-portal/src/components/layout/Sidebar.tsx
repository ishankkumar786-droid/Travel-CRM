'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  Star,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Packages',
    href: '/packages',
    icon: Package,
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: ClipboardList,
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: Store,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    icon: Compass,
  },
];

const BOTTOM_ITEMS = [
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]',
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary shadow-md shadow-sidebar-primary/25">
            <svg
              className="h-5 w-5 text-sidebar-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
              <path d="m16 16-1.5-1.5" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-sidebar-foreground">
                Travel Marketplace
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                Agency Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-200',
                      !active && 'group-hover:scale-110',
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <ul className="space-y-1">
          {BOTTOM_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'px-2',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
