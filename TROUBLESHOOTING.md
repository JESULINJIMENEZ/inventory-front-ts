# Solución de Problemas - Sistema de Inventario

## Problemas Comunes y Soluciones

### 1. Páginas en Blanco (Users/Assignments)

**Síntomas:**
- Las páginas de Users o Assignments se quedan en blanco
- El spinner de carga no aparece o se queda cargando indefinidamente

**Posibles Causas y Soluciones:**

#### A) Servidor Backend No Está Ejecutándose
```bash
# Verificar si el servidor está corriendo
curl http://localhost:3000/admin/users

# Si no responde, iniciar el servidor backend
# (Ejecutar en la carpeta del servidor)
npm start
```

#### B) Token JWT Inválido o Expirado
```bash
# Limpiar localStorage en el navegador
localStorage.clear()

# O específicamente:
localStorage.removeItem('token')
localStorage.removeItem('role')
localStorage.removeItem('user')
```

#### C) Problemas de Red/Timeout
- Abrir Developer Tools (F12)
- Revisar la pestaña Network para ver peticiones fallidas
- Verificar que las peticiones a `/admin/users` y `/admin/assignments` estén respondiendo

### 2. Tiempo de Carga Inicial Lento

**Optimizaciones Implementadas:**
- Timeout de 10 segundos para peticiones HTTP
- Inicialización rápida del AuthContext
- Manejo de errores con fallback UI

**Para Mejorar Rendimiento:**
1. Verificar que el servidor backend esté en la misma red
2. Usar un proxy reverso (nginx) en producción
3. Implementar paginación con límites más pequeños

### 3. Errores de Autenticación

**Si el login no funciona:**
1. Verificar que la respuesta del login contenga:
   ```json
   {
     "message": "¡Bienvenido!",
     "token": "eyJ...",
     "rol": "admin"
   }
   ```

2. Revisar en Developer Tools > Application > Local Storage que se guarden:
   - `token`
   - `role` 
   - `user`

### 4. Rutas de API

**Rutas Configuradas:**
- Login: `POST /login`
- Users: `/admin/users`
- Devices: `/admin/devices`
- Assignments: `/admin/assignments`
- Activity Logs: `/admin/activity-logs`
- Device Movements: `/admin/device-movements`
- Reports: `/admin/reports`

### 5. Debug Mode

Para habilitar logs de depuración, abrir Developer Tools > Console.
Los logs mostrarán:
- Peticiones HTTP salientes
- Respuestas del servidor
- Errores de red
- Estado de autenticación

### 6. Limpiar Cache y Reiniciar

```bash
# En el directorio del proyecto frontend
npm run dev

# Si hay problemas con dependencias
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 7. Verificar Estado del Sistema

```bash
# Verificar conectividad
curl http://localhost:3000/admin/users

# Verificar con token (reemplazar TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/admin/users
```

## Contacto

Si persisten los problemas, revisar:
1. Console del navegador (F12)
2. Network tab para peticiones fallidas
3. Logs del servidor backend
