'use client';

import { Bell, CheckCheck } from 'lucide-react';

import { useMarkNotificationRead, useNotifications } from '@/hooks/usePhase6';
import { notificationsApi } from '@/services/phase6.api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markMutation = useMarkNotificationRead();
  const qc = useQueryClient();

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead();
    void qc.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('All marked as read');
  };

  const notifs = data?.notifications ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Notifications</h1>
          {(data?.unreadCount ?? 0) > 0 && (
            <p className="text-muted-foreground text-sm">{data?.unreadCount} unread</p>
          )}
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifs.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up."
          icon={<Bell className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${n.isRead ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{n.title}</p>
                  {!n.isRead && (
                    <Badge variant="info" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                {n.body && <p className="text-muted-foreground mt-0.5 text-sm">{n.body}</p>}
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => markMutation.mutate(n.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
