import React, { useState, useEffect } from 'react';
import { DeviceType } from '../types';
import { deviceTypeService } from '../services/deviceTypeService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { transformArrayForDisplay } from '../utils/displayTransform';
import { Plus, Edit, Power, PowerOff, Layers, Archive, ArrowLeft } from 'lucide-react';

export const DeviceTypes: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [filteredDeviceTypes, setFilteredDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeviceType, setEditingDeviceType] = useState<DeviceType | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { addNotification } = useNotification();

  const fetchDeviceTypes = async (deleted: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching ${deleted ? 'deleted' : 'active'} device types...`);
      
      const response = deleted 
        ? await deviceTypeService.getDeletedDeviceTypes()
        : await deviceTypeService.getDeviceTypes();
      console.log('Device types response:', response);
      
      const transformedData = transformArrayForDisplay(response);
      setDeviceTypes(transformedData);
      setFilteredDeviceTypes(transformedData);
    } catch (error: any) {
      console.error('Error fetching device types:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar tipos de dispositivos';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      setDeviceTypes([]);
      setFilteredDeviceTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceTypes(showDeleted);
  }, [showDeleted]);

  useEffect(() => {
    const filtered = deviceTypes.filter(deviceType =>
      deviceType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deviceType.description && deviceType.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDeviceTypes(filtered);
  }, [searchQuery, deviceTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeviceType) {
        await deviceTypeService.updateDeviceType(editingDeviceType.id, formData);
        addNotification({
          type: 'success',
          message: 'Tipo de dispositivo actualizado exitosamente'
        });
      } else {
        await deviceTypeService.createDeviceType(formData);
        addNotification({
          type: 'success',
          message: 'Tipo de dispositivo creado exitosamente'
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchDeviceTypes(showDeleted);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar tipo de dispositivo'
      });
    }
  };

  const handleToggleStatus = async (deviceType: DeviceType, newStatus: boolean) => {
    const action = newStatus ? 'activar' : 'desactivar';
    const actionPast = newStatus ? 'activado' : 'desactivado';
    
    if (window.confirm(`¿Estás seguro de que quieres ${action} el tipo "${deviceType.name}"?`)) {
      try {
        await deviceTypeService.toggleDeviceTypeStatus(deviceType.id, newStatus);
        addNotification({
          type: 'success',
          message: `Tipo de dispositivo ${actionPast} exitosamente`
        });
        fetchDeviceTypes(showDeleted);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: error.response?.data?.message || `Error al ${action} tipo de dispositivo`
        });
      }
    }
  };

  const openModal = (deviceType?: DeviceType) => {
    if (deviceType) {
      setEditingDeviceType(deviceType);
      setFormData({
        name: deviceType.name,
        description: deviceType.description || ''
      });
    } else {
      setEditingDeviceType(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (deviceType: DeviceType) => (
        <div className="flex items-center">
          <Layers className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">{deviceType.name}</span>
          {showDeleted && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
              Inactivo
            </span>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (deviceType: DeviceType) => (
        <span className="text-gray-600">
          {deviceType.description || 'Sin descripción'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (deviceType: DeviceType) => (
        <div className="flex space-x-2">
          {showDeleted ? (
            // Vista de inactivos: solo mostrar activar
            <button
              onClick={() => handleToggleStatus(deviceType, true)}
              className="text-green-600 hover:text-green-800 transition-colors flex items-center space-x-1"
              title="Activar tipo de dispositivo"
            >
              <Power className="h-4 w-4" />
              <span className="text-sm">Activar</span>
            </button>
          ) : (
            // Vista activa: mostrar editar y desactivar
            <>
              <button
                onClick={() => openModal(deviceType)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Editar tipo de dispositivo"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(deviceType, false)}
                className="text-orange-600 hover:text-orange-800 transition-colors"
                title="Desactivar tipo de dispositivo"
              >
                <PowerOff className="h-4 w-4" />
              </button>
            </>
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
          fetchDeviceTypes(showDeleted);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <Layers className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            <span className="min-w-0">
              {showDeleted ? 'Tipos Inactivos' : 'Tipos de Dispositivos'}
            </span>
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            {showDeleted 
              ? 'Tipos de dispositivos desactivados del sistema'
              : 'Gestiona los tipos de dispositivos activos'
            }
          </p>
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-3 py-2 sm:px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
              showDeleted 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {showDeleted ? (
              <>
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Ver Activos</span>
                <span className="sm:hidden">Activos</span>
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Ver Inactivos</span>
                <span className="sm:hidden">Inactivos</span>
              </>
            )}
          </button>
          {!showDeleted && (
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Nuevo Tipo</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar tipos de dispositivos..."
          className="mb-4"
        />

        <Table
          data={filteredDeviceTypes}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={
            searchQuery 
              ? `No se encontraron tipos que coincidan con "${searchQuery}"`
              : showDeleted 
                ? "No hay tipos de dispositivos inactivos"
                : "No hay tipos de dispositivos registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title={showDeleted ? "No hay tipos inactivos" : "No hay tipos de dispositivos"}
                description={
                  showDeleted 
                    ? "No se han desactivado tipos de dispositivos del sistema"
                    : "Comienza agregando el primer tipo de dispositivo al sistema"
                }
                icon={
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    showDeleted ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <Layers className={`w-8 h-8 ${showDeleted ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                }
                actionLabel={showDeleted ? undefined : "Crear primer tipo"}
                onAction={showDeleted ? undefined : () => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* Device Type Modal */}
      {!showDeleted && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDeviceType ? 'Editar Tipo de Dispositivo' : 'Crear Tipo de Dispositivo'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Laptop, Desktop, Monitor..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del tipo de dispositivo..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingDeviceType ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
