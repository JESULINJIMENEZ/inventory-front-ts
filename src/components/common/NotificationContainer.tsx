import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />;
      default:
        return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800 shadow-lg';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800 shadow-lg';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 shadow-lg';
      case 'info':
        return 'bg-blue-100 border-blue-300 text-blue-800 shadow-lg';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800 shadow-lg';
    }
  };

  return (
    <div className="fixed top-4 right-2 sm:right-4 z-50 space-y-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 sm:p-4 rounded-lg border-2 shadow-xl transform transition-all duration-300 ease-in-out ${getColors(notification.type)} animate-slide-in-right`}
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold break-words">
                {notification.message}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => removeNotification(notification.id)}
                className="inline-flex text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 p-0.5"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};