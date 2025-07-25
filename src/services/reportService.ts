import { api } from './api';
import { DashboardData } from '../types';

export const reportService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/admin/reports/dashboard');
    return response.data;
  },

  getAssignmentReport: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: boolean;
  }) => {
    const response = await api.get('/admin/reports/assignments/report', { params });
    return response.data;
  },

  getDeviceUtilization: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/admin/reports/devices/utilization', { params });
    return response.data;
  },

  getUserActivity: async (params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
  }) => {
    const response = await api.get('/admin/reports/users/activity', { params });
    return response.data;
  },
};