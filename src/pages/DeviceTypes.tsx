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
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

export const DeviceTypes: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [filteredDeviceTypes, setFilteredDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeviceType, setEditingDeviceType] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { addNotification } = useNotification();

  const fetchDeviceTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching device types...');
      
      const response = await deviceTypeService.getDeviceTypes();
      console.log('Device types response:', response);
      
      setDeviceTypes(response);
      setFilteredDeviceTypes(response);
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
    fetchDeviceTypes();
  }, []);

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
      fetchDeviceTypes();
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar tipo de dispositivo'
      });
    }
  };

  const handleDelete = async (deviceType: DeviceType) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tipo "${deviceType.name}"?`)) {
      try {
        await deviceTypeService.deleteDeviceType(deviceType.id);
        addNotification({
          type: 'success',
          message: 'Tipo de dispositivo eliminado exitosamente'
        });
        fetchDeviceTypes();
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: error.response?.data?.message || 'Error al eliminar tipo de dispositivo'
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
          <button
            onClick={() => openModal(deviceType)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(deviceType)}
            className="text-red-600 hover:text-red-800 transition-colors"
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
          fetchDeviceTypes();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Layers className="h-8 w-8 mr-3 text-blue-600" />
            Tipos de Dispositivos
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona los tipos de dispositivos disponibles en el sistema
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Tipo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
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
              : "No hay tipos de dispositivos registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title="No hay tipos de dispositivos"
                description="Comienza agregando el primer tipo de dispositivo al sistema"
                icon={
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-blue-600" />
                  </div>
                }
                actionLabel="Crear primer tipo"
                onAction={() => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* Device Type Modal */}
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
    </div>
  );
};
