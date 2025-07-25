#!/bin/bash

# Script de gestión para el frontend del inventario
# Uso: ./frontend-manager.sh [comando]

case "$1" in
    start)
        echo "🚀 Iniciando frontend con PM2..."
        cd /home/salvatorsdev/inventory-front-ts
        npm run build:prod && pm2 start ecosystem.config.json
        ;;
    stop)
        echo "🛑 Deteniendo frontend..."
        pm2 stop inventory-frontend
        ;;
    restart)
        echo "🔄 Reiniciando frontend..."
        cd /home/salvatorsdev/inventory-front-ts
        npm run build:prod && pm2 restart inventory-frontend
        ;;
    status)
        echo "📊 Estado del frontend:"
        pm2 status inventory-frontend
        ;;
    logs)
        echo "📝 Mostrando logs del frontend:"
        pm2 logs inventory-frontend
        ;;
    delete)
        echo "🗑️ Eliminando proceso del frontend de PM2..."
        pm2 delete inventory-frontend
        ;;
    build)
        echo "🔨 Construyendo aplicación..."
        cd /home/salvatorsdev/inventory-front-ts
        npm run build:prod
        ;;
    dev)
        echo "🛠️ Iniciando en modo desarrollo..."
        cd /home/salvatorsdev/inventory-front-ts
        npm run dev
        ;;
    *)
        echo "📖 Uso: $0 {start|stop|restart|status|logs|delete|build|dev}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start    - Construir y iniciar con PM2"
        echo "  stop     - Detener aplicación"
        echo "  restart  - Reconstruir y reiniciar"
        echo "  status   - Ver estado de la aplicación"
        echo "  logs     - Ver logs en tiempo real"
        echo "  delete   - Eliminar proceso de PM2"
        echo "  build    - Solo construir aplicación"
        echo "  dev      - Iniciar en modo desarrollo"
        exit 1
        ;;
esac
