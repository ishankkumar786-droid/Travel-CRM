'use client';

import { Phone, Plus, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createActivitySchema } from '@travel/validation';
import type { CreateActivityInput } from '@travel/validation';
import type { ActivityDTO } from '@travel/types';
import { useActivities, useCreateActivity, useDeleteActivity } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  video_call: <Video className="h-3.5 w-3.5" />,
};

const ACTIVITY_TYPES = [
  'call',
  'meeting',
  'email',
  'whatsapp',
  'visit',
  'demo',
  'video_call',
  'other',
];

export function ActivitiesTab({ agencyId }: { agencyId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useActivities(agencyId);
  const createMutation = useCreateActivity(agencyId);
  const deleteMutation = useDeleteActivity(agencyId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateActivityInput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: { type: 'call' },
  });

  const onSubmit = async (values: CreateActivityInput) => {
    await createMutation.mutateAsync(values as Record<string, unknown>);
    reset();
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  const activities = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{activities.length} activities</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Log Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No activities yet"
          description="Log calls, meetings and emails."
          icon={<Phone className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Log Activity
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {activities.map((a: ActivityDTO) => (
            <div key={a.id} className="border-border flex items-start gap-3 rounded-lg border p-4">
              <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {ACTIVITY_ICONS[a.type] ?? <Phone className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{a.title}</p>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {a.type.replace('_', ' ')}
                  </Badge>
                </div>
                {a.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {a.description}
                  </p>
                )}
                {a.outcome && (
                  <p className="text-muted-foreground mt-1 text-xs">Outcome: {a.outcome}</p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(a.id)}>
                <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Log Activity</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type *</label>
              <select
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                {...register('type')}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input placeholder="Brief summary" {...register('title')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={3}
                className="border-input focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
                placeholder="Details…"
                {...register('description')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Outcome</label>
              <Input placeholder="What was achieved?" {...register('outcome')} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Log Activity
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
