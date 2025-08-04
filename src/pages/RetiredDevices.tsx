import React, { useState, useEffect } from 'react';
import { RetiredDevice, Device } from '../types';
import { retiredDeviceService } from '../services/retiredDeviceService';
import { deviceService } from '../services/deviceService';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { transformForDisplay } from '../utils/displayTransform';
import { 
  Plus, 
  Edit, 
  Eye, 
  RotateCcw, 
  AlertTriangle, 
  Calendar, 
  Monitor, 
  User,
  Search,
  Archive
} from 'lucide-react';

export const RetiredDevices: React.FC = () => {
  const [retiredDevices, setRetiredDevices] = useState<RetiredDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isLoadingAvailableDevices, setIsLoadingAvailableDevices] = useState(false);
  const [availableDevicesSearch, setAvailableDevicesSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'retired' | 'disposed' | undefined>(undefined);
  const [searchType, setSearchType] = useState<'general' | 'specific'>('general');
  const [specificSearch, setSpecificSearch] = useState({
    brand: '',
    model: '',
    serial_number: '',
    date_from: '',
    date_to: ''
  });
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRetiredDevice, setSelectedRetiredDevice] = useState<RetiredDevice | null>(null);
  const [viewingDevice, setViewingDevice] = useState<RetiredDevice | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [retireFormData, setRetireFormData] = useState({
    device_id: 0,
    reason: '',
    notes: '',
    status: 'retired' as 'retired' | 'disposed'
  });
  const [updateFormData, setUpdateFormData] = useState({
    status: 'retired' as 'retired' | 'disposed',
    notes: ''
  });

  const { addNotification } = useNotification();

  // Función para ejecutar búsqueda manual
  const handleSearch = () => {
    if (searchType === 'general') {
      setSearchQuery(searchInput.trim());
    } else {
      // Para búsqueda específica, usamos los filtros específicos
      performSpecificSearch();
    }
    setCurrentPage(1);
  };

  // Función para búsqueda específica
  const performSpecificSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams: any = {
        page: 1,
        limit: 10
      };
      
      // Agregar filtros específicos si tienen valor
      if (specificSearch.brand.trim()) {
        searchParams.brand = specificSearch.brand.trim();
      }
      if (specificSearch.model.trim()) {
        searchParams.model = specificSearch.model.trim();  
      }
      if (specificSearch.serial_number.trim()) {
        searchParams.serial_number = specificSearch.serial_number.trim();
      }
      if (specificSearch.date_from) {
        searchParams.date_from = specificSearch.date_from;
      }
      if (specificSearch.date_to) {
        searchParams.date_to = specificSearch.date_to;
      }
      if (statusFilter) {
        searchParams.status = statusFilter;
      }
      
      const response = await retiredDeviceService.searchRetiredDevices(searchParams);
      
      setRetiredDevices(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      console.error('Error in specific search:', error);
      const errorMessage = error.response?.data?.message || 'Error en la búsqueda específica';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      setRetiredDevices([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar Enter en el campo de búsqueda
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Función para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSpecificSearch({
      brand: '',
      model: '',
      serial_number: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1);
    if (searchType === 'specific') {
      // Si estamos en búsqueda específica, volvemos a la búsqueda general
      fetchRetiredDevices(1, '', statusFilter);
    }
  };

  // Sincronizar searchInput con searchQuery al cargar
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const fetchRetiredDevices = async (page = 1, search = '', status?: 'retired' | 'disposed') => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching retired devices...', { page, search, status });
      
      const params: any = {
        page,
        limit: 10
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      if (status) {
        params.status = status;
      }
      
      const response = await retiredDeviceService.getRetiredDevices(params);
      
      console.log('Retired devices response:', response);
      setRetiredDevices(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      console.error('Error fetching retired devices:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar dispositivos dados de baja';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      setRetiredDevices([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableDevices = async (page = 1, append = false, search = '') => {
    try {
      setIsLoadingAvailableDevices(true);
      console.log('Fetching available devices...', { page, append, search });
      const params: any = { 
        status: true
        // Removido limit para traer todos los dispositivos disponibles
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }
      
      const response = await deviceService.getDevices(params);
      console.log('Available devices response:', response);
      
      // Siempre reemplazar la lista completa ya que traemos todos los dispositivos
      setAvailableDevices(response.data);
    } catch (error: any) {
      console.error('Error fetching available devices:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar dispositivos disponibles'
      });
    } finally {
      setIsLoadingAvailableDevices(false);
    }
  };

  // Función para buscar dispositivos disponibles
  const searchAvailableDevices = () => {
    fetchAvailableDevices(1, false, availableDevicesSearch);
  };

  useEffect(() => {
    fetchRetiredDevices();
    // No cargar dispositivos disponibles al inicio para mejorar rendimiento
    // Se cargarán cuando se abra el modal
    setHasInitiallyLoaded(true);
  }, []);

  // Effect para búsqueda manual (solo general)
  useEffect(() => {
    if (hasInitiallyLoaded && searchType === 'general') {
      setCurrentPage(1);
      fetchRetiredDevices(1, searchQuery, statusFilter);
    }
  }, [searchQuery, statusFilter, hasInitiallyLoaded, searchType]);

  // Effect para cambios de página
  useEffect(() => {
    if (hasInitiallyLoaded && searchType === 'general') {
      fetchRetiredDevices(currentPage, searchQuery, statusFilter);
    }
  }, [currentPage, hasInitiallyLoaded, searchType]);

  const handleRetireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!retireFormData.device_id || !retireFormData.reason.trim()) {
      addNotification({
        type: 'error',
        message: 'Debe seleccionar un dispositivo y proporcionar una razón'
      });
      return;
    }

    try {
      await retiredDeviceService.retireDevice(retireFormData);
      addNotification({
        type: 'success',
        message: 'Dispositivo dado de baja exitosamente'
      });
      setIsRetireModalOpen(false);
      resetRetireForm();
      fetchRetiredDevices(currentPage, searchQuery, statusFilter);
      // Solo refrescar si el modal está abierto (para ver cambios inmediatos)
      if (isRetireModalOpen) {
        setAvailableDevices([]);
        fetchAvailableDevices(1, false, availableDevicesSearch);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al dar de baja el dispositivo'
      });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRetiredDevice) return;

    try {
      await retiredDeviceService.updateRetiredDevice(selectedRetiredDevice.id, updateFormData);
      addNotification({
        type: 'success',
        message: 'Dispositivo actualizado exitosamente'
      });
      setIsUpdateModalOpen(false);
      setSelectedRetiredDevice(null);
      fetchRetiredDevices(currentPage, searchQuery, statusFilter);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al actualizar dispositivo'
      });
    }
  };

  const handleRestore = async (retiredDevice: RetiredDevice) => {
    if (retiredDevice.status === 'disposed') {
      addNotification({
        type: 'error',
        message: 'No se puede restaurar un dispositivo desechado'
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres restaurar el dispositivo "${retiredDevice.Device?.name}"? Volverá a estar disponible en el inventario.`)) {
      try {
        await retiredDeviceService.restoreDevice(retiredDevice.id);
        addNotification({
          type: 'success',
          message: 'Dispositivo restaurado exitosamente'
        });
        fetchRetiredDevices(currentPage, searchQuery, statusFilter);
        // Solo refrescar si el modal está abierto (para ver cambios inmediatos)
        if (isRetireModalOpen) {
          setAvailableDevices([]);
          fetchAvailableDevices(1, false, availableDevicesSearch);
        }
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: error.response?.data?.message || 'Error al restaurar dispositivo'
        });
      }
    }
  };

  const handleViewDevice = async (retiredDevice: RetiredDevice) => {
    try {
      const response = await retiredDeviceService.getRetiredDeviceById(retiredDevice.id);
      setViewingDevice(transformForDisplay(response));
      setIsViewModalOpen(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar detalles del dispositivo'
      });
    }
  };

  const resetRetireForm = () => {
    setRetireFormData({
      device_id: 0,
      reason: '',
      notes: '',
      status: 'retired'
    });
  };

  const openRetireModal = () => {
    resetRetireForm();
    // Reiniciar la búsqueda de dispositivos disponibles
    setAvailableDevicesSearch('');
    setAvailableDevices([]);
    fetchAvailableDevices(1, false, '');
    setIsRetireModalOpen(true);
  };

  const openUpdateModal = (retiredDevice: RetiredDevice) => {
    setSelectedRetiredDevice(retiredDevice);
    setUpdateFormData({
      status: retiredDevice.status,
      notes: retiredDevice.notes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const columns = [
    {
      key: 'device',
      label: 'Dispositivo',
      render: (retiredDevice: RetiredDevice) => (
        <div className="flex items-center">
          <Monitor className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="font-medium">{retiredDevice.Device?.name}</div>
            <div className="text-sm text-gray-500">
              {retiredDevice.Device?.brand} {retiredDevice.Device?.model}
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {retiredDevice.Device?.serial_number}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (retiredDevice: RetiredDevice) => (
        <span className="text-sm text-gray-600">
          {retiredDevice.Device?.TypeDevice?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'reason',
      label: 'Razón',
      render: (retiredDevice: RetiredDevice) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm truncate" title={retiredDevice.reason}>
            {retiredDevice.reason}
          </div>
          {retiredDevice.notes && (
            <div className="text-xs text-gray-500 truncate" title={retiredDevice.notes}>
              {retiredDevice.notes}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (retiredDevice: RetiredDevice) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          retiredDevice.status === 'retired'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {retiredDevice.status === 'retired' ? 'Dado de Baja' : 'Desechado'}
        </span>
      )
    },
    {
      key: 'retired_at',
      label: 'Fecha de Baja',
      render: (retiredDevice: RetiredDevice) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(retiredDevice.retired_at).toLocaleDateString('es-ES')}
        </div>
      )
    },
    {
      key: 'retired_by',
      label: 'Dado de Baja Por',
      render: (retiredDevice: RetiredDevice) => (
        retiredDevice.retiredBy ? (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-1 text-gray-400" />
            <div>
              <div className="font-medium">{retiredDevice.retiredBy.name}</div>
              <div className="text-xs text-gray-500">{retiredDevice.retiredBy.email}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (retiredDevice: RetiredDevice) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDevice(retiredDevice)}
            className="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openUpdateModal(retiredDevice)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Actualizar estado"
          >
            <Edit className="h-4 w-4" />
          </button>
          {retiredDevice.status === 'retired' && (
            <button
              onClick={() => handleRestore(retiredDevice)}
              className="text-green-600 hover:text-green-800"
              title="Restaurar dispositivo"
            >
              <RotateCcw className="h-4 w-4" />
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
          fetchRetiredDevices();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dispositivos Dados de Baja</h1>
        <button
          onClick={openRetireModal}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Dar de Baja Dispositivo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Selector de tipo de búsqueda */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setSearchType('general')}
              className={`px-4 py-2 rounded-md transition-colors ${
                searchType === 'general'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Búsqueda General
            </button>
            <button
              onClick={() => setSearchType('specific')}
              className={`px-4 py-2 rounded-md transition-colors ${
                searchType === 'specific'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Búsqueda Específica
            </button>
          </div>
        </div>

        {/* Búsqueda General */}
        {searchType === 'general' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Buscador personalizado con botón */}
            <div className="flex-1 relative">
              <div className="flex">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Buscar dispositivos por nombre, marca, modelo o serial..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-red-600 text-white border border-red-600 rounded-r-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  title="Buscar dispositivos"
                >
                  <Search className="h-4 w-4" />
                </button>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="ml-2 px-3 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <select
              value={statusFilter || 'all'}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === 'all' ? undefined : value as 'retired' | 'disposed');
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Todos los estados</option>
              <option value="retired">Dado de Baja</option>
              <option value="disposed">Desechado</option>
            </select>
          </div>
        )}

        {/* Búsqueda Específica */}
        {searchType === 'specific' && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={specificSearch.brand}
                  onChange={(e) => setSpecificSearch({ ...specificSearch, brand: e.target.value })}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Ej: Dell, HP, Lenovo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input
                  type="text"
                  value={specificSearch.model}
                  onChange={(e) => setSpecificSearch({ ...specificSearch, model: e.target.value })}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Ej: Inspiron, ThinkPad..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
                <input
                  type="text"
                  value={specificSearch.serial_number}
                  onChange={(e) => setSpecificSearch({ ...specificSearch, serial_number: e.target.value })}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Ej: ABC123456..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={specificSearch.date_from}
                  onChange={(e) => setSpecificSearch({ ...specificSearch, date_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={specificSearch.date_to}
                  onChange={(e) => setSpecificSearch({ ...specificSearch, date_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={statusFilter || 'all'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStatusFilter(value === 'all' ? undefined : value as 'retired' | 'disposed');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="retired">Dado de Baja</option>
                  <option value="disposed">Desechado</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </button>
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  title="Limpiar filtros"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información de paginación */}
        {retiredDevices.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} de {total} dispositivos dados de baja
            {searchType === 'general' && searchQuery && (
              <span className="ml-2 text-red-600">
                (filtrado por "{searchQuery}")
              </span>
            )}
            {searchType === 'specific' && (
              <span className="ml-2 text-red-600">
                (búsqueda específica aplicada)
              </span>
            )}
            {statusFilter && (
              <span className="ml-2 text-red-600">
                (estado: {statusFilter === 'retired' ? 'Dado de Baja' : 'Desechado'})
              </span>
            )}
          </div>
        )}

        <Table
          data={retiredDevices}
          columns={columns}
          pagination={totalPages > 1 ? {
            currentPage,
            totalPages,
            onPageChange: (page: number) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } : undefined}
          isLoading={isLoading}
          emptyMessage={
            (searchType === 'general' && searchQuery) || searchType === 'specific'
              ? `No se encontraron dispositivos dados de baja con los criterios especificados`
              : "No hay dispositivos dados de baja"
          }
          emptyComponent={
            (searchType === 'general' && !searchQuery) ? (
              <EmptyState
                title="No hay dispositivos dados de baja"
                description="Los dispositivos dados de baja aparecerán aquí"
                icon={
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Archive className="w-8 h-8 text-red-600" />
                  </div>
                }
                actionLabel="Dar de baja un dispositivo"
                onAction={openRetireModal}
              />
            ) : undefined
          }
        />
      </div>

      {/* Modal para dar de baja dispositivo */}
      <Modal
        isOpen={isRetireModalOpen}
        onClose={() => setIsRetireModalOpen(false)}
        title="Dar de Baja Dispositivo"
      >
        <form onSubmit={handleRetireSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo *
            </label>
            
            {/* Buscador de dispositivos */}
            <div className="mb-2">
              <div className="flex">
                <input
                  type="text"
                  value={availableDevicesSearch}
                  onChange={(e) => setAvailableDevicesSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchAvailableDevices();
                    }
                  }}
                  placeholder="Buscar dispositivos por nombre, marca, modelo..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={searchAvailableDevices}
                  className="px-3 py-2 bg-red-600 text-white border border-red-600 rounded-r-md hover:bg-red-700 transition-colors"
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <select
              value={retireFormData.device_id}
              onChange={(e) => setRetireFormData({ ...retireFormData, device_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value={0}>Seleccionar dispositivo...</option>
              {availableDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.brand} {device.model} ({device.serial_number})
                </option>
              ))}
            </select>
            
            {/* Información de paginación y botón para cargar más */}
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {availableDevices.length === 0 ? (
                  "No hay dispositivos disponibles para dar de baja"
                ) : (
                  <>Mostrando {availableDevices.length} dispositivos disponibles</>
                )}
              </div>
            </div>
            
            {availableDevices.length === 0 && !isLoadingAvailableDevices && (
              <p className="text-xs text-amber-600 mt-1">
                No hay dispositivos disponibles para dar de baja
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón *
            </label>
            <input
              type="text"
              value={retireFormData.reason}
              onChange={(e) => setRetireFormData({ ...retireFormData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Razón por la cual se da de baja el dispositivo"
              minLength={5}
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={retireFormData.status}
              onChange={(e) => setRetireFormData({ ...retireFormData, status: e.target.value as 'retired' | 'disposed' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="retired">Dado de Baja (puede ser restaurado)</option>
              <option value="disposed">Desechado (no puede ser restaurado)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              value={retireFormData.notes}
              onChange={(e) => setRetireFormData({ ...retireFormData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Información adicional sobre la baja del dispositivo"
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsRetireModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Dar de Baja
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para actualizar dispositivo dado de baja */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Actualizar Dispositivo Dado de Baja"
      >
        {selectedRetiredDevice && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900">Dispositivo:</h4>
              <p className="text-sm text-gray-600">
                {selectedRetiredDevice.Device?.name} - {selectedRetiredDevice.Device?.serial_number}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={updateFormData.status}
                onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value as 'retired' | 'disposed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="retired">Dado de Baja (puede ser restaurado)</option>
                <option value="disposed">Desechado (no puede ser restaurado)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={updateFormData.notes}
                onChange={(e) => setUpdateFormData({ ...updateFormData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Actualizar información adicional"
                maxLength={1000}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal para ver detalles del dispositivo */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingDevice(null);
        }}
        title="Detalles del Dispositivo Dado de Baja"
      >
        {viewingDevice && (
          <div className="space-y-6">
            {/* Información del Dispositivo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Información del Dispositivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre:</label>
                  <p className="text-gray-900 font-medium">{viewingDevice.Device?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo:</label>
                  <p className="text-gray-900">{viewingDevice.Device?.TypeDevice?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca:</label>
                  <p className="text-gray-900">{viewingDevice.Device?.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modelo:</label>
                  <p className="text-gray-900">{viewingDevice.Device?.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Serie:</label>
                  <p className="text-gray-900 font-mono">{viewingDevice.Device?.serial_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Placa:</label>
                  <p className="text-gray-900">{viewingDevice.Device?.plate_device || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Información de la Baja */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Información de Baja
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado:</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    viewingDevice.status === 'retired'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {viewingDevice.status === 'retired' ? 'Dado de Baja' : 'Desechado'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Baja:</label>
                  <p className="text-gray-900 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(viewingDevice.retired_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Razón:</label>
                  <p className="text-gray-900 mt-1">{viewingDevice.reason}</p>
                </div>
                {viewingDevice.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Notas:</label>
                    <p className="text-gray-900 mt-1">{viewingDevice.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Usuario que dio de baja */}
            {viewingDevice.retiredBy && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Dado de Baja Por
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre:</label>
                    <p className="text-gray-900 font-medium">{viewingDevice.retiredBy.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{viewingDevice.retiredBy.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-between pt-4">
              {viewingDevice.status === 'retired' && (
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingDevice(null);
                    handleRestore(viewingDevice);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurar Dispositivo</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingDevice(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ml-auto"
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
