'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side auth guard.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users away from public-only pages.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  if (isLoading) return <PageLoader />;

  // On public route + not authenticated → render
  if (isPublicRoute && !isAuthenticated) return <>{children}</>;

  // On protected route + authenticated → render
  if (!isPublicRoute && isAuthenticated) return <>{children}</>;

  // Transitional state (redirect in progress)
  return <PageLoader />;
}
