import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Device, DeviceType, DeviceWithUser, DeviceTypeRequiredFields } from '../types';
import { deviceService } from '../services/deviceService';
import { deviceTypeService } from '../services/deviceTypeService';
import { validateDeviceSpecificFields, validateWarrantyFields, validatePurchaseDate } from '../utils/deviceValidation';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { transformArrayForDisplay } from '../utils/displayTransform';
import { Plus, Edit, Trash2, Monitor, CheckCircle, XCircle, Eye, HardDrive, Cpu, Calendar, Shield, Search } from 'lucide-react';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [requiredFields, setRequiredFields] = useState<DeviceTypeRequiredFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Estado temporal for el input
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<DeviceWithUser | null>(null);
  const [retiringDevice, setRetiringDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [retireData, setRetireData] = useState({
    reason: '',
    notes: '',
    status: 'retired' as 'retired' | 'disposed'
  });
  const [formData, setFormData] = useState({
    name: '',
    type_device_id: 0,
    brand: '',
    model: '',
    serial_number: '',
    status: true,
    description: '',
    plate_device: '',
    // Campos específicos
    storage: '',
    ram: '',
    processor: '',
    dvr_storage: '',
    // Campos de garantía y compra
    purchase_date: '',
    warranty_duration: '',
    warranty_unit: 'years' as 'years' | 'months'
  });
  const { addNotification } = useNotification();

  // Función para ejecutar búsqueda manual
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  // Sincronizar searchInput con searchQuery al cargar
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const loadRequiredFields = async (typeDeviceId: number) => {
    if (typeDeviceId <= 0) {
      setRequiredFields(null);
      return;
    }
    
    try {
      const fields = await deviceTypeService.getRequiredFields(typeDeviceId);
      setRequiredFields(fields);
    } catch (error: any) {
      console.error('Error loading required fields:', error);
      // No mostrar error al usuario, los campos específicos son opcionales
      setRequiredFields(null);
    }
  };

  const validateSpecificFields = (): string[] => {
    const errors: string[] = [];
    
    // Validar campos específicos por tipo de dispositivo
    if (requiredFields && requiredFields.required_fields.length > 0) {
      const validation = validateDeviceSpecificFields(formData, requiredFields.required_fields);
      errors.push(...validation.errors);
    }
    
    // Validar fecha de compra
    if (formData.purchase_date) {
      const purchaseDateValidation = validatePurchaseDate(formData.purchase_date);
      if (!purchaseDateValidation.isValid && purchaseDateValidation.error) {
        errors.push(purchaseDateValidation.error);
      }
    }
    
    // Validar campos de garantía
    if (formData.warranty_duration || formData.warranty_unit) {
      const warrantyValidation = validateWarrantyFields(formData.warranty_duration, formData.warranty_unit);
      if (!warrantyValidation.isValid && warrantyValidation.error) {
        errors.push(warrantyValidation.error);
      }
    }
    
    return errors;
  };

  const handleTypeChange = (typeDeviceId: number) => {
    setFormData({ ...formData, type_device_id: typeDeviceId });
    loadRequiredFields(typeDeviceId);
  };

  const fetchDevices = async (page = 1, search = '', status?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching devices...', { page, search, status });
      
      const response = await deviceService.getDevicesWithPagination(page, 10, search);
      
      console.log('Devices response:', response);
      setDevices(transformArrayForDisplay(response.devices));
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
      setCurrentPage(response.pagination.page);
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

  // Effect para búsqueda manual (solo cuando cambia searchQuery o statusFilter)
  useEffect(() => {
    if (hasInitiallyLoaded) {
      setCurrentPage(1);
      fetchDevices(1, searchQuery, statusFilter);
    }
  }, [searchQuery, statusFilter, hasInitiallyLoaded]);

  // Effect separado para manejar cambios de página
  useEffect(() => {
    if (hasInitiallyLoaded) {
      fetchDevices(currentPage, searchQuery, statusFilter);
    }
  }, [currentPage, hasInitiallyLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos específicos
    const validationErrors = validateSpecificFields();
    if (validationErrors.length > 0) {
      addNotification({
        type: 'error',
        message: `Campos específicos faltantes: ${validationErrors.join(', ')}`
      });
      return;
    }
    
    try {
      // Preparar datos del dispositivo
      const devicePayload: any = { ...formData };
      
      // Convertir warranty_duration de string a number
      if (devicePayload.warranty_duration && devicePayload.warranty_duration.trim()) {
        devicePayload.warranty_duration = parseInt(devicePayload.warranty_duration);
      } else {
        delete devicePayload.warranty_duration;
      }
      
      // Limpiar campos específicos vacíos para evitar enviar strings vacías
      if (!devicePayload.storage?.trim()) delete devicePayload.storage;
      if (!devicePayload.ram?.trim()) delete devicePayload.ram;
      if (!devicePayload.processor?.trim()) delete devicePayload.processor;
      if (!devicePayload.dvr_storage?.trim()) delete devicePayload.dvr_storage;
      if (!devicePayload.purchase_date?.trim()) delete devicePayload.purchase_date;
      if (!devicePayload.warranty_unit?.trim()) delete devicePayload.warranty_unit;
      
      if (editingDevice) {
        await deviceService.updateDevice(editingDevice.id, devicePayload);
        addNotification({
          type: 'success',
          message: 'Dispositivo actualizado exitosamente'
        });
      } else {
        await deviceService.createDevice(devicePayload);
        addNotification({
          type: 'success',
          message: 'Dispositivo creado exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingDevice(null);
      setRequiredFields(null);
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
    setRetiringDevice(device);
    setIsRetireModalOpen(true);
    setRetireData({
      reason: '',
      notes: '',
      status: 'retired'
    });
  };

  const handleRetireDevice = async () => {
    if (!retiringDevice) return;

    if (!retireData.reason.trim()) {
      addNotification({
        type: 'error',
        message: 'La razón del retiro es obligatoria'
      });
      return;
    }

    if (retireData.reason.length < 5 || retireData.reason.length > 255) {
      addNotification({
        type: 'error',
        message: 'La razón debe tener entre 5 y 255 caracteres'
      });
      return;
    }

    try {
      await deviceService.retireDevice(
        retiringDevice.id, 
        retireData.reason, 
        retireData.notes || undefined, 
        retireData.status
      );
      addNotification({
        type: 'success',
        message: `Dispositivo ${retiringDevice.name} dado de baja exitosamente`
      });
      setIsRetireModalOpen(false);
      setRetiringDevice(null);
      setRetireData({ reason: '', notes: '', status: 'retired' });
      fetchDevices(currentPage, searchQuery, statusFilter);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Error al dar de baja el dispositivo'
      });
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
      plate_device: '',
      storage: '',
      ram: '',
      processor: '',
      dvr_storage: '',
      purchase_date: '',
      warranty_duration: '',
      warranty_unit: 'years'
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
        plate_device: device.plate_device || '',
        storage: device.storage || '',
        ram: device.ram || '',
        processor: device.processor || '',
        dvr_storage: device.dvr_storage || '',
        purchase_date: device.purchase_date || '',
        warranty_duration: device.warranty_duration?.toString() || '',
        warranty_unit: device.warranty_unit || 'years'
      });
      // Cargar campos requeridos para el tipo de dispositivo
      if (device.type_device_id > 0) {
        loadRequiredFields(device.type_device_id);
      }
    } else {
      setEditingDevice(null);
      resetForm();
      setRequiredFields(null);
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (device: Device) => (
        <div className="flex items-center">
          <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-sm sm:text-base truncate">{device.name}</div>
            <div className="text-xs text-gray-500 sm:hidden truncate">
              {device.brand} {device.model}
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'brand', 
      label: 'Marca',
      hideOnMobile: true
    },
    { 
      key: 'model', 
      label: 'Modelo',
      hideOnMobile: true
    },
    { 
      key: 'serial_number', 
      label: 'Serial',
      hideOnMobile: true,
      render: (device: Device) => (
        <span className="text-xs sm:text-sm font-mono">{device.serial_number}</span>
      )
    },
    { 
      key: 'plate_device', 
      label: 'Placa',
      hideOnMobile: true,
      render: (device: Device) => (
        <span className="text-xs sm:text-sm font-mono">{device.plate_device}</span>
      )
    },
    {
      key: 'specifications',
      label: 'Especificaciones',
      hideOnMobile: true,
      render: (device: Device) => (
        <div className="space-y-1 max-w-32">
          {device.storage && (
            <div className="flex items-center text-xs text-gray-600">
              <HardDrive className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{device.storage}</span>
            </div>
          )}
          {device.ram && (
            <div className="flex items-center text-xs text-gray-600">
              <Monitor className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{device.ram}</span>
            </div>
          )}
          {device.processor && (
            <div className="flex items-center text-xs text-gray-600">
              <Cpu className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate" title={device.processor}>
                {device.processor}
              </span>
            </div>
          )}
          {device.dvr_storage && (
            <div className="flex items-center text-xs text-gray-600">
              <HardDrive className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">DVR: {device.dvr_storage}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'warranty',
      label: 'Garantía',
      hideOnMobile: true,
      render: (device: Device) => (
        <div className="space-y-1 max-w-28">
          {device.purchase_date && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{new Date(device.purchase_date).toLocaleDateString()}</span>
            </div>
          )}
          {device.warranty_duration && device.warranty_unit && (
            <div className="flex items-center text-xs text-gray-600">
              <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {device.warranty_duration} {device.warranty_unit === 'years' ? 'años' : 'meses'}
              </span>
            </div>
          )}
        </div>
      )
    },
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
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Disponible</span>
              <span className="sm:hidden">Disp.</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Asignado</span>
              <span className="sm:hidden">Asign.</span>
            </>
          )}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (device: Device) => (
        <div className="flex space-x-1 sm:space-x-2">
          {!device.status && (
            <button
              onClick={() => handleViewDevice(device)}
              className="text-green-600 hover:text-green-800 p-1"
              title="Ver detalles del dispositivo asignado"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => openModal(device)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Editar dispositivo"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(device)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Dar de baja dispositivo"
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Dispositivos</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Dispositivo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Controles de búsqueda y filtros */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4">
          {/* Buscador personalizado con botón */}
          <div className="flex-1 relative">
            <div className="flex">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Buscar dispositivos..."
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                title="Buscar dispositivos"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="ml-2 px-2 sm:px-3 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Filtro de estado */}
          <select
            value={statusFilter === undefined ? 'all' : statusFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === 'all' ? undefined : value === 'true');
            }}
            className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 lg:min-w-[180px]"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Disponible</option>
            <option value="false">Asignado</option>
          </select>
        </div>

        {/* Información de paginación */}
        {devices.length > 0 && (
          <div className="mb-4 text-xs sm:text-sm text-gray-600 space-y-1">
            <div>
              Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} de {total} dispositivos
            </div>
            {(searchQuery || statusFilter !== undefined) && (
              <div className="flex flex-wrap gap-2 text-blue-600">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100">
                    Búsqueda: "{searchQuery}"
                  </span>
                )}
                {statusFilter !== undefined && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100">
                    Estado: {statusFilter ? 'Disponible' : 'Asignado'}
                  </span>
                )}
              </div>
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
                onChange={(e) => handleTypeChange(parseInt(e.target.value))}
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

          {/* Campos específicos según el tipo de dispositivo */}
          {requiredFields && requiredFields.required_fields.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredFields.required_fields.includes('storage') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {requiredFields.fields_info.storage.label} *
                    </label>
                    <input
                      type="text"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={requiredFields.fields_info.storage.example}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {requiredFields.fields_info.storage.description}
                    </p>
                  </div>
                )}
                
                {requiredFields.required_fields.includes('ram') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {requiredFields.fields_info.ram.label} *
                    </label>
                    <input
                      type="text"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={requiredFields.fields_info.ram.example}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {requiredFields.fields_info.ram.description}
                    </p>
                  </div>
                )}
                
                {requiredFields.required_fields.includes('processor') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {requiredFields.fields_info.processor.label} *
                    </label>
                    <input
                      type="text"
                      value={formData.processor}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={requiredFields.fields_info.processor.example}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {requiredFields.fields_info.processor.description}
                    </p>
                  </div>
                )}
                
                {requiredFields.required_fields.includes('dvr_storage') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {requiredFields.fields_info.dvr_storage.label} *
                    </label>
                    <input
                      type="text"
                      value={formData.dvr_storage}
                      onChange={(e) => setFormData({ ...formData, dvr_storage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={requiredFields.fields_info.dvr_storage.example}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {requiredFields.fields_info.dvr_storage.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de Garantía y Compra */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Información de Compra y Garantía
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Fecha en que se adquirió el dispositivo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración de Garantía
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.warranty_duration}
                  onChange={(e) => setFormData({ ...formData, warranty_duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 3, 12, 24..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Garantía
                </label>
                <select
                  value={formData.warranty_unit}
                  onChange={(e) => setFormData({ ...formData, warranty_unit: e.target.value as 'years' | 'months' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="years">Años</option>
                  <option value="months">Meses</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Los campos de garantía son opcionales. Si especifica duración, debe especificar la unidad.
            </p>
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

            {/* Especificaciones Técnicas */}
            {(viewingDevice.storage || viewingDevice.ram || viewingDevice.processor || viewingDevice.dvr_storage) && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-purple-600" />
                  Especificaciones Técnicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingDevice.storage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <HardDrive className="h-4 w-4 mr-1" />
                        Almacenamiento:
                      </label>
                      <p className="text-gray-900 font-medium">{viewingDevice.storage}</p>
                    </div>
                  )}
                  {viewingDevice.ram && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Monitor className="h-4 w-4 mr-1" />
                        Memoria RAM:
                      </label>
                      <p className="text-gray-900 font-medium">{viewingDevice.ram}</p>
                    </div>
                  )}
                  {viewingDevice.processor && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Cpu className="h-4 w-4 mr-1" />
                        Procesador:
                      </label>
                      <p className="text-gray-900 font-medium">{viewingDevice.processor}</p>
                    </div>
                  )}
                  {viewingDevice.dvr_storage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <HardDrive className="h-4 w-4 mr-1" />
                        Almacenamiento DVR:
                      </label>
                      <p className="text-gray-900 font-medium">{viewingDevice.dvr_storage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de Garantía y Compra */}
            {(viewingDevice.purchase_date || (viewingDevice.warranty_duration && viewingDevice.warranty_unit)) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Información de Compra y Garantía
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingDevice.purchase_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fecha de Compra:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {new Date(viewingDevice.purchase_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {viewingDevice.warranty_duration && viewingDevice.warranty_unit && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Garantía:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {viewingDevice.warranty_duration} {viewingDevice.warranty_unit === 'years' ? 'años' : 'meses'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

      {/* Modal de Retiro de Dispositivo */}
      <Modal
        isOpen={isRetireModalOpen}
        onClose={() => {
          setIsRetireModalOpen(false);
          setRetiringDevice(null);
          setRetireData({ reason: '', notes: '', status: 'retired' });
        }}
        title="Dar de Baja Dispositivo"
      >
        <div className="space-y-4">
          {retiringDevice && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Monitor className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {retiringDevice.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {retiringDevice.brand} {retiringDevice.model} - S/N: {retiringDevice.serial_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">¡Atención!</h4>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción dará de baja el dispositivo. El dispositivo no se eliminará, pero se marcará como retirado.
                  Asegúrate de que el dispositivo no esté asignado a ningún usuario antes de continuar.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón del retiro <span className="text-red-500">*</span>
            </label>
            <textarea
              value={retireData.reason}
              onChange={(e) => setRetireData({ ...retireData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
              placeholder="Describe la razón del retiro (mínimo 5 caracteres)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 5 caracteres, máximo 255 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={retireData.notes}
              onChange={(e) => setRetireData({ ...retireData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Información adicional sobre el retiro..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del dispositivo
            </label>
            <select
              value={retireData.status}
              onChange={(e) => setRetireData({ ...retireData, status: e.target.value as 'retired' | 'disposed' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="retired">Retirado (almacenado)</option>
              <option value="disposed">Desechado (eliminado físicamente)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Retirado: El dispositivo se guarda para posible reutilización. Desechado: El dispositivo se elimina físicamente.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsRetireModalOpen(false);
                setRetiringDevice(null);
                setRetireData({ reason: '', notes: '', status: 'retired' });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRetireDevice}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Dar de Baja</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};