export interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  cost_center_id?: number;
  AreaDept?: AreaDept | string; // Puede ser un objeto o un string
  createdAt?: string;
  updatedAt?: string;
  assignedDevices?: AssignedDevice[];
}

export interface AssignedDevice {
  assignmentId: number;
  assignedAt: string;
  notes?: string;
  device: {
    name: string;
    brand: string;
    serial_number: string;
    model: string;
  };
}

export interface Device {
  id: number;
  name: string;
  type_device_id: number;
  brand: string;
  model: string;
  serial_number: string;
  plate_device?: string;
  status: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  DeviceType?: DeviceType;
}

export interface DeviceWithUser {
  id: number;
  name: string;
  description: string;
  brand: string;
  model: string;
  serial_number: string;
  plate_device?: string;
  status: boolean;
  type_device: {
    id: number;
    name: string;
  };
  assigned_user?: {
    id: number;
    name: string;
    email: string;
    dni: string;
  };
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

export interface AreaDept {
  id: number;
  cost_center: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaDeptWithUsers {
  id: number;
  cost_center: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search?: string | null;
}

export interface AreaDeptWithDevices {
  id: number;
  cost_center: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  assignedDevices: Array<{
    assignmentId: number;
    assignedAt: string;
    notes?: string;
    device: {
      id: number;
      name: string;
      brand: string;
      model: string;
      serial_number: string;
      status: boolean;
    };
    assignedTo: {
      id: number;
      name: string;
      dni: string;
      email: string;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search?: string | null;
}

export interface CreateAreaDeptRequest {
  cost_center: string;
  name: string;
}

export interface UpdateAreaDeptRequest {
  cost_center: string;
  name: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  dni: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  cost_center_id?: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  dni: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  cost_center_id?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}