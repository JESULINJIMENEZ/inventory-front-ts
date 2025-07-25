import React, { useState, useEffect } from 'react';
import { User, AreaDept } from '../types';
import { userService } from '../services/userService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Edit, Trash2, User as UserIcon, Users as UsersIcon, Upload, Download, FileText, Eye, Search } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableAreas, setAvailableAreas] = useState<AreaDept[]>([]);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [areaSearchInput, setAreaSearchInput] = useState('');
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [totalAreas, setTotalAreas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [selectedUserForAssignments, setSelectedUserForAssignments] = useState<User | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dni: '',
    phone: '',
    role: 'employee' as 'admin' | 'employee',
    status: 'active' as 'active' | 'inactive',
    cost_center_id: '',
    AreaDept: null as AreaDept | null

  });
  const { addNotification } = useNotification();

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching users...', { page, search });
      
      const response = await userService.getUsers({
        page,
        limit: 10,
        search: search || undefined
      });
      
      console.log('Users response:', response);
      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Error al cargar usuarios');
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar usuarios'
      });
      // Inicializar con datos vacíos en caso de error
      setUsers([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableAreas = async (search?: string) => {
    try {
      setIsLoadingAreas(true);
      const response = await userService.getAvailableAreas(search);
      setAvailableAreas(response.areas);
      setTotalAreas(response.total);
    } catch (error) {
      console.error('Error fetching areas:', error);
      addNotification({
        type: 'error',
        message: 'Error al cargar las áreas'
      });
    } finally {
      setIsLoadingAreas(false);
    }
  };

  const handleAreaSearch = () => {
    setAreaSearchQuery(areaSearchInput);
    fetchAvailableAreas(areaSearchInput);
  };

  const handleAreaSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAreaSearch();
    }
  };

  const handleClearAreaSearch = () => {
    setAreaSearchInput('');
    setAreaSearchQuery('');
    fetchAvailableAreas();
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableAreas();
  }, []);

  // Effect separado para manejar cambios de página
  useEffect(() => {
    if (currentPage > 1) {
      fetchUsers(currentPage, searchQuery);
    }
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset a la primera página cuando hace búsqueda
    setSearchQuery(searchInput);
    fetchUsers(1, searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    fetchUsers(1, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Asegurar que se envíe el status correctamente
        const updateData = {
          ...formData,
          status: formData.status, // Enviar como string: "active" o "inactive"
          cost_center_id: formData.cost_center_id ? Number(formData.cost_center_id) : undefined
        };
        await userService.updateUser(editingUser.id, updateData);
        addNotification({
          type: 'success',
          message: 'Usuario actualizado exitosamente'
        });
      } else {
        await userService.createUser({
          ...formData,
          cost_center_id: formData.cost_center_id ? Number(formData.cost_center_id) : undefined
        });
        addNotification({
          type: 'success',
          message: 'Usuario creado exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers(currentPage, searchQuery);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar usuario'
      });
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
      try {
        await userService.deleteUser(user.id);
        addNotification({
          type: 'success',
          message: 'Usuario eliminado exitosamente'
        });
        fetchUsers(currentPage, searchQuery);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Error al eliminar usuario'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      dni: '',
      phone: '',
      role: 'employee',
      status: 'active',
      cost_center_id: '',
      AreaDept: null as AreaDept | null
    });
    setAreaSearchQuery('');
    setAreaSearchInput('');
    // Recargar todas las áreas cuando se resetea el formulario
    fetchAvailableAreas();
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await userService.downloadBulkUploadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_usuarios.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        message: 'Plantilla descargada exitosamente'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al descargar plantilla'
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        addNotification({
          type: 'error',
          message: 'Solo se permiten archivos Excel (.xlsx, .xls) o CSV'
        });
        event.target.value = '';
      }
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        message: 'Por favor selecciona un archivo'
      });
      return;
    }

    try {
      setIsUploading(true);
      const result = await userService.bulkUpload(selectedFile);
      
      addNotification({
        type: 'success',
        message: `Carga completada: ${result.successCount} usuarios creados exitosamente${result.errorCount > 0 ? `, ${result.errorCount} errores` : ''}`
      });

      if (result.errors && result.errors.length > 0) {
        console.log('Errores en la carga:', result.errors);
        // Mostrar errores detallados si es necesario
      }

      setIsBulkUploadModalOpen(false);
      setSelectedFile(null);
      fetchUsers(currentPage, searchQuery);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error en la carga masiva'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewAssignments = async (user: User) => {
    setSelectedUserForAssignments(user);
    setIsAssignmentsModalOpen(true);
    
    // Si el usuario no tiene equipos asignados cargados, obtenerlos
    if (!user.assignedDevices) {
      setIsLoadingAssignments(true);
      try {
        const userWithAssignments = await userService.getUserWithAssignments(user.id);
        setSelectedUserForAssignments(userWithAssignments);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Error al cargar los equipos asignados'
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // La contraseña se deja vacía para edición
        dni: user.dni,
        phone: user.phone,
        role: user.role,
        status: user.status,
        cost_center_id: user.cost_center_id?.toString() || '',
        AreaDept: typeof user.AreaDept === 'object' ? user.AreaDept : null
      });
    } else {
      setEditingUser(null);
      resetForm();
    }
    setAreaSearchQuery('');
    setAreaSearchInput('');
    // Cargar todas las áreas al abrir el modal
    fetchAvailableAreas();
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (user: User) => (
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{user.name}</span>
        </div>
      )
    },
    { key: 'dni', label: 'DNI' },
    {
      key: 'area',
      label: 'Centro de Costo',
      render: (user: User) => (
        user.AreaDept ? (
          <div className="text-sm">
            <div className="font-medium">
              {typeof user.AreaDept === 'object' ? user.AreaDept.cost_center : user.AreaDept}
            </div>
            {typeof user.AreaDept === 'object' && (
              <div className="text-gray-500">{user.AreaDept.name}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">No asignado</span>
        )
      )
    },
    {
      key: 'role',
      label: 'Rol',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'admin' ? 'Administrador' : 'Empleado'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewAssignments(user)}
            className="text-green-600 hover:text-green-800"
            title="Ver equipos asignados"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal(user)}
            className="text-blue-600 hover:text-blue-800"
            title="Editar usuario"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="text-red-600 hover:text-red-800"
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
        resetError={() => fetchUsers(currentPage, searchQuery)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Plantilla</span>
          </button>
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Carga Masiva</span>
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-2 mb-4">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onKeyPress={handleSearchKeyPress}
            placeholder="Buscar usuarios por nombre, email, DNI... (Presiona Enter)"
            className="flex-1"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Información de paginación */}
        {users.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} de {total} usuarios
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (filtrado por "{searchQuery}")
              </span>
            )}
          </div>
        )}

        <Table
          data={users}
          columns={columns}
          pagination={totalPages > 1 ? {
            currentPage,
            totalPages,
            onPageChange: (page: number) => {
              setCurrentPage(page);
              // Scroll hacia arriba cuando cambia la página
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } : undefined}
          isLoading={isLoading}
          emptyMessage={
            searchQuery 
              ? `No se encontraron usuarios que coincidan con "${searchQuery}"`
              : "No hay usuarios registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title="No hay usuarios registrados"
                description="Comienza agregando el primer usuario al sistema"
                icon={
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                  </div>
                }
                actionLabel="Crear primer usuario"
                onAction={() => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          resetForm();
        }}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Costo
            </label>
            
            {/* Buscador de áreas */}
            <div className="mb-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar centro de costo..."
                    value={areaSearchInput}
                    onChange={(e) => setAreaSearchInput(e.target.value)}
                    onKeyPress={handleAreaSearchKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAreaSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  {isLoadingAreas ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>Buscar</span>
                </button>
                {areaSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearAreaSearch}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <select
              value={formData.cost_center_id}
              onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingAreas}
            >
              <option value="">Seleccionar centro de costo (opcional)</option>
              {availableAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.cost_center} - {area.name}
                </option>
              ))}
            </select>
            
            {/* Información de resultados */}
            {areaSearchQuery && (
              <p className="text-xs text-gray-500 mt-1">
                {isLoadingAreas ? 'Buscando...' : `${totalAreas} ${totalAreas === 1 ? 'resultado' : 'resultados'} encontrados para "${areaSearchQuery}"`}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Selecciona el área o departamento al que pertenece el usuario
            </p>
          </div>

          {/* Campo de contraseña solo para creación o cambio opcional en edición */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'} 
              {!editingUser && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!editingUser}
              placeholder={editingUser ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-1">
                Deja este campo vacío si no quieres cambiar la contraseña
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Los administradores tienen acceso completo al sistema
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Los usuarios inactivos no pueden acceder al sistema
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              {editingUser ? (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Actualizar Usuario</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Carga Masiva */}
      <Modal
        isOpen={isBulkUploadModalOpen}
        onClose={() => {
          setIsBulkUploadModalOpen(false);
          setSelectedFile(null);
        }}
        title="Carga Masiva de Usuarios"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Instrucciones</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Descarga la plantilla con el formato requerido</li>
                  <li>• Completa la información de los usuarios</li>
                  <li>• Sube el archivo completado (Excel o CSV)</li>
                  <li>• Revisa los resultados de la carga</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arrastra y suelta tu archivo aquí, o
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <span>Seleccionar archivo</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Formatos soportados: Excel (.xlsx, .xls) y CSV
                </p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-green-600">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsBulkUploadModalOpen(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Cargar Usuarios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Equipos Asignados */}
      <Modal
        isOpen={isAssignmentsModalOpen}
        onClose={() => {
          setIsAssignmentsModalOpen(false);
          setSelectedUserForAssignments(null);
        }}
        title={`Equipos Asignados - ${selectedUserForAssignments?.name || ''}`}
      >
        <div className="space-y-4">
          {isLoadingAssignments ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {selectedUserForAssignments?.assignedDevices && selectedUserForAssignments.assignedDevices.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-4">
                    Total de equipos asignados: {selectedUserForAssignments.assignedDevices.length}
                  </div>
                  
                  {selectedUserForAssignments.assignedDevices.map((assignment, index) => (
                    <div key={assignment.assignmentId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                            </div>
                            <h4 className="font-medium text-gray-900">{assignment.device.name}</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Marca:</span>
                              <span className="ml-2 font-medium">{assignment.device.brand}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Número de Serie:</span>
                              <span className="ml-2 font-medium">{assignment.device.serial_number}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Modelo:</span>
                              <span className="ml-2 font-medium">{assignment.device.model}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Asignado el:</span>
                              <span className="ml-2 font-medium">
                                {new Date(assignment.assignedAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {assignment.notes && (
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Notas:</span>
                                <span className="ml-2 font-medium">{assignment.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin equipos asignados</h3>
                  <p className="text-gray-600">
                    Este usuario no tiene equipos asignados actualmente.
                  </p>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => {
                setIsAssignmentsModalOpen(false);
                setSelectedUserForAssignments(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};