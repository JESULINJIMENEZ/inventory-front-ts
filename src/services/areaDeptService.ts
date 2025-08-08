import { api } from './api';
import { AreaDept, AreaDeptWithUsers, AreaDeptWithDevices } from '../types';

interface CreateAreaDeptData {
  cost_center: string;
  name: string;
}

interface UpdateAreaDeptData {
  cost_center: string;
  name: string;
}

interface GetAreasParams {
  name?: string;
  cost_center?: string;
}

export const areaDeptService = {
  // Ver todos los centros de costo (activos e inactivos)
  async getAreas(params?: GetAreasParams): Promise<{
    areaDepts: AreaDept[];
    filter: string;
  }> {
    const response = await api.get('/admin/cost-center', { params });
    // Si la respuesta es directamente un array, la envolvemos en el formato esperado
    if (Array.isArray(response.data)) {
      return {
        areaDepts: response.data,
        filter: 'all'
      };
    }
    return response.data;
  },

  // Ver solo centros de costo activos
  async getActiveAreas(params?: GetAreasParams): Promise<{
    areaDepts: AreaDept[];
    filter: string;
  }> {
    const response = await api.get('/admin/cost-center/active', { params });
    // Si la respuesta es directamente un array, la envolvemos en el formato esperado
    if (Array.isArray(response.data)) {
      return {
        areaDepts: response.data,
        filter: 'active'
      };
    }
    return response.data;
  },

  async getArea(id: number): Promise<AreaDept> {
    const response = await api.get(`/admin/cost-center/${id}`);
    return response.data;
  },

  async getAreaWithUsers(id: number, params?: { 
    limit?: number; 
    page?: number; 
    search?: string; 
  }): Promise<AreaDeptWithUsers> {
    const response = await api.get(`/admin/cost-center/${id}`, { params });
    return response.data;
  },

  async createArea(data: CreateAreaDeptData): Promise<AreaDept> {
    const response = await api.post('/admin/cost-center', data);
    return response.data;
  },

  async updateArea(id: number, data: UpdateAreaDeptData): Promise<AreaDept> {
    const response = await api.put(`/admin/cost-center/${id}`, data);
    return response.data;
  },

  async getAreaWithDevices(id: number, params?: { 
    limit?: number; 
    page?: number; 
    search?: string; 
  }): Promise<AreaDeptWithDevices> {
    const response = await api.get(`/admin/cost-center/${id}`, { params });
    return response.data;
  },

  // Desactivar centro de costo (no eliminar)
  async deactivateArea(id: number): Promise<{
    message: string;
    action: string;
    areaDeptId: number;
    areaDeptName: string;
    hasActiveUsers?: boolean;
  }> {
    const response = await api.delete(`/admin/cost-center/${id}`);
    return response.data;
  },

  // Carga masiva desde CSV
  async bulkUpload(file: File): Promise<{
    message: string;
    summary: {
      total_processed: number;
      successful: number;
      errors: number;
    };
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await api.post('/admin/cost-center/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
