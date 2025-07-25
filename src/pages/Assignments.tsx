import React, { useState, useEffect } from 'react';
import { Assignment, User, Device } from '../types';
import { assignmentService } from '../services/assignmentService';
import { userService } from '../services/userService';
import { deviceService } from '../services/deviceService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User as UserIcon, 
  Monitor, 
  RotateCcw, 
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [actionType, setActionType] = useState<'return' | 'transfer' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [transferUserId, setTransferUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    device_id: '',
    notes: ''
  });
  const { addNotification } = useNotification();

  const fetchAssignments = async (page = 1, search = '', status?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching assignments...', { page, search, status });
      
      const response = await assignmentService.getAssignments({
        page,
        limit: 10,
        status
      });
      
      console.log('Assignments response:', response);
      setAssignments(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar asignaciones';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      // Inicializar con datos vacíos en caso de error
      setAssignments([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for assignments...');
      const response = await userService.getUsers({ limit: 100 });
      console.log('Users for assignments response:', response);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users for assignments:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar usuarios'
      });
    }
  };

  const fetchDevices = async () => {
    try {
      console.log('Fetching devices for assignments...');
      const response = await deviceService.getDevices({ limit: 100, status: true });
      console.log('Devices for assignments response:', response);
      setDevices(response.data);
      setFilteredDevices(response.data);
    } catch (error: any) {
      console.error('Error fetching devices for assignments:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar dispositivos'
      });
    }
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    try {
      const response = await userService.getUsers({ 
        page: 1, 
        limit: 10, 
        search: searchTerm 
      });
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Error searching users:', error);
      addNotification({
        type: 'error',
        message: 'Error al buscar usuarios'
      });
    }
  };

  const searchDevices = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices);
      return;
    }
    
    try {
      const response = await deviceService.getDevices({ 
        page: 1, 
        limit: 10, 
        status: true, 
        search: searchTerm 
      });
      setFilteredDevices(response.data);
    } catch (error: any) {
      console.error('Error searching devices:', error);
      addNotification({
        type: 'error',
        message: 'Error al buscar dispositivos'
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
    fetchDevices();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAssignments(1, searchQuery, statusFilter);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter]);

  // Debounce para búsqueda de usuarios
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (userSearch.trim()) {
        searchUsers(userSearch);
      } else {
        setFilteredUsers(users);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [userSearch, users]);

  // Debounce para búsqueda de dispositivos
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (deviceSearch.trim()) {
        searchDevices(deviceSearch);
      } else {
        setFilteredDevices(devices);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [deviceSearch, devices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment.id, {
          notes: formData.notes
        });
        addNotification({
          type: 'success',
          message: 'Asignación actualizada exitosamente'
        });
      } else {
        await assignmentService.createAssignment({
          user_id: parseInt(formData.user_id),
          device_id: parseInt(formData.device_id),
          notes: formData.notes
        });
        addNotification({
          type: 'success',
          message: 'Asignación creada exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingAssignment(null);
      resetForm();
      fetchAssignments(currentPage, searchQuery, statusFilter);
      fetchDevices(); // Refresh devices to update availability
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar asignación'
      });
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !actionType) return;

    try {
      if (actionType === 'return') {
        await assignmentService.returnDevice(editingAssignment.id, actionNotes);
        addNotification({
          type: 'success',
          message: 'Dispositivo devuelto exitosamente'
        });
      } else if (actionType === 'transfer' && transferUserId) {
        await assignmentService.transferDevice(editingAssignment.id, {
          new_user_id: transferUserId,
          notes: actionNotes
        });
        addNotification({
          type: 'success',
          message: 'Dispositivo transferido exitosamente'
        });
      }
      setIsActionModalOpen(false);
      setEditingAssignment(null);
      setActionType(null);
      setActionNotes('');
      setTransferUserId(null);
      fetchAssignments(currentPage, searchQuery, statusFilter);
      fetchDevices(); // Refresh devices to update availability
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al procesar la acción'
      });
    }
  };

  const handleDelete = async (assignment: Assignment) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      try {
        await assignmentService.deleteAssignment(assignment.id);
        addNotification({
          type: 'success',
          message: 'Asignación eliminada exitosamente'
        });
        fetchAssignments(currentPage, searchQuery, statusFilter);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Error al eliminar asignación'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      device_id: '',
      notes: ''
    });
    setUserSearch('');
    setDeviceSearch('');
    setFilteredUsers(users);
    setFilteredDevices(devices);
  };

  const openModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        user_id: assignment.user_id.toString(),
        device_id: assignment.device_id.toString(),
        notes: assignment.notes || ''
      });
    } else {
      setEditingAssignment(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const openActionModal = (assignment: Assignment, action: 'return' | 'transfer') => {
    setEditingAssignment(assignment);
    setActionType(action);
    setActionNotes('');
    setTransferUserId(null);
    setUserSearch('');
    setFilteredUsers(users);
    setIsActionModalOpen(true);
  };

  const columns = [
    {
      key: 'user',
      label: 'Usuario',
      render: (assignment: Assignment) => (
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{assignment.User?.name}</span>
        </div>
      )
    },
    {
      key: 'device',
      label: 'Dispositivo',
      render: (assignment: Assignment) => (
        <div className="flex items-center">
          <Monitor className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{assignment.Device?.name}</span>
        </div>
      )
    },
    {
      key: 'assigned_at',
      label: 'Fecha Asignación',
      render: (assignment: Assignment) => (
        <span className="text-sm text-gray-600">
          {new Date(assignment.assigned_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'returned_at',
      label: 'Fecha Devolución',
      render: (assignment: Assignment) => (
        <span className="text-sm text-gray-600">
          {assignment.returned_at 
            ? new Date(assignment.returned_at).toLocaleDateString()
            : '-'
          }
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (assignment: Assignment) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          assignment.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {assignment.status ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Activa
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Finalizada
            </>
          )}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (assignment: Assignment) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openModal(assignment)}
            className="text-blue-600 hover:text-blue-800"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          {assignment.status && (
            <>
              <button
                onClick={() => openActionModal(assignment, 'return')}
                className="text-green-600 hover:text-green-800"
                title="Devolver"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => openActionModal(assignment, 'transfer')}
                className="text-yellow-600 hover:text-yellow-800"
                title="Transferir"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </>
          )}
          {!assignment.status && (
            <button
              onClick={() => handleDelete(assignment)}
              className="text-red-600 hover:text-red-800"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorBoundaryFallback
        message={error}
        resetError={() => {
          setError(null);
          fetchAssignments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Asignaciones</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Asignación</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar asignaciones..."
            className="flex-1"
          />
          <select
            value={statusFilter === undefined ? 'all' : statusFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === 'all' ? undefined : value === 'true');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Activas</option>
            <option value="false">Finalizadas</option>
          </select>
        </div>

        <Table
          data={assignments}
          columns={columns}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
          isLoading={isLoading}
          emptyMessage="No hay asignaciones registradas"
        />
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Editar Asignación' : 'Crear Asignación'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar usuario por nombre, email o DNI..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingAssignment}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => searchUsers(userSearch)}
                  className="absolute right-2 top-1.5 p-1 text-blue-600 hover:text-blue-800 rounded"
                  disabled={!!editingAssignment}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingAssignment}
              >
                <option value="">Selecciona un usuario</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - DNI: {user.dni}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  placeholder="Buscar dispositivo por nombre, marca, modelo o serial..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingAssignment}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => searchDevices(deviceSearch)}
                  className="absolute right-2 top-1.5 p-1 text-blue-600 hover:text-blue-800 rounded"
                  disabled={!!editingAssignment}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <select
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingAssignment}
              >
                <option value="">Selecciona un dispositivo</option>
                {filteredDevices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name} - {device.brand} {device.model} (S/N: {device.serial_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre la asignación"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingAssignment ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={actionType === 'return' ? 'Devolver Dispositivo' : 'Transferir Dispositivo'}
      >
        <form onSubmit={handleAction} className="space-y-4">
          {actionType === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo Usuario
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar usuario por nombre, email o DNI..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => searchUsers(userSearch)}
                    className="absolute right-2 top-1.5 p-1 text-blue-600 hover:text-blue-800 rounded"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={transferUserId || ''}
                  onChange={(e) => setTransferUserId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un usuario</option>
                  {filteredUsers.filter(user => user.id !== editingAssignment?.user_id).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - DNI: {user.dni}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Notas sobre la ${actionType === 'return' ? 'devolución' : 'transferencia'}`}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                actionType === 'return' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {actionType === 'return' ? 'Devolver' : 'Transferir'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};