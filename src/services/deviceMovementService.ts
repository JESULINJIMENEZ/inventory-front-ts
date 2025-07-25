import { api } from './api';
import { DeviceMovement, PaginatedResponse } from '../types';

export const deviceMovementService = {
  getDeviceMovements: async (params?: {
    page?: number;
    limit?: number;
    device_id?: number;
    user_id?: number;
    movement_type?: 'assigned' | 'returned' | 'transferred';
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<DeviceMovement>> => {
    const response = await api.get('/admin/device-movements', { params });
    return {
      data: response.data.movements,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },

  getMovementById: async (id: number): Promise<DeviceMovement> => {
    const response = await api.get(`/admin/device-movements/${id}`);
    return response.data;
  },

  getMovementsByDevice: async (deviceId: number): Promise<DeviceMovement[]> => {
    const response = await api.get(`/admin/device-movements/device/${deviceId}`);
    return response.data;
  },

  getMovementsByUser: async (userId: number): Promise<DeviceMovement[]> => {
    const response = await api.get(`/admin/device-movements/user/${userId}`);
    return response.data;
  },
};
