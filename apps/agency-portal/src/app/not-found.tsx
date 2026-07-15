import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-gradient mb-4">404</p>
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </main>
  );
}
