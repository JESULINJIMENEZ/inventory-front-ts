import { api } from './api';

export interface TypeDevice {
  id: number;
  name: string;
}

export interface Device {
  id: number;
  name: string;
  type_device_id: number;
  description?: string;
  brand: string;
  model: string;
  serial_number: string;
  status: boolean;
  plate_device?: string;
  storage?: string;
  ram?: string;
  processor?: string;
  dvr_storage?: string;
  purchase_date?: string;
  warranty_duration?: number;
  warranty_unit?: 'years' | 'months';
  createdAt: string;
  updatedAt: string;
  TypeDevice: TypeDevice;
}

export interface CreateDeviceData {
  name: string;
  type_device_id: number;
  description?: string;
  brand: string;
  model: string;
  serial_number: string;
  plate_device?: string;
  storage?: string;
  ram?: string;
  processor?: string;
  dvr_storage?: string;
  purchase_date?: string;
  warranty_duration?: number;
  warranty_unit?: 'years' | 'months';
}

export interface DevicesResponse {
  devices: Device[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search: string | null;
  excluded: {
    assigned_devices: number;
    retired_devices: number;
    total_excluded: number;
  };
}

export interface ApiDevicesResponse {
  message: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  devices: Device[];
}

export const deviceService = {
  getDevices: async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      // Asegurar que page y limit sean números válidos
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limitNum.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/admin/devices?${params.toString()}`);
      console.log('Raw API response:', response.data);
      
      // Verificar la estructura de la respuesta
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response structure:', response.data);
        return [];
      }
      
      // Asegurar que siempre devolvemos un array válido
      const devices = response.data.devices;
      if (!Array.isArray(devices)) {
        console.error('Expected devices to be an array, got:', typeof devices, devices);
        return [];
      }
      
      console.log(`Returning ${devices.length} devices`);
      return devices;
    } catch (error) {
      console.error('Error in getDevices:', error);
      return [];
    }
  },

  // Método que devuelve la respuesta completa con paginación
  getDevicesWithPagination: async (page: number = 1, limit: number = 10, search?: string): Promise<DevicesResponse> => {
    try {
      // Asegurar que page y limit sean números válidos
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limitNum.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/admin/devices?${params.toString()}`);
      console.log('API Response:', response.data);
      
      // Adaptarse a la estructura de respuesta de tu API
      const data: ApiDevicesResponse = response.data;
      
      // Validar que tenemos la estructura esperada
      if (!data.pagination || !Array.isArray(data.devices)) {
        console.error('Invalid API response structure:', data);
        throw new Error('Estructura de respuesta inválida de la API');
      }
      
      return {
        devices: data.devices,
        pagination: {
          total: data.pagination.totalItems,
          page: data.pagination.currentPage,
          limit: data.pagination.itemsPerPage,
          totalPages: data.pagination.totalPages
        },
        search: search || null,
        excluded: { assigned_devices: 0, retired_devices: 0, total_excluded: 0 }
      };
    } catch (error) {
      console.error('Error in getDevicesWithPagination:', error);
      // Retornar estructura por defecto en caso de error
      return {
        devices: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        search: null,
        excluded: { assigned_devices: 0, retired_devices: 0, total_excluded: 0 }
      };
    }
  },

  getDevice: async (id: number): Promise<Device> => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo inválido');
    }
    const response = await api.get(`/admin/devices/${deviceId}`);
    return response.data;
  },

  getDeviceWithUser: async (id: number) => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo inválido');
    }
    const response = await api.get(`/admin/devices/${deviceId}/with-user`);
    return response.data;
  },

  createDevice: async (deviceData: CreateDeviceData): Promise<Device> => {
    const response = await api.post('/admin/devices', deviceData);
    return response.data.device || response.data;
  },

  updateDevice: async (id: number, deviceData: Partial<CreateDeviceData>): Promise<Device> => {
    const response = await api.put(`/admin/devices/${id}`, deviceData);
    return response.data.device || response.data;
  },

  deleteDevice: async (id: number) => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo inválido');
    }
    const response = await api.delete(`/admin/devices/${deviceId}`);
    return response.data;
  },

  retireDevice: async (id: number, reason: string, notes?: string, status?: 'retired' | 'disposed') => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo inválido');
    }
    const response = await api.post(`/admin/devices/retire/${deviceId}`, {
      reason,
      notes,
      status
    });
    return response.data;
  },

  getRetiredDevices: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    // Asegurar que page y limit sean números válidos
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    
    const params = new URLSearchParams({
      page: pageNum.toString(),
      limit: limitNum.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    if (status && ['retired', 'disposed'].includes(status)) {
      params.append('status', status);
    }
    
    const response = await api.get(`/admin/devices/retired?${params.toString()}`);
    return response.data;
  },

  getRetiredDevice: async (id: number) => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo retirado inválido');
    }
    const response = await api.get(`/admin/devices/retired/${deviceId}`);
    return response.data;
  },

  updateRetiredDevice: async (id: number, data: { status?: 'retired' | 'disposed'; notes?: string }) => {
    const deviceId = Number(id);
    if (!deviceId || deviceId <= 0) {
      throw new Error('ID de dispositivo retirado inválido');
    }
    const response = await api.patch(`/admin/devices/retired/${deviceId}`, data);
    return response.data;
  },

  // Carga masiva de dispositivos
  bulkUpload: async (csvFile: File): Promise<{
    message: string;
    summary: {
      total_rows: number;
      successful: number;
      failed: number;
    };
    errors?: string[];
  }> => {
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    const response = await api.post('/admin/devices/template/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Descargar plantilla CSV
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/admin/devices/template/download', {
      responseType: 'blob',
    });
    
    return response.data;
  },
};