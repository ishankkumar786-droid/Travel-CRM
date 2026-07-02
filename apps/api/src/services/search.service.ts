import { Activity } from '@/models/activity.model';
import { Agency } from '@/models/agency.model';
import { Contact } from '@/models/contact.model';
import { Note } from '@/models/note.model';
import { Task } from '@/models/task.model';

import type { GlobalSearchResult } from '@travel/types';

class SearchService {
  async globalSearch(q: string, limit = 5): Promise<GlobalSearchResult> {
    const rx = new RegExp(q, 'i');

    const [agencies, contacts, activities, notes, tasks] = await Promise.all([
      Agency.find({
        deletedAt: { $exists: false },
        $or: [{ name: rx }, { agencyCode: rx }, { 'address.city': rx }, { ownerName: rx }],
      })
        .select('name agencyCode address.city')
        .limit(limit)
        .exec(),

      Contact.find({
        $or: [{ firstName: rx }, { lastName: rx }, { email: rx }],
      })
        .populate('agencyId', 'name')
        .select('firstName lastName email agencyId')
        .limit(limit)
        .exec(),

      Activity.find({ $or: [{ title: rx }, { description: rx }] })
        .populate('agencyId', 'name')
        .select('title type agencyId')
        .limit(limit)
        .exec(),

      Note.find({ content: rx })
        .populate('agencyId', 'name')
        .select('content agencyId')
        .limit(limit)
        .exec(),

      Task.find({ $or: [{ title: rx }, { description: rx }] })
        .populate('agencyId', 'name')
        .select('title priority agencyId')
        .limit(limit)
        .exec(),
    ]);

    return {
      agencies: agencies.map((a) => ({
        id: a._id.toString(),
        name: a.name,
        agencyCode: a.agencyCode,
        city: a.address?.city ?? '',
      })),
      contacts: contacts.map((c) => ({
        id: c._id.toString(),
        fullName: `${c.firstName} ${c.lastName}`,
        ...(c.email !== undefined && { email: c.email }),
        agencyId: c.agencyId?.toString() ?? '',
        agencyName: (c.agencyId as unknown as { name?: string } | null)?.name ?? '',
      })),
      activities: activities.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        type: a.type,
        agencyId: a.agencyId?.toString() ?? '',
        agencyName: (a.agencyId as unknown as { name?: string } | null)?.name ?? '',
      })),
      notes: notes.map((n) => ({
        id: n._id.toString(),
        content: n.content.slice(0, 100),
        agencyId: n.agencyId?.toString() ?? '',
        agencyName: (n.agencyId as unknown as { name?: string } | null)?.name ?? '',
      })),
      tasks: tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        priority: t.priority,
        agencyId: t.agencyId?.toString() ?? '',
        agencyName: (t.agencyId as unknown as { name?: string } | null)?.name ?? '',
      })),
    };
  }
}

export const searchService = new SearchService();
