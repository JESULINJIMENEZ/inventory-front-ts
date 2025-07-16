export interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Device {
  id: number;
  name: string;
  type_device_id: number;
  brand: string;
  model: string;
  serial_number: string;
  status: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  DeviceType?: DeviceType;
}

export interface DeviceType {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: number;
  user_id: number;
  device_id: number;
  assigned_at: string;
  returned_at?: string;
  status: boolean;
  notes?: string;
  User?: User;
  Device?: Device;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  description: string;
  previous_data?: any;
  new_data?: any;
  createdAt: string;
  User?: User;
}

export interface DeviceMovement {
  id: number;
  device_id: number;
  user_id: number;
  movement_type: 'assigned' | 'returned' | 'transferred';
  assignment_id: number;
  previous_user_id?: number;
  timestamp: string;
  notes?: string;
  User?: User;
  Device?: Device;
}

export interface DashboardData {
  summary: {
    activeAssignments: number;
    totalAssignments: number;
    availableDevices: number;
    totalDevices: number;
    deviceUtilization: string;
  };
  charts: {
    assignmentsByMonth: Array<{
      month: string;
      count: number;
    }>;
    topUsers: Array<{
      user_id: number;
      assignment_count: number;
      User: User;
    }>;
    topDevices: Array<{
      device_id: number;
      assignment_count: number;
      Device: Device;
    }>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  rol: string;
}