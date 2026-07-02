import { AuditLog } from '@/models/audit-log.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { AuditLogFilter } from '@travel/types';

class AuditService {
  async list(filter: AuditLogFilter) {
    const q: Record<string, unknown> = {};
    if (filter.resource) q['resource'] = filter.resource;
    if (filter.resourceId) q['resourceId'] = filter.resourceId;
    if (filter.action) q['action'] = filter.action;
    if (filter.who) q['who'] = filter.who;
    if (filter.dateFrom || filter.dateTo) {
      q['createdAt'] = {
        ...(filter.dateFrom && { $gte: new Date(filter.dateFrom) }),
        ...(filter.dateTo && { $lte: new Date(filter.dateTo) }),
      };
    }

    const [items, total] = await Promise.all([
      AuditLog.find(q)
        .sort({ createdAt: -1 })
        .skip(getSkip(filter.page, filter.limit))
        .limit(filter.limit)
        .exec(),
      AuditLog.countDocuments(q).exec(),
    ]);

    return {
      items: items.map((a) => a.toDTO()),
      pagination: buildPaginationMeta(filter.page, filter.limit, total),
    };
  }
}

export const auditService = new AuditService();
