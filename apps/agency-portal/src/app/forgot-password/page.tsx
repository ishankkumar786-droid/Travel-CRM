import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="from-primary/5 via-background to-accent/5 absolute inset-0 bg-gradient-to-br" />
      </div>

      <div className="animate-fade-in-up w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@agency.com"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium shadow transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remember your password?{' '}
          <a href="/login" className="text-primary hover:text-primary/80 font-medium">
            Sign In
          </a>
        </p>
      </div>
    </main>
  );
}
