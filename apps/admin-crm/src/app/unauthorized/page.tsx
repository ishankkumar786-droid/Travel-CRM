import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Access Denied' };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-destructive text-5xl font-bold">403</h1>
        <h2 className="text-foreground mt-2 text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          You don&apos;t have permission to access this page.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
