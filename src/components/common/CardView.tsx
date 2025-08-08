import React, { ReactNode } from 'react';

interface CardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  content: ReactNode;
  actions?: ReactNode;
  status?: {
    label: string;
    color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
  };
  icon?: ReactNode;
}

interface CardViewProps {
  items: CardItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  className?: string;
}

const statusColors = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
};

export const CardView: React.FC<CardViewProps> = ({
  items,
  isLoading = false,
  emptyMessage = 'No hay elementos para mostrar',
  emptyComponent,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    if (emptyComponent) {
      return <div className="text-center py-12">{emptyComponent}</div>;
    }
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center min-w-0 flex-1">
                {item.icon && (
                  <div className="flex-shrink-0 mr-3">
                    {item.icon}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {item.status && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status.color]} flex-shrink-0`}>
                  {item.status.label}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="mb-3">
              {item.content}
            </div>

            {/* Actions */}
            {item.actions && (
              <div className="flex justify-end pt-3 border-t border-gray-100">
                {item.actions}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
