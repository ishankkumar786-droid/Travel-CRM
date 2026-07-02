import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Travel Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Admin Portal</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
