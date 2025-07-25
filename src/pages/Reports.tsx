import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { reportService } from '../services/reportService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Monitor, 
  FileText, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const { addNotification } = useNotification();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Error al cargar los reportes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReport = async (type: string) => {
    try {
      addNotification({
        type: 'info',
        message: 'Generando reporte...'
      });
      
      // Simulate report generation
      setTimeout(() => {
        addNotification({
          type: 'success',
          message: 'Reporte generado exitosamente'
        });
      }, 2000);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Error al generar el reporte'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar los datos de reportes</p>
      </div>
    );
  }

  const { summary, charts } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-500">
            Análisis y estadísticas del sistema
          </span>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Fecha</h3>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Asignaciones Activas</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dispositivos Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{summary.availableDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Asignaciones</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Utilización</p>
              <p className="text-2xl font-bold text-gray-900">{summary.deviceUtilization}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tendencia de Asignaciones</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {charts.assignmentsByMonth.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(item.month).toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(item.count / Math.max(...charts.assignmentsByMonth.map(m => m.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Devices */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dispositivos Más Utilizados</h3>
            <Monitor className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {charts.topDevices.map((device, index) => (
              <div key={device.device_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {device.Device.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {device.Device.brand} {device.Device.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {device.assignment_count}
                  </span>
                  <span className="text-xs text-gray-500">asignaciones</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Downloads */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Descargar Reportes</h3>
          <Download className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => downloadReport('assignments')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium">Reporte de Asignaciones</span>
          </button>
          <button
            onClick={() => downloadReport('devices')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Monitor className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium">Reporte de Dispositivos</span>
          </button>
          <button
            onClick={() => downloadReport('users')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium">Reporte de Usuarios</span>
          </button>
        </div>
      </div>
    </div>
  );
};