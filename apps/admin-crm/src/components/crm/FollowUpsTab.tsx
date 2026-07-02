'use client';

import { CheckCircle2, Clock, Phone, Plus } from 'lucide-react';
import { useState } from 'react';

import type { FollowUpDTO } from '@travel/types';

import { useCompleteFollowUp, useCreateFollowUp, useFollowUps } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const STATUS_VARIANT = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'secondary',
  overdue: 'destructive',
} as const;
const FOLLOWUP_TYPES = ['call', 'email', 'meeting', 'whatsapp', 'visit', 'other'];

export function FollowUpsTab({ agencyId }: { agencyId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('call');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const { data, isLoading } = useFollowUps(agencyId);
  const createMutation = useCreateFollowUp(agencyId);
  const completeMutation = useCompleteFollowUp(agencyId);

  const handleCreate = async () => {
    if (!scheduledAt) return;
    await createMutation.mutateAsync({
      type,
      scheduledAt: new Date(scheduledAt).toISOString(),
      notes: notes || undefined,
      status: 'pending',
    });
    setType('call');
    setScheduledAt('');
    setNotes('');
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  const followups = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {followups.length} follow-up{followups.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Schedule
        </Button>
      </div>

      {followups.length === 0 ? (
        <EmptyState
          title="No follow-ups"
          description="Schedule a follow-up for this agency."
          icon={<Clock className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Schedule Follow-up
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {followups.map((f: FollowUpDTO) => (
            <div
              key={f.id}
              className={cn(
                'border-border rounded-lg border p-4',
                f.status === 'overdue' && 'border-destructive/40 bg-destructive/5',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <Phone className="text-primary h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium capitalize">
                        {f.type.replace('_', ' ')}
                      </p>
                      <Badge
                        variant={STATUS_VARIANT[f.status] ?? 'default'}
                        className="text-xs capitalize"
                      >
                        {f.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(f.scheduledAt).toLocaleString()}
                    </p>
                    {f.notes && <p className="text-muted-foreground mt-1 text-sm">{f.notes}</p>}
                  </div>
                </div>
                {f.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => completeMutation.mutate(f.id)}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Done
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Schedule Follow-up</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 p-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <select
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {FOLLOWUP_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Scheduled At *</label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                rows={2}
                className="border-input focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!scheduledAt}
                loading={createMutation.isPending}
              >
                Schedule
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
