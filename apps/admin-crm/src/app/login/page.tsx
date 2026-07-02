import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Travel Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Admin Portal</p>
        </div>

        <LoginForm />

        <p className="text-muted-foreground mt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} Travel Marketplace. All rights reserved.
        </p>
      </div>
    </main>
  );
}
