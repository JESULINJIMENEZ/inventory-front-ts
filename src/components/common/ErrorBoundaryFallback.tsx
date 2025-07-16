import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetError, 
  message = 'Ha ocurrido un error inesperado' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {message}
          </h3>
          
          {error && (
            <p className="mt-2 text-sm text-gray-500">
              {error.message}
            </p>
          )}
          
          <div className="mt-6 flex flex-col space-y-3">
            {resetError && (
              <button
                onClick={resetError}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Recargar página
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Volver al dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryFallback;
