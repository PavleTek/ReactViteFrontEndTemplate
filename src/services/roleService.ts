import api from './api';
import type { Role, ApiResponse } from '../types';

export const roleService = {
  async getAllRoles(): Promise<{ roles: Role[] }> {
    const response = await api.get<ApiResponse & { roles: Role[] }>('/admin/roles');
    return { roles: response.data.roles };
  },

  async createRole(name: string): Promise<{ role: Role }> {
    const response = await api.post<ApiResponse & { role: Role }>('/admin/roles', { name });
    return { role: response.data.role };
  },

  async updateRole(id: number, name: string): Promise<{ role: Role }> {
    const response = await api.put<ApiResponse & { role: Role }>(`/admin/roles/${id}`, { name });
    return { role: response.data.role };
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/admin/roles/${id}`);
  },
};

