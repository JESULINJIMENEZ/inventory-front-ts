import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { activityLogService } from '../services/activityLogService';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { Activity, User as UserIcon, FileText, Monitor } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const { addNotification } = useNotification();

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await activityLogService.getActivityLogs({
        page,
        limit: 10,
        entity: entityFilter || undefined,
        action: actionFilter || undefined
      });
      setLogs(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Error al cargar los logs de actividad'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchLogs(1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, entityFilter, actionFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'assign':
        return 'bg-purple-100 text-purple-800';
      case 'return':
        return 'bg-yellow-100 text-yellow-800';
      case 'transfer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'user':
        return <UserIcon className="h-4 w-4" />;
      case 'device':
        return <Monitor className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatAction = (action: string) => {
    const actions: Record<string, string> = {
      create: 'Crear',
      update: 'Actualizar',
      delete: 'Eliminar',
      assign: 'Asignar',
      return: 'Devolver',
      transfer: 'Transferir'
    };
    return actions[action] || action;
  };

  const formatEntity = (entity: string) => {
    const entities: Record<string, string> = {
      user: 'Usuario',
      device: 'Dispositivo',
      assignment: 'Asignación'
    };
    return entities[entity] || entity;
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (log: ActivityLog) => (
        <span className="text-sm text-gray-600">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      )
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (log: ActivityLog) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{log.User?.name}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Acción',
      render: (log: ActivityLog) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
          {formatAction(log.action)}
        </span>
      )
    },
    {
      key: 'entity',
      label: 'Entidad',
      render: (log: ActivityLog) => (
        <div className="flex items-center">
          {getEntityIcon(log.entity)}
          <span className="ml-2 text-sm">{formatEntity(log.entity)}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (log: ActivityLog) => (
        <span className="text-sm text-gray-900 max-w-xs truncate">
          {log.description}
        </span>
      )
    }
  ];

  const entityOptions = [
    { value: '', label: 'Todas las entidades' },
    { value: 'user', label: 'Usuario' },
    { value: 'device', label: 'Dispositivo' },
    { value: 'assignment', label: 'Asignación' }
  ];

  const actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'create', label: 'Crear' },
    { value: 'update', label: 'Actualizar' },
    { value: 'delete', label: 'Eliminar' },
    { value: 'assign', label: 'Asignar' },
    { value: 'return', label: 'Devolver' },
    { value: 'transfer', label: 'Transferir' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Logs de Actividad</h1>
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-500">
            Registro de todas las actividades del sistema
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar en logs..."
            className="md:col-span-1"
          />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {entityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {actionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Table
          data={logs}
          columns={columns}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
          isLoading={isLoading}
          emptyMessage="No hay logs de actividad"
        />
      </div>
    </div>
  );
};