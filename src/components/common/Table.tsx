import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
}

export function Table<T>({
  data,
  columns,
  pagination,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  emptyComponent
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 mb-2 mx-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider ${
                    column.hideOnMobile ? 'hidden sm:table-cell' : ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              emptyComponent ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 sm:px-6 py-12">
                    {emptyComponent}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-3 sm:px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td 
                      key={column.key.toString()} 
                      className={`px-3 sm:px-6 py-4 text-sm text-gray-900 ${
                        column.hideOnMobile ? 'hidden sm:table-cell' : ''
                      } ${
                        typeof (item as any)[column.key] === 'string' && 
                        ((item as any)[column.key] as string).length > 30
                          ? 'break-all sm:break-normal'
                          : 'whitespace-nowrap'
                      }`}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key])
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200">
          {/* Paginación móvil simplificada */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
            </div>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          
          {/* Paginación desktop completa */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{pagination.currentPage}</span> de{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {/* Botón anterior */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => {
                  // Solo mostrar hasta 7 páginas para mantener el diseño limpio
                  if (pagination.totalPages <= 7) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => pagination.onPageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Para muchas páginas, mostrar solo algunas alrededor de la actual
                  const current = pagination.currentPage;
                  const shouldShow = 
                    pageNumber === 1 || 
                    pageNumber === pagination.totalPages || 
                    (pageNumber >= current - 1 && pageNumber <= current + 1);
                    
                  if (shouldShow) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => pagination.onPageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Mostrar puntos suspensivos
                  if (pageNumber === current - 2 || pageNumber === current + 2) {
                    return (
                      <span key={`ellipsis-${pageNumber}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                {/* Botón siguiente */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}