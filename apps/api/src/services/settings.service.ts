import { getOrCreateSettings } from '@/models/settings.model';

import type { SystemSettings } from '@travel/types';
import type { SystemSettingsInput } from '@travel/validation';

class SettingsService {
  async get(): Promise<SystemSettings> {
    const s = await getOrCreateSettings();
    return {
      general: s.general,
      verification: s.verification,
      import: s.import,
      notifications: s.notifications,
    };
  }

  async update(input: SystemSettingsInput, userId?: string): Promise<SystemSettings> {
    const s = await getOrCreateSettings();
    if (input.general) Object.assign(s.general, input.general);
    if (input.verification) Object.assign(s.verification, input.verification);
    if (input.import) Object.assign(s.import, input.import);
    if (userId) s.updatedBy = userId as never;
    await s.save();
    return {
      general: s.general,
      verification: s.verification,
      import: s.import,
      notifications: s.notifications,
    };
  }
}

export const settingsService = new SettingsService();
