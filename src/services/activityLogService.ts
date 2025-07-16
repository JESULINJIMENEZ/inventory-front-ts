import { api } from './api';
import { ActivityLog, PaginatedResponse } from '../types';

export const activityLogService = {
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    entity?: string;
    action?: string;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await api.get('/admin/activity-logs', { params });
    return {
      data: response.data.logs,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },

  getLogsByEntity: async (entity: string, entityId: number): Promise<ActivityLog[]> => {
    const response = await api.get(`/admin/activity-logs/entity/${entity}/${entityId}`);
    return response.data;
  },
};