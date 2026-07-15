'use client';

import { AuthProvider } from '@/contexts/AuthContext';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
