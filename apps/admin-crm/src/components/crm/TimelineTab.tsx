'use client';

import { Activity, CheckSquare, Clock, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';

import type { TimelineItem, TimelineItemType } from '@travel/types';

import { useTimeline } from '@/hooks/useCRM';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<TimelineItemType, React.ReactNode> = {
  activity: <Activity className="h-4 w-4" />,
  note: <MessageSquare className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  followup: <Clock className="h-4 w-4" />,
  agency_created: <Activity className="h-4 w-4" />,
  agency_updated: <Activity className="h-4 w-4" />,
  status_changed: <Activity className="h-4 w-4" />,
};

const TYPE_COLOR: Record<TimelineItemType, string> = {
  activity: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  note: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  task: 'bg-green-500/10 text-green-600 dark:text-green-400',
  followup: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  agency_created: 'bg-primary/10 text-primary',
  agency_updated: 'bg-primary/10 text-primary',
  status_changed: 'bg-orange-500/10 text-orange-600',
};

export function TimelineTab({ agencyId }: { agencyId: string }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTimeline(agencyId, {
    search: search || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          placeholder="Search timeline…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No timeline events"
          description="Activities, notes, tasks and follow-ups will appear here."
          icon={<Activity className="h-6 w-6" />}
        />
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="bg-border absolute left-5 top-0 h-full w-px" aria-hidden="true" />

          {items.map((item: TimelineItem) => (
            <div key={item.id} className="relative flex gap-4 pb-6">
              {/* Dot */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  TYPE_COLOR[item.type] ?? 'bg-muted text-muted-foreground',
                )}
              >
                {TYPE_ICON[item.type]}
              </div>
              {/* Content */}
              <div className="flex-1 pt-1.5">
                <p className="text-foreground text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {item.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
