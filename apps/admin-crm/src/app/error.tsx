'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-destructive text-4xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-muted-foreground mt-1 text-xs">Error ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
