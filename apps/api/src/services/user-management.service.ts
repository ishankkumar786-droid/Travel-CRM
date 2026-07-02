import { ConflictError, NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { User } from '@/models/user.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { UserManagementDTO } from '@travel/types';
import type { InviteUserInput } from '@travel/validation';

class UserManagementService {
  async list(opts: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const filter: Record<string, unknown> = {};
    if (opts.search) {
      const rx = new RegExp(opts.search, 'i');
      filter['$or'] = [{ firstName: rx }, { lastName: rx }, { email: rx }];
    }
    if (opts.role) filter['role'] = opts.role;
    if (opts.status) filter['status'] = opts.status;

    const [items, total] = await Promise.all([
      User.find(filter)
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .sort({ createdAt: -1 })
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((u) => this.toDTO(u)),
      pagination: buildPaginationMeta(opts.page, opts.limit, total),
    };
  }

  async getById(id: string): Promise<UserManagementDTO> {
    const user = await User.findById(id).exec();
    if (!user) throw new NotFoundError('User');
    return this.toDTO(user);
  }

  async invite(input: InviteUserInput, invitedBy?: string): Promise<UserManagementDTO> {
    const exists = await User.findOne({ email: input.email.toLowerCase() }).exec();
    if (exists) throw new ConflictError('Email already registered');

    const tempPassword = `Temp@${Math.random().toString(36).slice(2, 10)}`;
    const user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      password: tempPassword,
      role: input.role,
      status: 'pending',
      emailVerified: false,
    });

    if (invitedBy) {
      await logAudit({
        resource: 'User',
        resourceId: user._id.toString(),
        action: 'create',
        who: invitedBy,
      });
    }

    logger.info('user-management: invited', { email: input.email, role: input.role });
    return this.toDTO(user);
  }

  async updateRole(id: string, role: string, updatedBy: string): Promise<UserManagementDTO> {
    const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).exec();
    if (!user) throw new NotFoundError('User');
    await logAudit({
      resource: 'User',
      resourceId: id,
      action: 'update',
      who: updatedBy,
      after: { role },
    });
    return this.toDTO(user);
  }

  async updateStatus(id: string, status: string, updatedBy: string): Promise<UserManagementDTO> {
    const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
    if (!user) throw new NotFoundError('User');
    await logAudit({
      resource: 'User',
      resourceId: id,
      action: 'status_change',
      who: updatedBy,
      after: { status },
    });
    return this.toDTO(user);
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const result = await User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
    if (!result) throw new NotFoundError('User');
    await logAudit({ resource: 'User', resourceId: id, action: 'delete', who: deletedBy });
  }

  private toDTO(user: InstanceType<typeof User>): UserManagementDTO {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin?.toISOString(),
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export const userManagementService = new UserManagementService();
