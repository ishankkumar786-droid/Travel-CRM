'use client';

import type { ReactNode } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="bg-background flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppNavbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
