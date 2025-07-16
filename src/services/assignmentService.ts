import { api } from './api';
import { Assignment, PaginatedResponse } from '../types';

export const assignmentService = {
  getAssignments: async (params?: {
    page?: number;
    limit?: number;
    status?: boolean;
    user_id?: number;
    device_id?: number;
  }): Promise<PaginatedResponse<Assignment>> => {
    const response = await api.get('/admin/assignments', { params });
    return {
      data: response.data.assignments,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },

  getAssignmentById: async (id: number): Promise<Assignment> => {
    const response = await api.get(`/admin/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (assignmentData: {
    user_id: number;
    device_id: number;
    notes?: string;
  }): Promise<Assignment> => {
    const response = await api.post('/admin/assignments', assignmentData);
    return response.data.assignment;
  },

  updateAssignment: async (id: number, assignmentData: {
    notes?: string;
  }): Promise<Assignment> => {
    const response = await api.put(`/admin/assignments/${id}`, assignmentData);
    return response.data;
  },

  returnDevice: async (id: number, notes?: string): Promise<Assignment> => {
    const response = await api.post(`/admin/assignments/${id}/return`, { notes });
    return response.data;
  },

  transferDevice: async (id: number, data: {
    new_user_id: number;
    notes?: string;
  }): Promise<Assignment> => {
    const response = await api.post(`/admin/assignments/${id}/transfer`, data);
    return response.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await api.delete(`/admin/assignments/${id}`);
  },

  getDeviceHistory: async (deviceId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Assignment>> => {
    const response = await api.get(`/admin/assignments/device/${deviceId}/history`, { params });
    return {
      data: response.data.assignments,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },

  getUserHistory: async (userId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Assignment>> => {
    const response = await api.get(`/admin/assignments/user/${userId}/history`, { params });
    return {
      data: response.data.assignments,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },
};