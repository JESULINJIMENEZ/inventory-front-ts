import { api } from './api';
import { ActivityLog, PaginatedResponse } from '../types';
import { transformApiResponse, transformPaginatedResponse } from '../utils/displayTransform';

export const activityLogService = {
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    entity?: string;
    action?: string;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await api.get('/admin/activity-logs', { params });
    const adaptedResponse = {
      data: response.data.logs,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
    return transformPaginatedResponse(adaptedResponse);
  },

  getLogsByEntity: async (entity: string, entityId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    entity: string;
    entity_id: string;
    logs: ActivityLog[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> => {
    const response = await api.get(`/admin/activity-logs/entity/${entity}/${entityId}`, { params });
    return transformApiResponse(response.data);
  },

  getLogsByUser: async (userId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await api.get('/admin/activity-logs', { 
      params: { ...params, user_id: userId }
    });
    const adaptedResponse = {
      data: response.data.logs,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
    return transformPaginatedResponse(adaptedResponse);
  },

  getLogsByEntityAndAction: async (entity: string, action: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await api.get('/admin/activity-logs', { 
      params: { ...params, entity, action }
    });
    const adaptedResponse = {
      data: response.data.logs,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
    return transformPaginatedResponse(adaptedResponse);
  },
};