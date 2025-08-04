import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Monitor,
  FileText,
  BarChart3,
  Activity,
  Layers,
  ArrowUpDown,
  Building2,
  Archive,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/users', label: 'Usuarios', icon: Users },
  { path: '/areas', label: 'Áreas/Departamentos', icon: Building2 },
  { path: '/devices', label: 'Dispositivos', icon: Monitor, adminOnly: true },
  { path: '/device-types', label: 'Tipos de Dispositivos', icon: Layers, adminOnly: true },
  { path: '/assignments', label: 'Asignaciones', icon: FileText, adminOnly: true },
  { path: '/device-movements', label: 'Movimientos', icon: ArrowUpDown, adminOnly: true },
  { path: '/retired-devices', label: 'Dados de Baja', icon: Archive, adminOnly: true },
  { path: '/reports', label: 'Reportes', icon: BarChart3 },
  { path: '/activity-logs', label: 'Logs', icon: Activity, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Filtrar elementos del menú basado en el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <img 
            src="/logo salvators.png" 
            alt="Salvator's Logo" 
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-gray-800">LOGIS</span>
        </div>
      </div>
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};