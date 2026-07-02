import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Health',
};

export default function HealthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-foreground text-2xl font-semibold">System Health</h1>
      <div className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground text-sm">Frontend</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Operational
          </span>
        </div>
        <div className="border-border border-t" />
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground text-sm">API Server</span>
          <span className="text-muted-foreground text-sm">Check /api/v1/health</span>
        </div>
      </div>
    </main>
  );
}
