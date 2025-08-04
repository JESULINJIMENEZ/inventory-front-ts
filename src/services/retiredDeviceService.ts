import { api } from './api';
import { RetiredDevice, RetireDeviceRequest, UpdateRetiredDeviceRequest, PaginatedResponse } from '../types';
import { transformApiResponse, transformPaginatedResponse } from '../utils/displayTransform';

export const retiredDeviceService = {
  // Dar de baja un dispositivo
  retireDevice: async (data: RetireDeviceRequest): Promise<{ message: string; retired_device: RetiredDevice }> => {
    const response = await api.post('/admin/retired-devices/retire', data);
    return transformApiResponse(response.data);
  },

  // Obtener dispositivos dados de baja
  getRetiredDevices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'retired' | 'disposed';
  }): Promise<{
    data: RetiredDevice[];
    total: number;
    currentPage: number;
    totalPages: number;
    search?: string;
    status_filter?: string;
    excluded?: {
      assigned_devices: number;
      retired_devices: number;
      total_excluded: number;
    };
  }> => {
    const response = await api.get('/admin/retired-devices', { params });
    const adaptedResponse = {
      data: response.data.retired_devices,
      total: response.data.pagination.total,
      currentPage: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages,
      search: response.data.search,
      status_filter: response.data.status_filter,
      excluded: response.data.excluded
    };
    return transformPaginatedResponse(adaptedResponse);
  },

  // Obtener un dispositivo dado de baja específico
  getRetiredDeviceById: async (id: number): Promise<RetiredDevice> => {
    const response = await api.get(`/admin/retired-devices/${id}`);
    return transformApiResponse(response.data);
  },

  // Actualizar dispositivo dado de baja
  updateRetiredDevice: async (id: number, data: UpdateRetiredDeviceRequest): Promise<{ message: string; retired_device: RetiredDevice }> => {
    const response = await api.patch(`/admin/retired-devices/${id}`, data);
    return transformApiResponse(response.data);
  },

  // Búsqueda específica de dispositivos dados de baja
  searchRetiredDevices: async (params?: {
    page?: number;
    limit?: number;
    brand?: string;
    model?: string;
    serial_number?: string;
    status?: 'retired' | 'disposed';
    date_from?: string;
    date_to?: string;
  }): Promise<{
    data: RetiredDevice[];
    total: number;
    currentPage: number;
    totalPages: number;
    search_criteria?: any;
  }> => {
    const response = await api.get('/admin/retired-devices/search', { params });
    const adaptedResponse = {
      data: response.data.retired_devices,
      total: response.data.pagination.total,
      currentPage: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages,
      search_criteria: response.data.search_criteria
    };
    return transformPaginatedResponse(adaptedResponse);
  },

  // Restaurar dispositivo
  restoreDevice: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/retired-devices/${id}/restore`);
    return transformApiResponse(response.data);
  }
};
