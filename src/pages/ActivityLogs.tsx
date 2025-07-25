import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import { Table } from '../components/common/Table';
import { SearchInput } from '../components/common/SearchInput';
import { useNotification } from '../contexts/NotificationContext';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { Activity, User as UserIcon, FileText, Monitor, ChevronDown, ChevronRight } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'by-entity' | 'by-user'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { addNotification } = useNotification();

  // Memoizar los parámetros del hook para evitar recreaciones
  const hookParams = useMemo(() => ({
    viewMode,
    entityFilter,
    actionFilter,
    userIdFilter,
    entityIdFilter,
    searchQuery
  }), [viewMode, entityFilter, actionFilter, userIdFilter, entityIdFilter, searchQuery]);

  const {
    logs,
    isLoading,
    currentPage,
    totalPages,
    total,
    error,
    setCurrentPage
  } = useActivityLogs(hookParams);

  // Mostrar error si existe
  React.useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        message: error
      });
    }
  }, [error, addNotification]);

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

  const renderDataChanges = (log: ActivityLog) => {
    const isExpanded = expandedRows.has(log.id);
    
    if (!log.previous_data && !log.new_data) return null;

    const toggleExpanded = () => {
      const newExpandedRows = new Set(expandedRows);
      if (isExpanded) {
        newExpandedRows.delete(log.id);
      } else {
        newExpandedRows.add(log.id);
      }
      setExpandedRows(newExpandedRows);
    };

    return (
      <div className="text-xs text-gray-500 mt-1">
        <button
          onClick={toggleExpanded}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 mr-1" />
          ) : (
            <ChevronRight className="h-3 w-3 mr-1" />
          )}
          {isExpanded ? 'Ocultar' : 'Ver'} cambios
        </button>
        
        {isExpanded && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            {log.previous_data && (
              <div className="mb-2">
                <span className="font-medium text-red-600">Datos anteriores:</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                  {JSON.stringify(log.previous_data, null, 2)}
                </pre>
              </div>
            )}
            {log.new_data && (
              <div>
                <span className="font-medium text-green-600">Datos nuevos:</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                  {JSON.stringify(log.new_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
        <div className="text-sm text-gray-900 max-w-xs">
          <div className="truncate">
            {log.description}
          </div>
          {renderDataChanges(log)}
        </div>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Actividad</h1>
          <p className="text-sm text-gray-600 mt-1">
            {viewMode === 'all' && 'Vista general de todas las actividades'}
            {viewMode === 'by-entity' && 'Vista filtrada por entidad específica'}
            {viewMode === 'by-user' && 'Vista filtrada por usuario específico'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-500">
            Registro de todas las actividades del sistema
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Botones de acceso rápido */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultas rápidas
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setViewMode('all');
                setEntityFilter('assignment');
                setActionFilter('assign');
                setUserIdFilter('');
                setEntityIdFilter('');
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
            >
              Asignaciones creadas
            </button>
            <button
              onClick={() => {
                setViewMode('all');
                setEntityFilter('assignment');
                setActionFilter('return');
                setUserIdFilter('');
                setEntityIdFilter('');
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200"
            >
              Devoluciones
            </button>
            <button
              onClick={() => {
                setViewMode('all');
                setEntityFilter('assignment');
                setActionFilter('delete');
                setUserIdFilter('');
                setEntityIdFilter('');
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200"
            >
              Asignaciones eliminadas
            </button>
            <button
              onClick={() => {
                setViewMode('all');
                setEntityFilter('');
                setActionFilter('');
                setUserIdFilter('');
                setEntityIdFilter('');
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Selector de modo de vista */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de vista
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'all' | 'by-entity' | 'by-user')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los logs</option>
            <option value="by-entity">Por entidad específica</option>
            <option value="by-user">Por usuario específico</option>
          </select>
        </div>

        {/* Filtros dinámicos según el modo */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar en logs..."
            className="md:col-span-1"
          />
          
          {/* Filtros comunes */}
          {viewMode === 'all' && (
            <>
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
              <input
                type="number"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                placeholder="ID de usuario"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Filtros para vista por entidad */}
          {viewMode === 'by-entity' && (
            <>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar entidad</option>
                <option value="user">Usuario</option>
                <option value="device">Dispositivo</option>
                <option value="assignment">Asignación</option>
              </select>
              <input
                type="number"
                value={entityIdFilter}
                onChange={(e) => setEntityIdFilter(e.target.value)}
                placeholder="ID de entidad"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </>
          )}

          {/* Filtros para vista por usuario */}
          {viewMode === 'by-user' && (
            <input
              type="number"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="ID de usuario"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
        </div>

        {/* Información adicional */}
        {total > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {logs.length} de {total} logs
            {viewMode === 'by-entity' && entityFilter && entityIdFilter && (
              <span> para {formatEntity(entityFilter)} ID: {entityIdFilter}</span>
            )}
            {viewMode === 'by-user' && userIdFilter && (
              <span> del usuario ID: {userIdFilter}</span>
            )}
          </div>
        )}

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