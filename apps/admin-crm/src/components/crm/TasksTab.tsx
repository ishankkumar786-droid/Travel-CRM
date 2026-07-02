'use client';

import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { TaskDTO } from '@travel/types';

import { useCompleteTask, useCreateTask, useDeleteTask, useTasks } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const PRIORITY_VARIANT = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
} as const;

export function TasksTab({ agencyId }: { agencyId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const { data, isLoading } = useTasks(agencyId);
  const createMutation = useCreateTask(agencyId);
  const completeMutation = useCompleteTask(agencyId);
  const deleteMutation = useDeleteTask(agencyId);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createMutation.mutateAsync({
      title,
      priority,
      status: 'pending',
      checklist: [],
      labels: [],
      ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
    });
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  const tasks = data?.items ?? [];
  const pending = tasks.filter((t: TaskDTO) => t.status !== 'completed');
  const completed = tasks.filter((t: TaskDTO) => t.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {pending.length} pending · {completed.length} completed
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create tasks to track work for this agency."
          icon={<CheckCircle2 className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Add Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {[...pending, ...completed].map((t: TaskDTO) => (
            <div
              key={t.id}
              className={cn(
                'border-border flex items-center gap-3 rounded-lg border p-3',
                t.status === 'completed' && 'opacity-60',
              )}
            >
              <button
                type="button"
                onClick={() => t.status !== 'completed' && completeMutation.mutate(t.id)}
                className="shrink-0"
                aria-label={t.status === 'completed' ? 'Completed' : 'Mark complete'}
              >
                {t.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
                ) : (
                  <Circle
                    className="text-muted-foreground hover:text-primary h-5 w-5"
                    aria-hidden="true"
                  />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-foreground text-sm font-medium',
                    t.status === 'completed' && 'line-through',
                  )}
                >
                  {t.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge
                    variant={PRIORITY_VARIANT[t.priority] ?? 'default'}
                    className="text-xs capitalize"
                  >
                    {t.priority}
                  </Badge>
                  {t.dueDate && (
                    <span className="text-muted-foreground text-xs">
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}>
                <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Task</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 p-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Task description"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
              >
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim()}
                loading={createMutation.isPending}
              >
                Create Task
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
