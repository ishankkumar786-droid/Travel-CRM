import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '@/lib/response';
import { catalogService } from '@/services/catalog.service';
import { destinationService } from '@/services/destination.service';
import { marketplaceProfileService } from '@/services/marketplace-profile.service';
import { onboardingService } from '@/services/onboarding.service';
import { packageService } from '@/services/package.service';
import { publicApiService } from '@/services/public-api.service';

import type {
  CreateCatalogItemInput,
  CreateDestinationInput,
  CreatePackageInput,
  UpdateMarketplaceProfileInput,
  UpdateOnboardingStageInput,
  UpdatePackageInput,
} from '@travel/validation';
import type { Request, Response } from 'express';

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingController = {
  async get(req: Request, res: Response): Promise<void> {
    const result = await onboardingService.getOrCreate(req.params['agencyId'] as string);
    sendSuccess(res, result, 'Onboarding retrieved');
  },
  async updateStage(req: Request, res: Response): Promise<void> {
    const { stage, remarks, assignedReviewer } = req.body as UpdateOnboardingStageInput;
    const result = await onboardingService.updateStage(
      req.params['agencyId'] as string,
      stage,
      req.user?.id ?? '',
      remarks,
      assignedReviewer,
    );
    sendSuccess(res, result, 'Onboarding stage updated');
  },
  async list(req: Request, res: Response): Promise<void> {
    const {
      stage,
      assignedReviewer,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string | undefined>;
    const result = await onboardingService.list({
      ...(stage && { stage }),
      ...(assignedReviewer && { assignedReviewer }),
      page: Number(page),
      limit: Number(limit),
    });
    sendSuccess(res, result, 'Onboarding list');
  },
};

// ─── Marketplace Profile ──────────────────────────────────────────────────────
export const marketplaceProfileController = {
  async get(req: Request, res: Response): Promise<void> {
    const result = await marketplaceProfileService.getOrCreate(req.params['agencyId'] as string);
    sendSuccess(res, result, 'Marketplace profile');
  },
  async update(req: Request, res: Response): Promise<void> {
    const result = await marketplaceProfileService.update(
      req.params['agencyId'] as string,
      req.body as UpdateMarketplaceProfileInput,
    );
    sendSuccess(res, result, 'Profile updated');
  },
  async getReadiness(req: Request, res: Response): Promise<void> {
    const result = await marketplaceProfileService.getReadiness(req.params['agencyId'] as string);
    sendSuccess(res, result, 'Readiness score');
  },
};

// ─── Packages ─────────────────────────────────────────────────────────────────
export const packageController = {
  async create(req: Request, res: Response): Promise<void> {
    const pkg = await packageService.create(
      req.params['agencyId'] as string,
      req.body as CreatePackageInput,
      req.user?.id,
    );
    sendCreated(res, pkg, 'Package created');
  },
  async list(req: Request, res: Response): Promise<void> {
    const { page = '1', limit = '20', status } = req.query as Record<string, string | undefined>;
    const result = await packageService.listByAgency(req.params['agencyId'] as string, {
      page: Number(page),
      limit: Number(limit),
      ...(status && { status }),
    });
    sendPaginated(res, result.items, result.pagination, 'Packages');
  },
  async getById(req: Request, res: Response): Promise<void> {
    const pkg = await packageService.getById(req.params['id'] as string);
    sendSuccess(res, pkg, 'Package retrieved');
  },
  async update(req: Request, res: Response): Promise<void> {
    const pkg = await packageService.update(
      req.params['id'] as string,
      req.body as UpdatePackageInput,
      req.user?.id,
    );
    sendSuccess(res, pkg, 'Package updated');
  },
  async delete(req: Request, res: Response): Promise<void> {
    await packageService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  },
};

// ─── Destinations ─────────────────────────────────────────────────────────────
export const destinationController = {
  async create(req: Request, res: Response): Promise<void> {
    const dest = await destinationService.create(req.body as CreateDestinationInput);
    sendCreated(res, dest, 'Destination created');
  },
  async list(req: Request, res: Response): Promise<void> {
    const { type, parentId, popular, featured } = req.query as Record<string, string | undefined>;
    const items = await destinationService.list({
      ...(type && { type }),
      ...(parentId && { parentId }),
      popular: popular === 'true',
      featured: featured === 'true',
    });
    sendSuccess(res, items, 'Destinations');
  },
  async getBySlug(req: Request, res: Response): Promise<void> {
    const dest = await destinationService.getBySlug(req.params['slug'] as string);
    sendSuccess(res, dest, 'Destination');
  },
  async delete(req: Request, res: Response): Promise<void> {
    await destinationService.delete(req.params['id'] as string);
    sendNoContent(res);
  },
};

// ─── Catalog ──────────────────────────────────────────────────────────────────
export const catalogController = {
  async create(req: Request, res: Response): Promise<void> {
    const item = await catalogService.create(req.body as CreateCatalogItemInput);
    sendCreated(res, item, 'Catalog item created');
  },
  async list(req: Request, res: Response): Promise<void> {
    const { type } = req.query as { type?: string };
    const items = await catalogService.list(type);
    sendSuccess(res, items, 'Catalog items');
  },
  async getAll(_req: Request, res: Response): Promise<void> {
    const grouped = await catalogService.getAll();
    sendSuccess(res, grouped, 'Full catalog');
  },
  async delete(req: Request, res: Response): Promise<void> {
    await catalogService.delete(req.params['id'] as string);
    sendNoContent(res);
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const publicApiController = {
  async listAgencies(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      q,
      destination,
      verified,
      featured,
    } = req.query as Record<string, string | undefined>;
    const result = await publicApiService.listPublicAgencies({
      page: Number(page),
      limit: Number(limit),
      ...(q && { q }),
      ...(destination && { destination }),
      verified: verified === 'true',
      featured: featured === 'true',
    });
    sendPaginated(res, result.items, result.pagination, 'Public agencies');
  },
  async listPackages(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, string | undefined>;
    const result = await publicApiService.listPublicPackages({
      page: Number(q['page'] ?? 1),
      limit: Number(q['limit'] ?? 20),
      ...(q['destination'] && { destination: q['destination'] }),
      ...(q['category'] && { category: q['category'] }),
      ...(q['minBudget'] && { minBudget: Number(q['minBudget']) }),
      ...(q['maxBudget'] && { maxBudget: Number(q['maxBudget']) }),
      ...(q['sortBy'] && { sortBy: q['sortBy'] }),
      featured: q['featured'] === 'true',
    });
    sendPaginated(res, result.items as never[], result.pagination, 'Public packages');
  },
  async listDestinations(req: Request, res: Response): Promise<void> {
    const { type, featured } = req.query as Record<string, string | undefined>;
    const items = await publicApiService.listPublicDestinations(type, featured === 'true');
    sendSuccess(res, items, 'Public destinations');
  },
  async getAgencyProfile(req: Request, res: Response): Promise<void> {
    const profile = await publicApiService.getPublicAgencyProfile(req.params['slug'] as string);
    sendSuccess(res, profile, 'Agency profile');
  },
  async getRecommendations(_req: Request, res: Response): Promise<void> {
    const result = await publicApiService.getRecommendations();
    sendSuccess(res, result, 'Recommendations');
  },
};
