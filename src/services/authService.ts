import api from './api';
import type { LoginRequest, LoginResponse, User, UpdateUserRequest, ApiResponse, PasswordResetRequest, PasswordResetRequestResponse, PasswordResetVerifyRequest, PasswordResetVerifyResponse } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse & LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: UpdateUserRequest): Promise<{ user: User }> {
    const response = await api.put<ApiResponse & { user: User }>('/auth/profile', data);
    return response.data;
  },

  async updatePassword(password: string): Promise<void> {
    await api.put<ApiResponse>('/auth/profile/password', { password });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setStoredAuth(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetRequestResponse> {
    const response = await api.post<ApiResponse & PasswordResetRequestResponse>('/auth/password-reset/request', data);
    return {
      message: response.data.message
    };
  },

  async verifyPasswordReset(data: PasswordResetVerifyRequest): Promise<PasswordResetVerifyResponse> {
    const response = await api.post<ApiResponse & PasswordResetVerifyResponse>('/auth/password-reset/verify', data);
    return {
      message: response.data.message
    };
  }
};
