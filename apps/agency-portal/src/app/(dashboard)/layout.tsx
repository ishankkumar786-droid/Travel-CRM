'use client';

import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

/**
 * Layout for all authenticated pages.
 * Wraps children with auth guard, sidebar, and header.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Sidebar — mobile (slide-in) */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-40 block lg:hidden transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
          />
        </div>

        {/* Main content area */}
        <div
          className={cn(
            'flex flex-col transition-all duration-300',
            sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[260px]',
          )}
        >
          <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
