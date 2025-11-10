import api from './api';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types';

export const userService = {
  async getAllUsers(): Promise<{ users: User[] }> {
    const response = await api.get<ApiResponse & { users: User[] }>('/admin/users');
    return { users: response.data.users };
  },

  async getUserById(id: number): Promise<{ user: User }> {
    const response = await api.get<ApiResponse & { user: User }>(`/admin/users/${id}`);
    return { user: response.data.user };
  },

  async createUser(data: CreateUserRequest): Promise<{ user: User }> {
    const response = await api.post<ApiResponse & { user: User }>('/admin/users', data);
    return { user: response.data.user };
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<{ user: User }> {
    const response = await api.put<ApiResponse & { user: User }>(`/admin/users/${id}`, data);
    return { user: response.data.user };
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/admin/users/${id}`);
  },

  async changeUserPassword(id: number, password: string): Promise<void> {
    await api.put<ApiResponse>(`/admin/users/${id}/password`, { password });
  },

  async changeUserRoles(id: number, roleIds: number[]): Promise<{ user: User }> {
    const response = await api.put<ApiResponse & { user: User }>(`/admin/users/${id}/roles`, { roleIds });
    return { user: response.data.user };
  },

  async forceResetUser2FA(id: number): Promise<void> {
    await api.post<ApiResponse>(`/admin/users/${id}/reset-2fa`);
  },
};

