import { api } from './api';
import { User, PaginatedResponse } from '../types';

export const userService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return {
      data: response.data.users || response.data,
      total: response.data.pagination?.total || response.data.total,
      currentPage: response.data.pagination?.page || response.data.currentPage,
      totalPages: response.data.pagination?.totalPages || response.data.totalPages,
    };
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Descargar plantilla para carga masiva
  downloadBulkUploadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/admin/users/bulk-upload/template', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Carga masiva de usuarios
  bulkUpload: async (file: File): Promise<{
    message: string;
    successCount: number;
    errorCount: number;
    errors?: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/users/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};