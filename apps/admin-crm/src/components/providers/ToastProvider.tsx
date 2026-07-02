'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={theme as 'light' | 'dark' | 'system' | undefined}
      richColors
      closeButton
      duration={4000}
    />
  );
}
