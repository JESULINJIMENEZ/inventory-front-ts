// Cache simple para evitar peticiones repetidas
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes = 5) {
    const ttl = ttlMinutes * 60 * 1000; // Convertir a millisegundos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Verificar si el item ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Limpiar items expirados
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new SimpleCache();

// Función helper para generar claves de cache
export const getCacheKey = (url: string, params?: any) => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}${paramString}`;
};

// Limpiar cache automáticamente cada 10 minutos
setInterval(() => {
  apiCache.cleanup();
}, 10 * 60 * 1000);
