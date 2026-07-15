import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <svg
              className="h-7 w-7 text-primary-foreground"
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agency Portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your travel agency
          </p>
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Travel Marketplace. All rights reserved.
        </p>
      </div>
    </main>
  );
}
