import React, { useState, useEffect } from 'react';
import { AreaDept, AreaDeptWithUsers, AreaDeptWithDevices } from '../types';
import { areaDeptService } from '../services/areaDeptService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { transformArrayForDisplay } from '../utils/displayTransform';
import { Plus, Edit, Trash2, Building2, User as UserIcon, Monitor, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const Areas: React.FC = () => {
  const [areas, setAreas] = useState<AreaDept[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<AreaDept[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [viewingArea, setViewingArea] = useState<AreaDeptWithUsers | null>(null);
  const [viewingAreaDevices, setViewingAreaDevices] = useState<AreaDeptWithDevices | null>(null);
  const [editingArea, setEditingArea] = useState<AreaDept | null>(null);
  const [viewUserSearch, setViewUserSearch] = useState('');
  const [currentViewPage, setCurrentViewPage] = useState(1);
  const [formData, setFormData] = useState({
    cost_center: '',
    name: ''
  });
  const { addNotification } = useNotification();

  const fetchAreas = async (searchParams?: { name?: string; cost_center?: string }, activeOnly = showActiveOnly) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar el servicio correcto dependiendo del filtro
      const response = activeOnly 
        ? await areaDeptService.getActiveAreas(searchParams)
        : await areaDeptService.getAreas(searchParams);
      
      const transformedData = transformArrayForDisplay(response.areaDepts);
      setAreas(transformedData);
      setFilteredAreas(transformedData);
    } catch (error: any) {
      console.error('Error fetching areas:', error);
      setError(error.response?.data?.error || 'Error al cargar áreas/departamentos');
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al cargar áreas/departamentos'
      });
      setAreas([]);
      setFilteredAreas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Effect para manejar cambios en el filtro de centros activos
  useEffect(() => {
    fetchAreas(undefined, showActiveOnly);
  }, [showActiveOnly]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAreas(areas);
      return;
    }

    const filtered = areas.filter(area =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.cost_center.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAreas(filtered);
  }, [searchQuery, areas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await areaDeptService.updateArea(editingArea.id, formData);
        addNotification({
          type: 'success',
          message: 'Área/Departamento actualizado exitosamente'
        });
      } else {
        await areaDeptService.createArea(formData);
        addNotification({
          type: 'success',
          message: 'Área/Departamento creado exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingArea(null);
      resetForm();
      fetchAreas(undefined, showActiveOnly);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al guardar área/departamento'
      });
    }
  };

  const handleDelete = async (area: AreaDept) => {
    if (window.confirm(`¿Estás seguro de que quieres desactivar "${area.name}"? Esta acción no eliminará el centro de costo, solo lo desactivará.`)) {
      try {
        const response = await areaDeptService.deactivateArea(area.id);
        addNotification({
          type: 'success',
          message: response.message || 'Centro de costo desactivado exitosamente'
        });
        fetchAreas(undefined, showActiveOnly);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Error al desactivar centro de costo';
        
        // Si tiene usuarios activos, mostrar mensaje específico
        if (error.response?.data?.hasActiveUsers) {
          addNotification({
            type: 'warning',
            message: errorMessage
          });
        } else {
          addNotification({
            type: 'error',
            message: errorMessage
          });
        }
      }
    }
  };

  const handleViewArea = async (area: AreaDept) => {
    try {
      setViewUserSearch('');
      setCurrentViewPage(1);
      const response = await areaDeptService.getAreaWithUsers(area.id, { limit: 10, page: 1 });
      setViewingArea(response);
      setIsViewModalOpen(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al cargar detalles del área/departamento'
      });
    }
  };

  const handleViewAreaDevices = async (area: AreaDept) => {
    try {
      const response = await areaDeptService.getAreaWithDevices(area.id);
      setViewingAreaDevices(response);
      setIsDevicesModalOpen(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al cargar equipos del área/departamento'
      });
    }
  };

  const fetchAreaUsers = async (areaId: number, page: number, search?: string) => {
    try {
      const response = await areaDeptService.getAreaWithUsers(areaId, { 
        limit: 10, 
        page,
        search: search || undefined 
      });
      setViewingArea(response);
      setCurrentViewPage(page);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al cargar usuarios del área'
      });
    }
  };

  const handleSearchUsers = () => {
    if (viewingArea) {
      fetchAreaUsers(viewingArea.id, 1, viewUserSearch);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchUsers();
    }
  };

  const handleClearSearch = () => {
    setViewUserSearch('');
    if (viewingArea) {
      fetchAreaUsers(viewingArea.id, 1, '');
    }
  };

  const resetForm = () => {
    setFormData({
      cost_center: '',
      name: ''
    });
  };

  const openModal = (area?: AreaDept) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        cost_center: area.cost_center,
        name: area.name
      });
    } else {
      setEditingArea(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Funciones para carga masiva
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        addNotification({
          type: 'error',
          message: 'Solo se permiten archivos CSV'
        });
        event.target.value = '';
      }
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        message: 'Por favor selecciona un archivo CSV'
      });
      return;
    }

    try {
      setIsUploading(true);
      const result = await areaDeptService.bulkUpload(selectedFile);
      
      addNotification({
        type: 'success',
        message: `${result.message}: ${result.summary.successful} centros creados exitosamente${result.summary.errors > 0 ? `, ${result.summary.errors} errores` : ''}`
      });

      if (result.errors && result.errors.length > 0) {
        console.log('Errores en la carga:', result.errors);
      }

      setIsBulkUploadModalOpen(false);
      setSelectedFile(null);
      fetchAreas(undefined, showActiveOnly);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error en la carga masiva'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    {
      key: 'cost_center',
      label: 'Centro de Costo',
      render: (area: AreaDept) => (
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{area.cost_center}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nombre del Área/Departamento',
      render: (area: AreaDept) => (
        <span className="text-gray-900">{area.name}</span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (area: AreaDept) => (
        <div className="flex space-x-2">
          {/* <button
            onClick={() => handleViewArea(area)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Ver usuarios asignados"
          >
            <Users className="h-4 w-4" />
          </button> */}
          <button
            onClick={() => handleViewAreaDevices(area)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Ver equipos asignados"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal(area)}
            className="text-purple-600 hover:text-purple-800 transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(area)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Eliminar"
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
        resetError={() => fetchAreas()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Centros de Costo</h1>
          
          {/* Filtro de centros activos */}
          <div className="flex items-center space-x-2 ml-8">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <button
              onClick={() => setShowActiveOnly(false)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                !showActiveOnly
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos los centros
            </button>
            <button
              onClick={() => setShowActiveOnly(true)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                showActiveOnly
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Solo activos
            </button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Building2 className="h-4 w-4" />
            <span>Carga Masiva</span>
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Centro</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por centro de costo o nombre..."
          className="mb-4"
        />

        {filteredAreas.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {filteredAreas.length} de {areas.length} centros de costo
            {showActiveOnly && (
              <span className="ml-2 text-green-600">
                (solo activos)
              </span>
            )}
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (filtrado por "{searchQuery}")
              </span>
            )}
          </div>
        )}

        <Table
          data={filteredAreas}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={
            searchQuery 
              ? `No se encontraron áreas que coincidan con "${searchQuery}"`
              : "No hay áreas/departamentos registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title="No hay áreas/departamentos registrados"
                description="Comienza agregando la primera área o departamento al sistema"
                icon={
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                }
                actionLabel="Crear primera área"
                onAction={() => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* Modal de Área/Departamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingArea(null);
          resetForm();
        }}
        title={editingArea ? 'Editar Área/Departamento' : 'Crear Área/Departamento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Costo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cost_center}
              onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: CC001, ADMIN, VENTAS..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Código único para identificar el centro de costo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Área/Departamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Administración, Ventas, Recursos Humanos..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Nombre descriptivo del área o departamento
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingArea(null);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingArea ? 'Actualizar' : 'Crear'}
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
        title="Carga Masiva de Centros de Costo"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Formato del archivo CSV</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Separador: punto y coma (;)</li>
                  <li>• Columnas: cost_center;name</li>
                  <li>• Ejemplo: CC001;Recursos Humanos</li>
                  <li>• No incluir encabezados</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arrastra y suelta tu archivo CSV aquí, o
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <span>Seleccionar archivo</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Solo archivos CSV con separador punto y coma (;)
                </p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-green-600" />
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Cargar Centros</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Vista de Área con Usuarios */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingArea(null);
          setViewUserSearch('');
          setCurrentViewPage(1);
        }}
        title="Detalles del Área/Departamento"
      >
        {viewingArea && (
          <div className="space-y-6">
            {/* Información del Área */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Información del Área/Departamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Centro de Costo:</label>
                  <p className="text-gray-900 font-medium">{viewingArea.cost_center}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre:</label>
                  <p className="text-gray-900">{viewingArea.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Creación:</label>
                  <p className="text-gray-900">{new Date(viewingArea.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Actualización:</label>
                  <p className="text-gray-900">{new Date(viewingArea.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Usuarios Asignados ({viewingArea.pagination.total})
              </h3>
              
              {/* Buscador de usuarios */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={viewUserSearch}
                    onChange={(e) => setViewUserSearch(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Buscar usuarios por nombre, email o DNI... (Presiona Enter para buscar)"
                    className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <div className="absolute right-2 top-1.5 flex space-x-1">
                    <button
                      type="button"
                      onClick={handleSearchUsers}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded"
                      title="Buscar"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    {viewUserSearch && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-gray-600 hover:text-gray-800 rounded"
                        title="Limpiar búsqueda"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {viewingArea.users.length > 0 ? (
                <div className="space-y-3">
                  {viewingArea.users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white p-3 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{user.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="mr-4">📧 {user.email}</span>
                            <span className="mr-4">📱 {user.phone}</span>
                            <span>🆔 {user.dni}</span>
                          </div>
                          
                          {/* Dispositivos asignados */}
                          {user.assignedDevices && user.assignedDevices.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 mb-1">Dispositivos asignados:</p>
                              <div className="flex flex-wrap gap-1">
                                {user.assignedDevices.map((device, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                                  >
                                    <Monitor className="h-3 w-3 mr-1" />
                                    {/* {device.name} (S/N: {device.serialNumber}) */}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Controles de paginación */}
                  {viewingArea.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-sm text-gray-600">
                        Página {viewingArea.pagination.page} de {viewingArea.pagination.totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (viewingArea.pagination.page > 1) {
                              fetchAreaUsers(viewingArea.id, viewingArea.pagination.page - 1, viewUserSearch || undefined);
                            }
                          }}
                          disabled={viewingArea.pagination.page <= 1}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium px-2">
                          {viewingArea.pagination.page}
                        </span>
                        <button
                          onClick={() => {
                            if (viewingArea.pagination.page < viewingArea.pagination.totalPages) {
                              fetchAreaUsers(viewingArea.id, viewingArea.pagination.page + 1, viewUserSearch || undefined);
                            }
                          }}
                          disabled={viewingArea.pagination.page >= viewingArea.pagination.totalPages}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Información de paginación */}
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Mostrando {viewingArea.users.length} de {viewingArea.pagination.total} usuarios
                    {viewUserSearch && (
                      <span className="ml-2 text-blue-600">
                        (filtrado por "{viewUserSearch}")
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {viewUserSearch 
                      ? `No se encontraron usuarios que coincidan con "${viewUserSearch}"` 
                      : "No hay usuarios asignados a esta área"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Botón de cerrar */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingArea(null);
                  setViewUserSearch('');
                  setCurrentViewPage(1);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Equipos Asignados al Área */}
      <Modal
        isOpen={isDevicesModalOpen}
        onClose={() => {
          setIsDevicesModalOpen(false);
          setViewingAreaDevices(null);
        }}
        title="Equipos Asignados al Área"
      >
        {viewingAreaDevices && (
          <div className="space-y-6">
            {/* Información del Área */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Información del Área/Departamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Centro de Costo:</label>
                  <p className="text-gray-900 font-medium">{viewingAreaDevices.cost_center}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre:</label>
                  <p className="text-gray-900">{viewingAreaDevices.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total de Equipos:</label>
                  <p className="text-gray-900 font-medium">{viewingAreaDevices.assignedDevices.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Actualización:</label>
                  <p className="text-gray-900">{new Date(viewingAreaDevices.updatedAt).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>

            {/* Lista de Equipos */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-green-600" />
                Equipos Asignados ({viewingAreaDevices.assignedDevices.length})
              </h3>
              
              {viewingAreaDevices.assignedDevices.length > 0 ? (
                <div className="space-y-4">
                  {viewingAreaDevices.assignedDevices.map((assignment, index) => (
                    <div
                      key={assignment.assignmentId}
                      className="bg-white p-4 rounded-lg border border-green-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{assignment.device.name}</h4>
                              <p className="text-sm text-gray-600">{assignment.device.brand} - {assignment.device.model}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assignment.device.status 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {assignment.device.status ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600 font-medium">Número de Serie:</span>
                              <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                {assignment.device.serial_number}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Asignado el:</span>
                              <span className="ml-2">
                                {new Date(assignment.assignedAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Información del usuario asignado */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">Asignado a:</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium">{assignment.assignedTo.name}</span>
                              </div>
                              <div className="text-gray-600">
                                <span className="mr-4">📧 {assignment.assignedTo.email}</span>
                                <span>🆔 {assignment.assignedTo.dni}</span>
                              </div>
                            </div>
                          </div>

                          {assignment.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <span className="text-sm font-medium text-yellow-800">Notas:</span>
                              <p className="text-sm text-yellow-700 mt-1">{assignment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-lg font-medium mb-1">Sin equipos asignados</p>
                  <p className="text-gray-400">
                    No hay equipos asignados a esta área actualmente.
                  </p>
                </div>
              )}
            </div>

            {/* Botón de cerrar */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setIsDevicesModalOpen(false);
                  setViewingAreaDevices(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
