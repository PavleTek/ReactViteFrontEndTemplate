import api from './api';
import type { Configuration, ApiResponse } from '../types';

export const configService = {
  async getConfig(): Promise<{ config: Configuration }> {
    const response = await api.get<ApiResponse & { config: Configuration }>('/admin/config');
    return { config: response.data.config };
  },

  async updateConfig(data: { twoFactorEnabled?: boolean; appName?: string; recoveryEmailSenderId?: number | null }): Promise<{ config: Configuration }> {
    const response = await api.put<ApiResponse & { config: Configuration }>('/admin/config', data);
    return { config: response.data.config };
  }
};

