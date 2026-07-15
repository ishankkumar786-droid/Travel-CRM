import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@agency.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <a href="/login" className="font-medium text-primary hover:text-primary/80">
            Sign In
          </a>
        </p>
      </div>
    </main>
  );
}
