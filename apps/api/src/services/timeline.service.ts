import { Activity } from '@/models/activity.model';
import { FollowUp } from '@/models/followup.model';
import { Note } from '@/models/note.model';
import { Task } from '@/models/task.model';
import { buildPaginationMeta } from '@/utils';

import type { TimelineItem, TimelineItemType } from '@travel/types';

interface TimelineQuery {
  page: number;
  limit: number;
  types?: string;
  search?: string;
}

class TimelineService {
  async getForAgency(
    agencyId: string,
    query: TimelineQuery,
  ): Promise<{ items: TimelineItem[]; pagination: ReturnType<typeof buildPaginationMeta> }> {
    const allowedTypes = query.types
      ? (query.types.split(',') as TimelineItemType[])
      : (['activity', 'note', 'task', 'followup'] as TimelineItemType[]);

    const searchRx = query.search ? new RegExp(query.search, 'i') : undefined;

    // Collect all items in parallel
    const [activities, notes, tasks, followups] = await Promise.all([
      allowedTypes.includes('activity')
        ? Activity.find({
            agencyId,
            ...(searchRx && { $or: [{ title: searchRx }, { description: searchRx }] }),
          })
            .sort({ createdAt: -1 })
            .limit(200)
            .exec()
        : Promise.resolve([]),

      allowedTypes.includes('note')
        ? Note.find({
            agencyId,
            ...(searchRx && { content: searchRx }),
          })
            .sort({ createdAt: -1 })
            .limit(200)
            .exec()
        : Promise.resolve([]),

      allowedTypes.includes('task')
        ? Task.find({
            agencyId,
            ...(searchRx && { $or: [{ title: searchRx }, { description: searchRx }] }),
          })
            .sort({ createdAt: -1 })
            .limit(200)
            .exec()
        : Promise.resolve([]),

      allowedTypes.includes('followup')
        ? FollowUp.find({
            agencyId,
            ...(searchRx && { notes: searchRx }),
          })
            .sort({ createdAt: -1 })
            .limit(200)
            .exec()
        : Promise.resolve([]),
    ]);

    // Map to unified TimelineItem
    const items: TimelineItem[] = [
      ...activities.map((a) => ({
        id: a._id.toString(),
        type: 'activity' as TimelineItemType,
        title: `${capitalise(a.type)}: ${a.title}`,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
        createdBy: a.createdBy?.toString(),
        metadata: { activityType: a.type, outcome: a.outcome },
      })),
      ...notes.map((n) => ({
        id: n._id.toString(),
        type: 'note' as TimelineItemType,
        title: n.isPinned ? '📌 Note (pinned)' : 'Note',
        description: n.content.slice(0, 200),
        createdAt: n.createdAt.toISOString(),
        createdBy: n.createdBy?.toString(),
        metadata: { isPinned: n.isPinned, tags: n.tags },
      })),
      ...tasks.map((t) => ({
        id: t._id.toString(),
        type: 'task' as TimelineItemType,
        title: `Task: ${t.title}`,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        createdBy: t.createdBy?.toString(),
        metadata: { priority: t.priority, status: t.status, dueDate: t.dueDate?.toISOString() },
      })),
      ...followups.map((f) => ({
        id: f._id.toString(),
        type: 'followup' as TimelineItemType,
        title: `Follow-up: ${capitalise(f.type)}`,
        description: f.notes,
        createdAt: f.createdAt.toISOString(),
        createdBy: f.createdBy?.toString(),
        metadata: {
          scheduledAt: f.scheduledAt.toISOString(),
          status: f.status,
          followupType: f.type,
        },
      })),
    ];

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const pageItems = items.slice(start, start + query.limit);

    return {
      items: pageItems,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');
}

export const timelineService = new TimelineService();
