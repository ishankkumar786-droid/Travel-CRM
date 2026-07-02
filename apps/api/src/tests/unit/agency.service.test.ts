import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConflictError, NotFoundError } from '@/errors';
import { agencyRepository } from '@/repositories/agency.repository';
import { agencyService } from '@/services/agency.service';

vi.mock('@/repositories/agency.repository', () => ({
  agencyRepository: {
    emailExists: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    archive: vi.fn(),
    restore: vi.fn(),
    bulkSoftDelete: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    bulkRestore: vi.fn(),
    bulkAddTags: vi.fn(),
    getStats: vi.fn(),
    findRecent: vi.fn(),
    exportAll: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('@/models/agency.model', async () => ({
  generateAgencyCode: vi.fn().mockResolvedValue('AGY00001'),
  generateAgencySlug: vi.fn().mockReturnValue('test-agency-agy00001'),
}));

vi.mock('@/events', () => ({ eventBus: { emit: vi.fn() } }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const mockAgency = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  agencyCode: 'AGY00001',
  slug: 'test-agency-agy00001',
  name: 'Test Agency',
  email: 'test@agency.com',
  profileCompletion: 0,
  computeProfileCompletion: () => 45,
  save: vi.fn().mockResolvedValue(undefined),
  toDTO: () => ({ id: '507f1f77bcf86cd799439011', name: 'Test Agency' }),
  toListItem: () => ({ id: '507f1f77bcf86cd799439011', name: 'Test Agency' }),
};

const validInput = {
  name: 'Test Agency',
  ownerName: 'John Doe',
  email: 'test@agency.com',
  phone: '+919876543210',
  address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  services: [],
  destinations: [],
  tags: [],
};

describe('AgencyService.create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an agency when email is unique', async () => {
    vi.mocked(agencyRepository.emailExists).mockResolvedValue(false);
    vi.mocked(agencyRepository.create).mockResolvedValue(mockAgency as never);

    const result = await agencyService.create(validInput);
    expect(agencyRepository.emailExists).toHaveBeenCalledWith(validInput.email);
    expect(agencyRepository.create).toHaveBeenCalledOnce();
    expect(result).toBeDefined();
  });

  it('throws ConflictError when email is taken', async () => {
    vi.mocked(agencyRepository.emailExists).mockResolvedValue(true);
    await expect(agencyService.create(validInput)).rejects.toThrow(ConflictError);
  });
});

describe('AgencyService.getById', () => {
  it('returns agency DTO when found', async () => {
    vi.mocked(agencyRepository.findById).mockResolvedValue(mockAgency as never);
    const result = await agencyService.getById('507f1f77bcf86cd799439011');
    expect(result).toBeDefined();
  });

  it('throws NotFoundError when agency not found', async () => {
    vi.mocked(agencyRepository.findById).mockResolvedValue(null);
    await expect(agencyService.getById('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundError);
  });
});

describe('AgencyService.delete', () => {
  it('soft deletes successfully', async () => {
    vi.mocked(agencyRepository.softDelete).mockResolvedValue(true);
    await expect(agencyService.delete('507f1f77bcf86cd799439011')).resolves.toBeUndefined();
  });

  it('throws NotFoundError when agency not found', async () => {
    vi.mocked(agencyRepository.softDelete).mockResolvedValue(false);
    await expect(agencyService.delete('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundError);
  });
});

describe('AgencyService.bulkOperation', () => {
  it('bulk archives agencies', async () => {
    vi.mocked(agencyRepository.bulkUpdateStatus).mockResolvedValue(3);
    const result = await agencyService.bulkOperation(['id1', 'id2', 'id3'], 'archive');
    expect(result.processed).toBe(3);
    expect(result.failed).toBe(0);
  });

  it('bulk deletes agencies', async () => {
    vi.mocked(agencyRepository.bulkSoftDelete).mockResolvedValue(2);
    const result = await agencyService.bulkOperation(['id1', 'id2'], 'delete');
    expect(result.processed).toBe(2);
  });
});
