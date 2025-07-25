# Solución al Problema del Bucle Infinito en Activity Logs

## Problema Identificado

El sistema estaba enviando peticiones constantes a la ruta `/admin/activity-logs?page=1&limit=10` en un bucle infinito debido a dependencias circulares en los hooks de React.

## Causa del Problema

1. **Dependencias circulares en useEffect**: El hook personalizado `useActivityLogs` tenía dependencias que se recreaban constantemente.
2. **Objeto de parámetros no estabilizado**: El objeto de parámetros pasado al hook se recreaba en cada render.
3. **useCallback con dependencias inestables**: La función `fetchLogs` incluía dependencias que cambiaban constantemente.

## Solución Implementada

### 1. Estabilización de Parámetros en el Componente

**Antes:**
```tsx
const {
  logs,
  isLoading,
  // ...
} = useActivityLogs({
  viewMode,
  entityFilter,
  actionFilter,
  userIdFilter,
  entityIdFilter,
  searchQuery
});
```

**Después:**
```tsx
const hookParams = useMemo(() => ({
  viewMode,
  entityFilter,
  actionFilter,
  userIdFilter,
  entityIdFilter,
  searchQuery
}), [viewMode, entityFilter, actionFilter, userIdFilter, entityIdFilter, searchQuery]);

const {
  logs,
  isLoading,
  // ...
} = useActivityLogs(hookParams);
```

### 2. Simplificación del Hook Personalizado

**Cambios principales:**
- Eliminación de `useCallback` y `useMemo` complejos
- Uso de `useRef` para almacenar parámetros sin causar re-renders
- `useEffect` más directo con dependencias estables

**Código del hook simplificado:**
```tsx
export const useActivityLogs = (params: UseActivityLogsParams): UseActivityLogsReturn => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ... otros estados

  // Usar useRef para evitar dependencias circulares
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchLogs = async (page = 1) => {
    // Lógica de fetch usando paramsRef.current
    const currentParams = paramsRef.current;
    // ...
  };

  useEffect(() => {
    const shouldDebounce = params.searchQuery.length > 0;
    
    const executeSearch = () => {
      setCurrentPage(1);
      fetchLogs(1);
    };

    if (shouldDebounce) {
      const debounceTimer = setTimeout(executeSearch, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      executeSearch();
    }
  }, [
    // Dependencias directas sin memoización
    params.viewMode,
    params.entityFilter,
    params.actionFilter,
    params.userIdFilter,
    params.entityIdFilter,
    params.searchQuery
  ]);
};
```

### 3. Manejo Mejorado del Debounce

- **Debounce solo para búsquedas**: Solo se aplica delay cuando hay texto en `searchQuery`
- **Ejecución inmediata para filtros**: Los cambios de filtros (selectores) se ejecutan inmediatamente
- **Reset de página**: Automáticamente vuelve a la página 1 cuando cambian los filtros

## Beneficios de la Solución

1. **Eliminación del bucle infinito**: No más peticiones constantes a la API
2. **Mejor performance**: Menos re-renders innecesarios
3. **UX mejorada**: Respuesta inmediata para filtros, debounce solo para búsqueda
4. **Código más simple**: Menos complejidad en el manejo de dependencias
5. **Mantenibilidad**: Código más fácil de entender y mantener

## Funcionamiento Actual

### Comportamiento de las Peticiones

1. **Carga inicial**: Una sola petición al montar el componente
2. **Cambio de filtros**: Petición inmediata sin delay
3. **Búsqueda de texto**: Debounce de 300ms para evitar spam
4. **Cambio de página**: Petición directa usando `fetchLogs(page)`

### Flujo de Datos

```
Usuario cambia filtro → useMemo estabiliza parámetros → 
useEffect detecta cambio → executeSearch → fetchLogs → 
API call → actualización de estado → re-render
```

## Verificación de la Solución

Para verificar que el problema está solucionado:

1. **Abrir DevTools → Network**
2. **Navegar a Activity Logs**
3. **Verificar que solo se hace una petición inicial**
4. **Cambiar filtros → verificar una petición por cambio**
5. **Escribir en búsqueda → verificar debounce de 300ms**

## Archivos Modificados

1. `src/hooks/useActivityLogs.ts` - Hook simplificado sin dependencias circulares
2. `src/pages/ActivityLogs.tsx` - Estabilización de parámetros con useMemo

## Próximos Pasos (Recomendaciones)

1. **Monitoreo**: Verificar que no aparezcan nuevos bucles
2. **Testing**: Probar todos los filtros y combinaciones
3. **Optimización adicional**: Considerar usar React Query para cache de datos
4. **Logging**: Agregar logs de desarrollo para debug futuro

## Lecciones Aprendidas

- Siempre estabilizar objetos pasados como props/parámetros a hooks
- Usar `useRef` para valores que no necesitan causar re-renders
- Separar lógica de fetch de lógica de efectos para mayor control
- El debounce debe aplicarse solo donde es necesario (búsquedas de texto)
