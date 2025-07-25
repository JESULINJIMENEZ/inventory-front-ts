import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Device, DeviceType, DeviceWithUser } from '../types';
import { deviceService } from '../services/deviceService';
import { deviceTypeService } from '../services/deviceTypeService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Edit, Trash2, Monitor, CheckCircle, XCircle, Eye } from 'lucide-react';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<DeviceWithUser | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type_device_id: 0,
    brand: '',
    model: '',
    serial_number: '',
    status: true,
    description: '',
    plate_device: ''
  });
  const { addNotification } = useNotification();

  const fetchDevices = async (page = 1, search = '', status?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching devices...', { page, search, status });
      
      const params: any = {
        page,
        limit: 10
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      if (status !== undefined) {
        params.status = status;
      }
      
      const response = await deviceService.getDevices(params);
      
      console.log('Devices response:', response);
      setDevices(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar dispositivos';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      setDevices([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      console.log('Fetching device types...');
      const response = await deviceTypeService.getDeviceTypes();
      console.log('Device types response:', response);
      setDeviceTypes(response);
    } catch (error: any) {
      console.error('Error fetching device types:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar tipos de dispositivos'
      });
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchDeviceTypes();
    setHasInitiallyLoaded(true);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
      fetchDevices(1, searchQuery, statusFilter);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter]);

  // Effect separado para manejar cambios de página
  useEffect(() => {
    // Solo ejecutar después de la carga inicial
    if (hasInitiallyLoaded) {
      fetchDevices(currentPage, searchQuery, statusFilter);
    }
  }, [currentPage, hasInitiallyLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await deviceService.updateDevice(editingDevice.id, formData);
        addNotification({
          type: 'success',
          message: 'Dispositivo actualizado exitosamente'
        });
      } else {
        await deviceService.createDevice(formData);
        addNotification({
          type: 'success',
          message: 'Dispositivo creado exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingDevice(null);
      resetForm();
      fetchDevices(currentPage, searchQuery, statusFilter);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar dispositivo'
      });
    }
  };

  const handleDelete = async (device: Device) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${device.name}?`)) {
      try {
        await deviceService.deleteDevice(device.id);
        addNotification({
          type: 'success',
          message: 'Dispositivo eliminado exitosamente'
        });
        fetchDevices(currentPage, searchQuery, statusFilter);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Error al eliminar dispositivo'
        });
      }
    }
  };

  const handleViewDevice = async (device: Device) => {
    try {
      const response = await deviceService.getDeviceWithUser(device.id);
      setViewingDevice(response.device);
      setIsViewModalOpen(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar detalles del dispositivo'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type_device_id: deviceTypes.length > 0 ? deviceTypes[0].id : 0,
      brand: '',
      model: '',
      serial_number: '',
      status: true,
      description: '',
      plate_device: ''
    });
  };

  const openModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        name: device.name,
        type_device_id: device.type_device_id,
        brand: device.brand,
        model: device.model,
        serial_number: device.serial_number,
        status: device.status,
        description: device.description || '',
        plate_device: device.plate_device || ''
      });
    } else {
      setEditingDevice(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (device: Device) => (
        <div className="flex items-center">
          <Monitor className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{device.name}</span>
        </div>
      )
    },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'serial_number', label: 'Número de Serie' },
    { key: 'plate_device', label: 'Placa' },
    {
      key: 'status',
      label: 'Estado',
      render: (device: Device) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          device.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {device.status ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Asignado
            </>
          )}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (device: Device) => (
        <div className="flex space-x-2">
          {!device.status && (
            <button
              onClick={() => handleViewDevice(device)}
              className="text-green-600 hover:text-green-800"
              title="Ver detalles del dispositivo asignado"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => openModal(device)}
            className="text-blue-600 hover:text-blue-800"
            title="Editar dispositivo"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(device)}
            className="text-red-600 hover:text-red-800"
            title="Eliminar dispositivo"
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
        resetError={() => {
          setError(null);
          fetchDevices();
          fetchDeviceTypes();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Dispositivos</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Dispositivo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar dispositivos por nombre, marca, modelo o serial..."
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
            <option value="true">Disponible</option>
            <option value="false">Asignado</option>
          </select>
        </div>

        {/* Información de paginación */}
        {devices.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} de {total} dispositivos
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (filtrado por "{searchQuery}")
              </span>
            )}
            {statusFilter !== undefined && (
              <span className="ml-2 text-blue-600">
                (estado: {statusFilter ? 'Disponible' : 'Asignado'})
              </span>
            )}
          </div>
        )}

        <Table
          data={devices}
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
              ? `No se encontraron dispositivos que coincidan con "${searchQuery}"`
              : "No hay dispositivos registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title="No hay dispositivos registrados"
                description="Comienza agregando el primer dispositivo al sistema"
                icon={
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-blue-600" />
                  </div>
                }
                actionLabel="Crear primer dispositivo"
                onAction={() => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* Device Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDevice ? 'Editar Dispositivo' : 'Crear Dispositivo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Dispositivo *
              </label>
              <select
                value={formData.type_device_id}
                onChange={(e) => setFormData({ ...formData, type_device_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Seleccionar tipo...</option>
                {deviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {deviceTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No hay tipos de dispositivos disponibles. 
                  <Link to="/device-types" className="text-blue-600 hover:underline ml-1">
                    Crear tipos de dispositivos
                  </Link>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status.toString()}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Disponible</option>
                <option value="false">Asignado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Dell, HP, Lenovo..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Latitude 5520, ThinkPad X1..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Serie *
            </label>
            <input
              type="text"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número de serie único del dispositivo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa del Dispositivo
            </label>
            <input
              type="text"
              value={formData.plate_device}
              onChange={(e) => setFormData({ ...formData, plate_device: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Placa o código del dispositivo (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional del dispositivo"
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
              {editingDevice ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Device View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingDevice(null);
        }}
        title="Detalles del Dispositivo"
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
                  <p className="text-gray-900 font-medium">{viewingDevice.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo:</label>
                  <p className="text-gray-900">{viewingDevice.type_device.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca:</label>
                  <p className="text-gray-900">{viewingDevice.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modelo:</label>
                  <p className="text-gray-900">{viewingDevice.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Serie:</label>
                  <p className="text-gray-900 font-mono">{viewingDevice.serial_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Placa:</label>
                  <p className="text-gray-900">{viewingDevice.plate_device || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado:</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    viewingDevice.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingDevice.status ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disponible
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Asignado
                      </>
                    )}
                  </span>
                </div>
              </div>
              {viewingDevice.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Descripción:</label>
                  <p className="text-gray-900 mt-1">{viewingDevice.description}</p>
                </div>
              )}
            </div>

            {/* Información del Usuario Asignado */}
            {viewingDevice.assigned_user && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Usuario Asignado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre:</label>
                    <p className="text-gray-900 font-medium">{viewingDevice.assigned_user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{viewingDevice.assigned_user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">DNI:</label>
                    <p className="text-gray-900 font-mono">{viewingDevice.assigned_user.dni}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de cerrar */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingDevice(null);
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