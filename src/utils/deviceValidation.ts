/**
 * Utilidades para validación de campos específicos de dispositivos
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida el formato del almacenamiento para portátiles
 * Formato esperado: "[Capacidad] [Tipo]" - Ej: "256GB SSD", "1TB HDD"
 */
export const validateStorage = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'El almacenamiento es requerido' };
  }

  const storagePattern = /^\d+\s*(GB|TB)\s*(SSD|HDD|NVMe|eMMC)?$/i;
  
  if (!storagePattern.test(value.trim())) {
    return { 
      isValid: false, 
      error: 'Formato inválido. Ejemplo: "256GB SSD", "1TB HDD", "512GB NVMe"' 
    };
  }

  return { isValid: true };
};

/**
 * Valida el formato de la memoria RAM
 * Formato esperado: "[Capacidad]GB [Tipo]" - Ej: "8GB DDR4", "16GB DDR5"
 */
export const validateRAM = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'La memoria RAM es requerida' };
  }

  const ramPattern = /^\d+\s*GB\s*(DDR[3-5]|LPDDR[3-5])?$/i;
  
  if (!ramPattern.test(value.trim())) {
    return { 
      isValid: false, 
      error: 'Formato inválido. Ejemplo: "8GB DDR4", "16GB DDR5", "32GB LPDDR4"' 
    };
  }

  return { isValid: true };
};

/**
 * Valida el formato del procesador
 * Formato esperado: "[Marca] [Modelo]" - Ej: "Intel Core i5-11400H", "AMD Ryzen 5 5600H"
 */
export const validateProcessor = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'El procesador es requerido' };
  }

  // Validación básica: debe tener al menos 5 caracteres y contener espacios
  if (value.trim().length < 5 || !value.trim().includes(' ')) {
    return { 
      isValid: false, 
      error: 'Formato inválido. Ejemplo: "Intel Core i5-11400H", "AMD Ryzen 5 5600H"' 
    };
  }

  return { isValid: true };
};

/**
 * Valida el formato del almacenamiento DVR
 * Formato esperado: "[Capacidad][Unidad]" - Ej: "2TB", "4TB", "500GB"
 */
export const validateDVRStorage = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'El almacenamiento DVR es requerido' };
  }

  const dvrStoragePattern = /^\d+\s*(GB|TB)$/i;
  
  if (!dvrStoragePattern.test(value.trim())) {
    return { 
      isValid: false, 
      error: 'Formato inválido. Ejemplo: "2TB", "4TB", "500GB"' 
    };
  }

  return { isValid: true };
};

/**
 * Valida un campo específico según su tipo
 */
export const validateSpecificField = (fieldName: string, value: string): ValidationResult => {
  switch (fieldName) {
    case 'storage':
      return validateStorage(value);
    case 'ram':
      return validateRAM(value);
    case 'processor':
      return validateProcessor(value);
    case 'dvr_storage':
      return validateDVRStorage(value);
    default:
      return { isValid: true };
  }
};

/**
 * Valida todos los campos específicos de un dispositivo
 */
export const validateDeviceSpecificFields = (
  data: Record<string, any>, 
  requiredFields: string[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const fieldName of requiredFields) {
    const fieldValue = data[fieldName];
    const validation = validateSpecificField(fieldName, fieldValue);
    
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
