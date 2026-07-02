'use client';

import { Pin, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { NoteDTO } from '@travel/types';

import { useCreateNote, useDeleteNote, useNotes, useToggleNotePin } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export function NotesTab({ agencyId }: { agencyId: string }) {
  const [newContent, setNewContent] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useNotes(agencyId, { search: search || undefined });
  const createMutation = useCreateNote(agencyId);
  const deleteMutation = useDeleteNote(agencyId);
  const pinMutation = useToggleNotePin(agencyId);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    await createMutation.mutateAsync({
      content: newContent,
      visibility: 'internal',
      isPinned: false,
      tags: [],
    });
    setNewContent('');
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  const notes = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Quick add */}
      <div className="border-border bg-card space-y-2 rounded-lg border p-4">
        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write an internal note…"
          className="text-foreground placeholder:text-muted-foreground w-full resize-none bg-transparent text-sm focus:outline-none"
          aria-label="Note content"
        />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Internal · Visible to team only</span>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newContent.trim()}
            loading={createMutation.isPending}
          >
            <Plus className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Save Note
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Write notes about this agency."
          icon={<Tag className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n: NoteDTO) => (
            <div
              key={n.id}
              className={cn(
                'rounded-lg border p-4',
                n.isPinned ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-foreground whitespace-pre-wrap text-sm">{n.content}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {n.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                    <span className="text-muted-foreground text-xs">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={n.isPinned ? 'Unpin' : 'Pin'}
                    onClick={() => pinMutation.mutate(n.id)}
                  >
                    <Pin
                      className={cn(
                        'h-4 w-4',
                        n.isPinned ? 'text-primary fill-primary' : 'text-muted-foreground',
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(n.id)}>
                    <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
