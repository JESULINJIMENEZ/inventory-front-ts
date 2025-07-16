import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { reportService } from '../services/reportService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Users, 
  Monitor, 
  FileText, 
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await reportService.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Error al cargar los datos del dashboard'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [addNotification]);

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
        <p className="text-gray-500">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const { summary, charts } = dashboardData;

  const stats = [
    {
      name: 'Asignaciones Activas',
      value: summary.activeAssignments,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+4.75%'
    },
    {
      name: 'Dispositivos Disponibles',
      value: summary.availableDevices,
      icon: Monitor,
      color: 'bg-green-500',
      change: '+2.30%'
    },
    {
      name: 'Total Asignaciones',
      value: summary.totalAssignments,
      icon: Activity,
      color: 'bg-purple-500',
      change: '+8.20%'
    },
    {
      name: 'Utilización',
      value: summary.deviceUtilization,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+1.40%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Actualizado: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs. mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments by Month */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Asignaciones por Mes
          </h3>
          <div className="space-y-3">
            {charts.assignmentsByMonth.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date(item.month).toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usuarios Más Activos
          </h3>
          <div className="space-y-3">
            {charts.topUsers.map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.User.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {user.assignment_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Devices */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dispositivos Más Utilizados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.topDevices.map((device) => (
            <div key={device.device_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Monitor className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-blue-600">
                  {device.assignment_count} asignaciones
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                {device.Device.name}
              </h4>
              <p className="text-sm text-gray-500">
                {device.Device.brand} {device.Device.model}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};