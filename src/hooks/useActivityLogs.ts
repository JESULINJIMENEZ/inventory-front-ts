import { useState, useEffect, useRef } from 'react';
import { ActivityLog } from '../types';
import { activityLogService } from '../services/activityLogService';

interface UseActivityLogsParams {
  viewMode: 'all' | 'by-entity' | 'by-user';
  entityFilter: string;
  actionFilter: string;
  userIdFilter: string;
  entityIdFilter: string;
  searchQuery: string;
}

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  error: string | null;
  fetchLogs: (page?: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useActivityLogs = (params: UseActivityLogsParams): UseActivityLogsReturn => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // Usar useRef para evitar dependencias circulares
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      let response;
      
      const currentParams = paramsRef.current;
      const { viewMode, entityFilter, actionFilter, userIdFilter, entityIdFilter } = currentParams;

      if (viewMode === 'by-entity' && entityFilter && entityIdFilter) {
        const entityResponse = await activityLogService.getLogsByEntity(
          entityFilter, 
          parseInt(entityIdFilter),
          { page, limit: 10 }
        );
        setLogs(entityResponse.logs);
        setTotalPages(entityResponse.totalPages);
        setCurrentPage(entityResponse.currentPage);
        setTotal(entityResponse.total);
      } else if (viewMode === 'by-user' && userIdFilter) {
        response = await activityLogService.getLogsByUser(
          parseInt(userIdFilter),
          { page, limit: 10 }
        );
        setLogs(response.data);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        setTotal(response.total);
      } else {
        response = await activityLogService.getActivityLogs({
          page,
          limit: 10,
          entity: entityFilter || undefined,
          action: actionFilter || undefined,
          user_id: userIdFilter ? parseInt(userIdFilter) : undefined
        });
        setLogs(response.data);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        setTotal(response.total);
      }
    } catch (error: any) {
      setError('Error al cargar los logs de actividad');
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect que maneja todas las llamadas con debounce apropiado
  useEffect(() => {
    const shouldDebounce = params.searchQuery.length > 0;
    
    const executeSearch = () => {
      setCurrentPage(1);
      fetchLogs(1);
      setHasInitiallyLoaded(true);
    };

    if (shouldDebounce) {
      const debounceTimer = setTimeout(executeSearch, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      executeSearch();
    }
  }, [
    params.viewMode,
    params.entityFilter,
    params.actionFilter,
    params.userIdFilter,
    params.entityIdFilter,
    params.searchQuery
  ]);

  // useEffect separado para manejar cambios de página
  useEffect(() => {
    // Solo ejecutar después de la carga inicial
    if (hasInitiallyLoaded) {
      fetchLogs(currentPage);
    }
  }, [currentPage, hasInitiallyLoaded]);

  return {
    logs,
    isLoading,
    currentPage,
    totalPages,
    total,
    error,
    fetchLogs,
    setCurrentPage,
  };
};
