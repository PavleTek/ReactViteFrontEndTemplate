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
    // Use FormData if attachments are present
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      formData.append('fromEmail', data.fromEmail);
      formData.append('toEmails', JSON.stringify(data.toEmails));
      if (data.ccEmails && data.ccEmails.length > 0) {
        formData.append('ccEmails', JSON.stringify(data.ccEmails));
      }
      if (data.bccEmails && data.bccEmails.length > 0) {
        formData.append('bccEmails', JSON.stringify(data.bccEmails));
      }
      formData.append('subject', data.subject);
      formData.append('content', data.content);
      
      // Append each attachment file
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await api.post<ApiResponse & { messageId: string }>(
        '/admin/emails/test',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { messageId: response.data.messageId };
    } else {
      // Use regular JSON if no attachments
      const response = await api.post<ApiResponse & { messageId: string }>('/admin/emails/test', {
        fromEmail: data.fromEmail,
        toEmails: data.toEmails,
        ccEmails: data.ccEmails,
        bccEmails: data.bccEmails,
        subject: data.subject,
        content: data.content,
      });
      return { messageId: response.data.messageId };
    }
  },
};

