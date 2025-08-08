# Frontend Inventario - Despliegue con PM2

## Configuración Actual

- **Backend URL**: http://192.168.2.5100:3000
- **Frontend Puerto**: 4173
- **Gestor de Procesos**: PM2

## Archivos de Configuración

### Variables de Entorno
- `.env` - Configuración para desarrollo
- `.env.production` - Configuración para producción

### PM2
- `ecosystem.config.json` - Configuración de PM2

## Comandos Disponibles

### Usando el Script de Gestión
```bash
# Iniciar aplicación (construir + PM2)
./frontend-manager.sh start

# Ver estado
./frontend-manager.sh status

# Ver logs en tiempo real
./frontend-manager.sh logs

# Reiniciar (reconstruir + reiniciar PM2)
./frontend-manager.sh restart

# Detener aplicación
./frontend-manager.sh stop

# Eliminar de PM2
./frontend-manager.sh delete

# Solo construir
./frontend-manager.sh build

# Modo desarrollo
./frontend-manager.sh dev
```

### Comandos Directos

#### Desarrollo
```bash
npm run dev          # Servidor de desarrollo (puerto 5173)
npm run build        # Construir para desarrollo
npm run build:prod   # Construir para producción
npm run preview      # Vista previa del build
```

#### PM2
```bash
pm2 start ecosystem.config.json    # Iniciar con PM2
pm2 status                         # Ver estado
pm2 logs inventory-frontend        # Ver logs
pm2 restart inventory-frontend     # Reiniciar
pm2 stop inventory-frontend        # Detener
pm2 delete inventory-frontend      # Eliminar proceso
```

## URLs de Acceso

### Desarrollo
- Frontend: http://localhost:5173

### Producción (PM2)
- Frontend: http://localhost:4173
- Frontend (red local): http://[tu-ip]:4173

### Backend
- API: http://192.168.2.100:3000

## Logs

Los logs de PM2 se guardan en:
- Logs combinados: `logs/combined.log`
- Logs de salida: `logs/out.log`
- Logs de error: `logs/error.log`

## Configuración de Red

El servidor está configurado para escuchar en `0.0.0.0:4173`, lo que significa que es accesible desde cualquier IP en la red local.

## Comandos de Monitoreo

```bash
# Monitor en tiempo real de PM2
pm2 monit

# Ver información detallada
pm2 show inventory-frontend

# Ver logs con filtros
pm2 logs inventory-frontend --lines 100
```
