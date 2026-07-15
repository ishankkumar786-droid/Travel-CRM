'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { notificationService } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { NotificationDTO } from '@travel/types';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      // the api returns { success: true, data: { unreadCount, notifications } }
      const data = res.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative text-muted-foreground hover:text-foreground", isOpen && "bg-muted text-foreground")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1.5 text-primary">
                      {n.type === 'system' ? <Bell className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight text-foreground">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
