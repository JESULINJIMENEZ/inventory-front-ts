import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Edit, Trash2, User as UserIcon, Users as UsersIcon, Upload, Download, FileText } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
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
    status: 'active' as 'active' | 'inactive'
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(1, searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        addNotification({
          type: 'success',
          message: 'Usuario actualizado exitosamente'
        });
      } else {
        await userService.createUser(formData);
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
      status: 'active'
    });
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

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        dni: user.dni,
        phone: user.phone,
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      resetForm();
    }
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
    { key: 'email', label: 'Email' },
    { key: 'dni', label: 'DNI' },
    { key: 'phone', label: 'Teléfono' },
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
            onClick={() => openModal(user)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="text-red-600 hover:text-red-800"
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
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar usuarios..."
          className="mb-4"
        />

        <Table
          data={users}
          columns={columns}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
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
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
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
              {editingUser ? 'Actualizar' : 'Crear'}
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
    </div>
  );
};