import api from './api';
import type {
  EmailSender,
  CreateEmailRequest,
  UpdateEmailRequest,
  SendTestEmailRequest,
  ApiResponse,
} from '../types';

export const emailService = {
  async getAllEmails(): Promise<{ emails: EmailSender[] }> {
    const response = await api.get<ApiResponse & { emails: EmailSender[] }>('/admin/emails');
    return { emails: response.data.emails };
  },

  async getEmailById(id: number): Promise<{ email: EmailSender }> {
    const response = await api.get<ApiResponse & { email: EmailSender }>(`/admin/emails/${id}`);
    return { email: response.data.email };
  },

  async createEmail(data: CreateEmailRequest): Promise<{ email: EmailSender }> {
    const response = await api.post<ApiResponse & { email: EmailSender }>('/admin/emails', data);
    return { email: response.data.email };
  },

  async updateEmail(id: number, data: UpdateEmailRequest): Promise<{ email: EmailSender }> {
    const response = await api.put<ApiResponse & { email: EmailSender }>(`/admin/emails/${id}`, data);
    return { email: response.data.email };
  },

  async deleteEmail(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/admin/emails/${id}`);
  },

  async sendTestEmail(data: SendTestEmailRequest): Promise<{ messageId: string }> {
    const response = await api.post<ApiResponse & { messageId: string }>('/admin/emails/test', data);
    return { messageId: response.data.messageId };
  },
};

