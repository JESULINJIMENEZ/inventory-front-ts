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
  async getAreas(params?: GetAreasParams): Promise<AreaDept[]> {
    const response = await api.get('/admin/cost-center', { params });
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

  async deleteArea(id: number): Promise<void> {
    await api.delete(`/admin/cost-center/${id}`);
  }
};
