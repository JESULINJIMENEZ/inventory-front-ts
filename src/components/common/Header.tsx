import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-3 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {/* Botón de menú para móvil */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 truncate">
              Sistema de Logística e Inventario
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            <div className="sm:hidden">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="hidden sm:block text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};