'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { forgotPasswordSchema } from '@travel/validation';
import type { ForgotPasswordInput } from '@travel/validation';

import { authApi } from '@/services/auth.api';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSubmitted(true);
    } catch {
      // Always show success to prevent enumeration
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="border-border bg-card rounded-xl border p-8 text-center shadow-sm">
        <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Mail className="text-primary h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-foreground text-lg font-semibold">Check your email</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          If that email address is registered, you will receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="text-primary mt-6 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-foreground text-xl font-semibold">Reset your password</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {serverError && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-foreground text-sm font-medium">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={!!errors.email}
              className="pl-9"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
