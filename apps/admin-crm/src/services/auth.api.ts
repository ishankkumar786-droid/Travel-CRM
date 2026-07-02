import type { UserDTO } from '@travel/types';

import { apiClient } from '@/lib/api-client';

interface LoginResponse {
  user: UserDTO;
  accessToken: string;
  expiresIn: number;
  deviceId: string;
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Auth API — thin wrappers around the API endpoints.
 * All state management lives in AuthContext.
 */
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },

  async refresh(): Promise<RefreshResponse> {
    const { data } = await apiClient.post<ApiEnvelope<RefreshResponse>>('/auth/refresh');
    return data.data;
  },

  async getMe(): Promise<UserDTO> {
    const { data } = await apiClient.get<ApiEnvelope<{ user: UserDTO }>>('/auth/me');
    return data.data.user;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    await apiClient.put('/auth/change-password', { currentPassword, newPassword, confirmPassword });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword, confirmPassword });
  },
};
