import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <div>
        <p className="text-foreground text-sm font-semibold">{title}</p>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
