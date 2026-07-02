import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/errors';
import { contactRepository } from '@/repositories/contact.repository';
import { activityRepository } from '@/repositories/activity.repository';
import { noteRepository } from '@/repositories/note.repository';
import { taskRepository } from '@/repositories/task.repository';
import { contactService } from '@/services/contact.service';
import { activityService } from '@/services/activity.service';
import { noteService } from '@/services/note.service';
import { taskService } from '@/services/task.service';

vi.mock('@/repositories/contact.repository', () => ({
  contactRepository: {
    emailExistsForAgency: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    setPrimary: vi.fn(),
  },
}));
vi.mock('@/repositories/activity.repository', () => ({
  activityRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findByAgency: vi.fn(),
  },
}));
vi.mock('@/repositories/note.repository', () => ({
  noteRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    togglePin: vi.fn(),
    findByAgency: vi.fn(),
  },
}));
vi.mock('@/repositories/task.repository', () => ({
  taskRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    complete: vi.fn(),
    findByAgency: vi.fn(),
  },
}));
vi.mock('@/models/audit-log.model', () => ({ logAudit: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const mockContact = {
  _id: { toString: () => 'c1' },
  agencyId: { toString: () => 'a1' },
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  toDTO: () => ({ id: 'c1', firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe' }),
  save: vi.fn().mockResolvedValue(undefined),
};

const mockActivity = {
  _id: { toString: () => 'act1' },
  agencyId: { toString: () => 'a1' },
  type: 'call',
  title: 'Test call',
  toDTO: () => ({ id: 'act1', type: 'call', title: 'Test call' }),
};

const mockNote = {
  _id: { toString: () => 'n1' },
  agencyId: { toString: () => 'a1' },
  content: 'Test note',
  isPinned: false,
  toDTO: () => ({ id: 'n1', content: 'Test note', isPinned: false }),
  save: vi.fn().mockResolvedValue({
    _id: { toString: () => 'n1' },
    isPinned: true,
    toDTO: () => ({ id: 'n1', isPinned: true }),
  }),
};

const mockTask = {
  _id: { toString: () => 't1' },
  agencyId: { toString: () => 'a1' },
  title: 'Test task',
  priority: 'medium',
  status: 'pending',
  toDTO: () => ({ id: 't1', title: 'Test task', status: 'pending' }),
};

describe('ContactService', () => {
  it('creates a contact when no email conflict', async () => {
    vi.mocked(contactRepository.emailExistsForAgency).mockResolvedValue(false);
    vi.mocked(contactRepository.create).mockResolvedValue(mockContact as never);
    const result = await contactService.create('a1', {
      firstName: 'Jane',
      lastName: 'Doe',
      preferredCommunication: 'email',
      isPrimary: false,
      status: 'active',
    });
    expect(result.firstName).toBe('Jane');
  });

  it('throws NotFoundError when contact not found', async () => {
    vi.mocked(contactRepository.findById).mockResolvedValue(null);
    await expect(contactService.getById('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('soft deletes a contact', async () => {
    vi.mocked(contactRepository.softDelete).mockResolvedValue(true);
    await expect(contactService.delete('c1')).resolves.toBeUndefined();
  });
});

describe('ActivityService', () => {
  it('creates an activity', async () => {
    vi.mocked(activityRepository.create).mockResolvedValue(mockActivity as never);
    const result = await activityService.create('a1', { type: 'call', title: 'Test call' });
    expect(result.type).toBe('call');
  });

  it('throws NotFoundError when activity not found', async () => {
    vi.mocked(activityRepository.findById).mockResolvedValue(null);
    await expect(activityService.getById('nonexistent')).rejects.toThrow(NotFoundError);
  });
});

describe('NoteService', () => {
  it('creates a note', async () => {
    vi.mocked(noteRepository.create).mockResolvedValue(mockNote as never);
    const result = await noteService.create('a1', {
      content: 'Test note',
      visibility: 'internal',
      isPinned: false,
      tags: [],
    });
    expect(result.content).toBe('Test note');
  });

  it('toggles pin on a note', async () => {
    vi.mocked(noteRepository.togglePin).mockResolvedValue({
      ...mockNote,
      isPinned: true,
      toDTO: () => ({ id: 'n1', isPinned: true }),
    } as never);
    const result = await noteService.togglePin('n1');
    expect(result.isPinned).toBe(true);
  });
});

describe('TaskService', () => {
  it('creates a task', async () => {
    vi.mocked(taskRepository.create).mockResolvedValue(mockTask as never);
    const result = await taskService.create('a1', {
      title: 'Test task',
      priority: 'medium',
      status: 'pending',
      checklist: [],
      labels: [],
    });
    expect(result.title).toBe('Test task');
  });

  it('completes a task', async () => {
    vi.mocked(taskRepository.complete).mockResolvedValue({
      ...mockTask,
      status: 'completed',
      toDTO: () => ({ id: 't1', status: 'completed' }),
    } as never);
    const result = await taskService.complete('t1');
    expect(result.status).toBe('completed');
  });

  it('throws NotFoundError when task not found', async () => {
    vi.mocked(taskRepository.softDelete).mockResolvedValue(false);
    await expect(taskService.delete('nonexistent')).rejects.toThrow(NotFoundError);
  });
});
