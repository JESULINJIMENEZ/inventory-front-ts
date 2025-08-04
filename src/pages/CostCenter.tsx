import React, { useState, useEffect } from 'react';
import { AreaDept } from '../types';
import { areaDeptService } from '../services/areaDeptService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundaryFallback } from '../components/common/ErrorBoundaryFallback';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../contexts/NotificationContext';
import { transformArrayForDisplay } from '../utils/displayTransform';
import { Plus, Edit, Trash2, Building, Hash } from 'lucide-react';

export const CostCenter: React.FC = () => {
  const [areaDepts, setAreaDepts] = useState<AreaDept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAreaDept, setEditingAreaDept] = useState<AreaDept | null>(null);
  const [formData, setFormData] = useState({
    cost_center: '',
    name: ''
  });
  const { addNotification } = useNotification();

  const fetchAreaDepts = async (search = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {};
      if (search) {
        params.name = search;
        params.cost_center = search;
      }
      
      const response = await areaDeptService.getAreas(params);
      setAreaDepts(transformArrayForDisplay(response));
    } catch (error: any) {
      console.error('Error fetching area depts:', error);
      setError(error.response?.data?.error || 'Error al cargar centros de costo');
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al cargar centros de costo'
      });
      setAreaDepts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreaDepts();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAreaDepts(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAreaDept) {
        await areaDeptService.updateArea(editingAreaDept.id, formData);
        addNotification({
          type: 'success',
          message: 'Centro de costo actualizado exitosamente'
        });
      } else {
        await areaDeptService.createArea(formData);
        addNotification({
          type: 'success',
          message: 'Centro de costo creado exitosamente'
        });
      }
      setIsModalOpen(false);
      setEditingAreaDept(null);
      resetForm();
      fetchAreaDepts(searchQuery);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al guardar centro de costo'
      });
    }
  };

  const handleDelete = async (areaDept: AreaDept) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el centro de costo "${areaDept.cost_center} - ${areaDept.name}"?`)) {
      try {
        await areaDeptService.deleteArea(areaDept.id);
        addNotification({
          type: 'success',
          message: 'Centro de costo eliminado exitosamente'
        });
        fetchAreaDepts(searchQuery);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: error.response?.data?.error || 'Error al eliminar centro de costo'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      cost_center: '',
      name: ''
    });
  };

  const openModal = (areaDept?: AreaDept) => {
    if (areaDept) {
      setEditingAreaDept(areaDept);
      setFormData({
        cost_center: areaDept.cost_center,
        name: areaDept.name
      });
    } else {
      setEditingAreaDept(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'cost_center',
      label: 'Centro de Costo',
      render: (areaDept: AreaDept) => (
        <div className="flex items-center">
          <Hash className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{areaDept.cost_center}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (areaDept: AreaDept) => (
        <div className="flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-2" />
          <span>{areaDept.name}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (areaDept: AreaDept) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openModal(areaDept)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(areaDept)}
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
        resetError={() => fetchAreaDepts(searchQuery)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Centros de Costo</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Centro de Costo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por centro de costo o nombre..."
          className="mb-4"
        />

        <Table
          data={areaDepts}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={
            searchQuery 
              ? `No se encontraron centros de costo que coincidan con "${searchQuery}"`
              : "No hay centros de costo registrados"
          }
          emptyComponent={
            !searchQuery ? (
              <EmptyState
                title="No hay centros de costo registrados"
                description="Comienza agregando el primer centro de costo al sistema"
                icon={
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                }
                actionLabel="Crear primer centro de costo"
                onAction={() => openModal()}
              />
            ) : undefined
          }
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAreaDept ? 'Editar Centro de Costo' : 'Crear Centro de Costo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Costo
            </label>
            <input
              type="text"
              value={formData.cost_center}
              onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: CC001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Administración"
              required
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
              {editingAreaDept ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
