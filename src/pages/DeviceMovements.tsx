import React, { useState, useEffect } from 'react';
import { Table } from '../components/common/Table';
import { deviceMovementService } from '../services/deviceMovementService';
import { DeviceMovement } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowUpDown, User, Monitor, Clock } from 'lucide-react';

export const DeviceMovements: React.FC = () => {
  const [movements, setMovements] = useState<DeviceMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    movement_type: '',
    device_id: '',
    user_id: '',
  });
  
  const { addNotification } = useNotification();

  const loadMovements = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };
      
      if (filters.movement_type) {
        params.movement_type = filters.movement_type;
      }
      if (filters.device_id) {
        params.device_id = parseInt(filters.device_id);
      }
      if (filters.user_id) {
        params.user_id = parseInt(filters.user_id);
      }
      
      const response = await deviceMovementService.getDeviceMovements(params);
      setMovements(response.data);
      setTotal(response.total);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cargar movimientos de dispositivos'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [page, filters]);

  const columns = [
    {
      key: 'device',
      label: 'Dispositivo',
      render: (movement: DeviceMovement) => (
        <div className="flex items-center">
          <Monitor className="h-4 w-4 mr-2 text-gray-500" />
          <span>{movement.Device?.name || `ID: ${movement.device_id}`}</span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (movement: DeviceMovement) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          <span>{movement.User?.name || `ID: ${movement.user_id}`}</span>
        </div>
      ),
    },
    {
      key: 'movement_type',
      label: 'Tipo de Movimiento',
      render: (movement: DeviceMovement) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          movement.movement_type === 'assigned' 
            ? 'bg-green-100 text-green-800'
            : movement.movement_type === 'returned'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {movement.movement_type === 'assigned' ? 'Asignado' : 
           movement.movement_type === 'returned' ? 'Devuelto' : 'Transferido'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Fecha y Hora',
      render: (movement: DeviceMovement) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <span>{new Date(movement.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Notas',
      render: (movement: DeviceMovement) => (
        <span className="text-sm text-gray-600">
          {movement.description || 'Sin descripción'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ArrowUpDown className="h-8 w-8 mr-3 text-blue-600" />
          Movimientos de Dispositivos
        </h1>
        <p className="mt-2 text-gray-600">
          Historial completo de movimientos de dispositivos en el sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="movement_type" className="block text-sm font-medium text-gray-700">
              Tipo de Movimiento
            </label>
            <select
              id="movement_type"
              value={filters.movement_type}
              onChange={(e) => setFilters({ ...filters, movement_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="assigned">Asignado</option>
              <option value="returned">Devuelto</option>
              <option value="transferred">Transferido</option>
            </select>
          </div>
          <div>
            <label htmlFor="device_id" className="block text-sm font-medium text-gray-700">
              ID del Dispositivo
            </label>
            <input
              type="number"
              id="device_id"
              value={filters.device_id}
              onChange={(e) => setFilters({ ...filters, device_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Filtrar por dispositivo"
            />
          </div>
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
              ID del Usuario
            </label>
            <input
              type="number"
              id="user_id"
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Filtrar por usuario"
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={movements}
        isLoading={loading}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(total / 10),
          onPageChange: setPage,
        }}
        emptyMessage="No se encontraron movimientos de dispositivos"
      />
    </div>
  );
};
