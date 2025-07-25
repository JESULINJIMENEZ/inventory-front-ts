import { api } from './api';
import { User, PaginatedResponse, CreateUserRequest, UpdateUserRequest, AreaDept } from '../types';

export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<{
    data: User[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const response = await api.get('/admin/users', { params });
    
    // Adaptar la respuesta del backend a la estructura esperada por el frontend
    return {
      data: response.data.users,
      total: response.data.pagination.total,
      currentPage: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages
    };
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async getUserWithAssignments(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post('/admin/users', data);
    return response.data.user;
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async getAvailableAreas(search?: string): Promise<{
    areas: AreaDept[];
    total: number;
  }> {
    const params = search ? { search } : {};
    const response = await api.get('/admin/users/areas/list', { params });
    return {
      areas: response.data.areas,
      total: response.data.total
    };
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