import { api } from './api';
import { DeviceType } from '../types';

export const deviceTypeService = {
  getDeviceTypes: async (): Promise<DeviceType[]> => {
    const response = await api.get('/admin/devices/type-devices');
    return response.data;
  },

  createDeviceType: async (deviceTypeData: {
    name: string;
    description?: string;
  }): Promise<DeviceType> => {
    const response = await api.post('/admin/devices/type-devices', deviceTypeData);
    return response.data;
  },

  updateDeviceType: async (id: number, deviceTypeData: {
    name?: string;
    description?: string;
  }): Promise<DeviceType> => {
    const response = await api.put(`/admin/devices/type-devices/${id}`, deviceTypeData);
    return response.data;
  },

  deleteDeviceType: async (id: number): Promise<void> => {
    await api.delete(`/admin/devices/type-devices/${id}`);
  },
};
