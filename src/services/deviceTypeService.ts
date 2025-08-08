import { api } from './api';
import { DeviceType } from '../types';

export const deviceTypeService = {
  getDeviceTypes: async (): Promise<DeviceType[]> => {
    const response = await api.get('/admin/devices/type-devices');
    return response.data.typeDevices || response.data;
  },

  createDeviceType: async (deviceTypeData: {
    name: string;
    description?: string;
  }): Promise<DeviceType> => {
    const response = await api.post('/admin/devices/type-devices', deviceTypeData);
    return response.data.typeDevice || response.data;
  },

  updateDeviceType: async (id: number, deviceTypeData: {
    name?: string;
    description?: string;
  }): Promise<DeviceType> => {
    const response = await api.put(`/admin/devices/type-devices/${id}`, deviceTypeData);
    return response.data.typeDevice || response.data;
  },

  toggleDeviceTypeStatus: async (id: number, status: boolean): Promise<DeviceType> => {
    const response = await api.put(`/admin/devices/type-devices/${id}/status`, { status });
    return response.data.typeDevice || response.data;
  },

  getDeletedDeviceTypes: async (): Promise<DeviceType[]> => {
    const response = await api.get('/admin/devices/type-devices/inactive');
    return response.data.typeDevices || response.data;
  },

  getAllDeviceTypes: async (includeInactive: boolean = false): Promise<DeviceType[]> => {
    const response = await api.get(`/admin/devices/type-devices?include_inactive=${includeInactive}`);
    return response.data.typeDevices || response.data;
  },

  getRequiredFields: async (typeDeviceId: number): Promise<any> => {
    const response = await api.get(`/admin/devices/type-devices/${typeDeviceId}/required-fields`);
    return response.data;
  },
};
