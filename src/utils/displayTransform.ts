/**
 * Utilidad para transformar datos de visualización
 * Mantiene el formato original de los datos
 */

/**
 * Transforma los campos de texto de un objeto para mostrar en tablas
 */
export function transformForDisplay<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const transformed = { ...data } as any;
  
  for (const [key, value] of Object.entries(transformed)) {
    if (typeof value === 'string') {
      transformed[key] = value; // Mantener el formato original
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Para objetos anidados (como User en Assignment, Device en Assignment, etc.)
      transformed[key] = transformForDisplay(value);
    }
  }
  
  return transformed as T;
}

/**
 * Transforma un array de datos para mostrar en tablas
 */
export function transformArrayForDisplay<T extends Record<string, any>>(data: T[]): T[] {
  if (!Array.isArray(data)) {
    return data;
  }
  
  return data.map(item => transformForDisplay(item));
}

/**
 * Transforma los datos de respuesta de una API
 * Alias para transformForDisplay para compatibilidad
 */
export function transformApiResponse<T extends Record<string, any>>(data: T): T {
  return transformForDisplay(data);
}

/**
 * Transforma una respuesta paginada
 */
export function transformPaginatedResponse<T extends Record<string, any>>(response: {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}): {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
} {
  return {
    ...response,
    data: transformArrayForDisplay(response.data)
  };
}
