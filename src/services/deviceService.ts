import { api } from './api';
import { Device, PaginatedResponse, DeviceWithUser, DeviceTypeRequiredFields } from '../types';

export const deviceService = {
  getDevices: async (params?: {
    page?: number;
    limit?: number;
    status?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Device>> => {
    const response = await api.get('/admin/devices', { params });
    
    // Si no hay paginación (showing_all: true), usar los valores apropiados
    if (response.data.showing_all) {
      return {
        data: response.data.devices,
        total: response.data.total,
        currentPage: 1,
        totalPages: 1,
      };
    }
    
    // Si hay paginación, usar la estructura tradicional
    return {
      data: response.data.devices,
      total: response.data.pagination?.total || response.data.total,
      currentPage: response.data.pagination?.page || 1,
      totalPages: response.data.pagination?.totalPages || 1,
    };
  },

  getDeviceById: async (id: number): Promise<Device> => {
    const response = await api.get(`/admin/devices/${id}`);
    return response.data;
  },

  getDeviceWithUser: async (id: number): Promise<{ device: DeviceWithUser }> => {
    const response = await api.get(`/admin/devices/${id}/with-user`);
    return response.data;
  },

  getDeviceTypeRequiredFields: async (typeDeviceId: number): Promise<DeviceTypeRequiredFields> => {
    const response = await api.get(`/admin/devices/type-devices/${typeDeviceId}/required-fields`);
    return response.data;
  },

  createDevice: async (deviceData: Omit<Device, 'id'>): Promise<Device> => {
    const response = await api.post('/admin/devices', deviceData);
    return response.data;
  },

  updateDevice: async (id: number, deviceData: Partial<Device>): Promise<Device> => {
    const response = await api.put(`/admin/devices/${id}`, deviceData);
    return response.data;
  },

  deleteDevice: async (id: number): Promise<void> => {
    await api.delete(`/admin/devices/${id}`);
  },
};