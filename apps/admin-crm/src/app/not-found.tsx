import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-foreground text-6xl font-bold">404</h1>
        <h2 className="text-foreground mt-2 text-xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </main>
  );
}
