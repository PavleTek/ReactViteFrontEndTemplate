import api from './api';
import type {
  Domain,
  CreateDomainRequest,
  ApiResponse,
} from '../types';

export const domainService = {
  async getAllDomains(): Promise<{ domains: Domain[] }> {
    const response = await api.get<ApiResponse & { domains: Domain[] }>('/admin/domains');
    return { domains: response.data.domains };
  },

  async createDomain(data: CreateDomainRequest): Promise<{ domain: Domain }> {
    const response = await api.post<ApiResponse & { domain: Domain }>('/admin/domains', data);
    return { domain: response.data.domain };
  },

  async deleteDomain(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/admin/domains/${id}`);
  },
};

