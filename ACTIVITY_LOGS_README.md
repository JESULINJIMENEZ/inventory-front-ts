# Activity Logs - Nuevas Funcionalidades

## Descripción

Se han implementado nuevas rutas y funcionalidades en el sistema de logs de actividad para permitir consultas más específicas y detalladas.

## Nuevas Rutas Implementadas

### 1. Logs por Entidad Específica
**Endpoint**: `/admin/activity-logs/entity/{entity}/{entity_id}`

**Ejemplo**: `/admin/activity-logs/entity/assignment/1`

**Respuesta**:
```json
{
  "entity": "assignment",
  "entity_id": "1",
  "logs": [...],
  "total": 3,
  "currentPage": 1,
  "totalPages": 1
}
```

### 2. Logs Filtrados por Entidad y Acción
**Endpoint**: `/admin/activity-logs?entity={entity}&action={action}&page={page}&limit={limit}`

**Ejemplo**: `/admin/activity-logs?entity=assignment&action=assign&page=1&limit=10`

### 3. Logs por Usuario
**Endpoint**: `/admin/activity-logs?user_id={user_id}&page={page}&limit={limit}`

**Ejemplo**: `/admin/activity-logs?user_id=3&page=1&limit=10`

### 4. Logs Generales con Paginación
**Endpoint**: `/admin/activity-logs?page={page}&limit={limit}`

## Funcionalidades de la Interfaz

### Modos de Vista
1. **Todos los logs**: Vista general con filtros básicos
2. **Por entidad específica**: Consulta logs de una entidad particular por ID
3. **Por usuario específico**: Consulta logs de un usuario particular

### Filtros Disponibles
- **Búsqueda textual**: Campo de búsqueda general
- **Filtro por entidad**: Usuario, Dispositivo, Asignación
- **Filtro por acción**: Crear, Actualizar, Eliminar, Asignar, Devolver, Transferir
- **ID de usuario**: Filtro numérico por ID de usuario
- **ID de entidad**: Filtro numérico por ID de entidad (en modo por entidad)

### Consultas Rápidas
Botones preconfigurados para accesos rápidos:
- **Asignaciones creadas**: `entity=assignment&action=assign`
- **Devoluciones**: `entity=assignment&action=return`
- **Asignaciones eliminadas**: `entity=assignment&action=delete`
- **Limpiar filtros**: Resetea todos los filtros

### Visualización de Datos
- **Tabla responsive** con información básica del log
- **Detalles expandibles** para ver `previous_data` y `new_data`
- **Códigos de color** para diferentes tipos de acciones
- **Iconos** para diferentes tipos de entidades
- **Paginación** con navegación entre páginas
- **Contador** de registros totales y actuales

### Información de Cambios
Para logs que contienen datos de cambio:
- **Datos anteriores**: Mostrados en rojo con formato JSON
- **Datos nuevos**: Mostrados en verde con formato JSON
- **Vista expandible**: Click para mostrar/ocultar detalles completos

## Estructura de Archivos

### Archivos Modificados
1. `src/services/activityLogService.ts` - Nuevos métodos de servicio
2. `src/pages/ActivityLogs.tsx` - Interfaz actualizada con nuevas funcionalidades

### Archivos Nuevos
1. `src/hooks/useActivityLogs.ts` - Hook personalizado para manejo de logs

## Uso del Hook personalizado

```typescript
import { useActivityLogs } from '../hooks/useActivityLogs';

const {
  logs,
  isLoading,
  currentPage,
  totalPages,
  total,
  error,
  setCurrentPage
} = useActivityLogs({
  viewMode: 'all',
  entityFilter: 'assignment',
  actionFilter: 'assign',
  userIdFilter: '',
  entityIdFilter: '',
  searchQuery: ''
});
```

## Métodos del Servicio

### `getActivityLogs(params?)`
Obtiene logs con filtros opcionales
```typescript
await activityLogService.getActivityLogs({
  page: 1,
  limit: 10,
  entity: 'assignment',
  action: 'assign',
  user_id: 123
});
```

### `getLogsByEntity(entity, entityId, params?)`
Obtiene logs de una entidad específica
```typescript
await activityLogService.getLogsByEntity('assignment', 1, {
  page: 1,
  limit: 10
});
```

### `getLogsByUser(userId, params?)`
Obtiene logs de un usuario específico
```typescript
await activityLogService.getLogsByUser(123, {
  page: 1,
  limit: 10
});
```

### `getLogsByEntityAndAction(entity, action, params?)`
Obtiene logs filtrados por entidad y acción
```typescript
await activityLogService.getLogsByEntityAndAction('assignment', 'assign', {
  page: 1,
  limit: 10
});
```

## Características Técnicas

- **Debounce**: Búsquedas con delay de 300ms para optimización
- **Manejo de errores**: Notificaciones automáticas en caso de errores
- **Estado persistente**: Los filtros se mantienen durante la navegación
- **Responsive**: Interfaz adaptable a diferentes tamaños de pantalla
- **TypeScript**: Tipado completo para mayor seguridad
