import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-skeleton-pulse bg-muted rounded-md', className)} {...props} />;
}

export { Skeleton };
