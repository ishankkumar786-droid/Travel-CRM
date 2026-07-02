import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '@/lib/response';
import { agencyService } from '@/services/agency.service';

import type {
  AgencyListQueryInput,
  BulkOperationInput,
  CreateAgencyInput,
  UpdateAgencyInput,
} from '@travel/validation';
import type { Request, Response } from 'express';

export class AgencyController {
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateAgencyInput;
    const agency = await agencyService.create(input, req.user?.id);
    sendCreated(res, agency, 'Agency created successfully');
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as AgencyListQueryInput;
    const { items, pagination } = await agencyService.list(query);
    sendPaginated(res, items, pagination, 'Agencies retrieved');
  }

  async getById(req: Request, res: Response): Promise<void> {
    const agency = await agencyService.getById(req.params['id'] as string);
    sendSuccess(res, agency, 'Agency retrieved');
  }

  async update(req: Request, res: Response): Promise<void> {
    const input = req.body as UpdateAgencyInput;
    const agency = await agencyService.update(req.params['id'] as string, input, req.user?.id);
    sendSuccess(res, agency, 'Agency updated successfully');
  }

  async delete(req: Request, res: Response): Promise<void> {
    await agencyService.delete(req.params['id'] as string);
    sendNoContent(res);
  }

  async archive(req: Request, res: Response): Promise<void> {
    const agency = await agencyService.archive(req.params['id'] as string);
    sendSuccess(res, agency, 'Agency archived');
  }

  async restore(req: Request, res: Response): Promise<void> {
    const agency = await agencyService.restore(req.params['id'] as string);
    sendSuccess(res, agency, 'Agency restored');
  }

  async bulk(req: Request, res: Response): Promise<void> {
    const { ids, action, value } = req.body as BulkOperationInput;
    const result = await agencyService.bulkOperation(ids, action, value);
    sendSuccess(res, result, `Bulk ${action} completed`);
  }

  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await agencyService.getStats();
    sendSuccess(res, stats, 'Agency statistics');
  }

  async exportCsv(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as AgencyListQueryInput;
    const csv = await agencyService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="agencies.csv"');
    res.status(200).send(csv);
  }

  async exportJson(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as AgencyListQueryInput;
    const data = await agencyService.exportJson(query);
    sendSuccess(res, data, 'Export complete');
  }
}

export const agencyController = new AgencyController();
