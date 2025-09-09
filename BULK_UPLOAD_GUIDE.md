# Carga Masiva de Dispositivos

## Descripción
Esta funcionalidad permite cargar múltiples dispositivos a la vez mediante un archivo CSV.

## Formato del archivo CSV

El archivo CSV debe tener las siguientes columnas separadas por punto y coma (;):

### Columnas requeridas:
- `name`: Nombre del dispositivo
- `type_device_id`: ID del tipo de dispositivo (número)
- `brand`: Marca del dispositivo
- `model`: Modelo del dispositivo
- `serial_number`: Número de serie (debe ser único)

### Columnas opcionales:
- `status`: Estado del dispositivo (true/false, 1/0, TRUE/FALSE)
- `description`: Descripción del dispositivo
- `plate_device`: Número de placa (número)
- `storage`: Almacenamiento (para portátiles)
- `ram`: Memoria RAM (para portátiles)
- `processor`: Procesador (para portátiles)
- `dvr_storage`: Almacenamiento DVR (para DVRs)
- `purchase_date`: Fecha de compra (formato DD/MM/YY)
- `warranty_duration`: Duración de garantía (número)
- `warranty_unit`: Unidad de garantía (years/months)

## Ejemplo de archivo CSV:

```csv
name;type_device_id;brand;model;serial_number;status;description;plate_device;storage;ram;processor;purchase_date;warranty_duration;warranty_unit
Laptop Dell Inspiron 15;1;Dell;Inspiron 15 3000;ABC123456;true;Laptop para desarrollo;101;256GB SSD;8GB DDR4;Intel Core i5-1135G7;15/01/24;2;years
Desktop HP ProDesk;2;HP;ProDesk 400 G7;XYZ789012;true;Desktop para oficina;102;1TB HDD;16GB DDR4;Intel Core i7-10700;20/02/24;3;years
Impresora HP LaserJet;3;HP;LaserJet Pro M404n;LJ404N123;true;Impresora láser monocroma;103;;;;;;;1;years
```

## Tipos de dispositivo comunes:
- 1: PC Portátil
- 2: PC Desktop
- 3: Impresora Térmica
- 4: Impresora de Sticker
- 5: Impresora Multifuncional
- 6: Teléfono IP
- 7: Switch de Red
- 8: Router
- 9: DVR
- 10: UPS
- 11: Biométrico

## Validaciones:
- El número de serie debe ser único en el sistema
- El tipo de dispositivo debe existir en la base de datos
- Los campos específicos por tipo de dispositivo son validados según las reglas configuradas
- Las fechas deben estar en formato DD/MM/YY
- Los campos numéricos deben ser números válidos

## Proceso:
1. Descargar la plantilla CSV desde la interfaz
2. Completar los datos en la plantilla
3. Guardar como archivo CSV con separador punto y coma (;)
4. Subir el archivo mediante la interfaz de carga masiva
5. Revisar el resultado del procesamiento

## Respuesta del sistema:
- Total de filas procesadas
- Número de dispositivos creados exitosamente
- Número de dispositivos que fallaron
- Lista detallada de errores por fila (si los hay)
