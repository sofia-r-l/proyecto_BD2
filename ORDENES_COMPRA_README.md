# Sistema de Órdenes de Compra con Almacenamiento Local (JSON)

## 📋 Descripción

Este sistema permite crear órdenes de compra desde el módulo de **Inventario** y visualizarlas en el módulo de **Órdenes de Compra**. Las órdenes se guardan en formato JSON usando `localStorage` del navegador.

## 🚀 Características

### 1. **Creación de Órdenes desde Inventario**
- Las órdenes se crean desde el formulario en la vista de Inventario
- Se selecciona un producto con stock bajo
- Se elige un proveedor
- Se especifica cantidad, fecha de entrega, etc.
- Al guardar, la orden se almacena en localStorage en formato JSON

### 2. **Visualización en Órdenes de Compra**
- Todas las órdenes guardadas localmente se muestran en la vista de Órdenes de Compra
- Se combinan con las órdenes del backend (si existe conexión)
- Filtros por estado, sucursal y búsqueda
- Estadísticas en tiempo real

### 3. **Gestión de Estados**
- **Pendiente**: Orden recién creada
- **Aprobada**: Orden aprobada para procesamiento
- **Rechazada**: Orden rechazada
- **Completada**: Orden completada y recibida

### 4. **Exportación e Importación**
- **Exportar JSON**: Descarga todas las órdenes en un archivo JSON
- **Limpiar Locales**: Elimina todas las órdenes guardadas localmente

## 📁 Estructura de Archivos

```
frontend/src/
├── services/
│   ├── storage.service.ts       # Servicio de almacenamiento local
│   ├── inventario.service.ts    # Servicio de inventario (actualizado)
│   └── ordenCompra.service.ts   # Servicio de órdenes (actualizado)
├── views/
│   ├── Inventario.vue           # Vista de inventario
│   └── OrdenCompra.vue          # Vista de órdenes (actualizado)
```

## 🔧 Servicios Principales

### `storage.service.ts`
Maneja el almacenamiento local de órdenes en formato JSON:

```typescript
// Guardar una orden
storageService.guardarOrden(orden)

// Obtener todas las órdenes
storageService.obtenerOrdenes()

// Actualizar estado
storageService.actualizarEstado(ordenId, nuevoEstado)

// Exportar a JSON
storageService.exportarJSON()

// Limpiar todas las órdenes
storageService.limpiarOrdenes()
```

### `inventario.service.ts`
Actualizado para guardar órdenes en localStorage:

```typescript
// Crear orden de compra (guarda en localStorage)
await inventarioService.crearOrdenCompra(orden)
```

### `ordenCompra.service.ts`
Actualizado para combinar órdenes locales y del backend:

```typescript
// Obtiene órdenes de localStorage + backend
await ordenCompraService.obtenerOrdenesCompra()
```

## 💾 Formato JSON

Las órdenes se guardan en localStorage con la siguiente estructura:

```json
[
  {
    "OrdenID": 1,
    "ProveedorID": 5,
    "ProductoID": 12,
    "Cantidad": 100,
    "PrecioUnitario": 25.50,
    "FechaEntrega": "2025-12-15",
    "SucursalID": 1,
    "Estado": "Pendiente",
    "FechaCreacion": "2025-11-28T20:00:00.000Z",
    "Total": 2550,
    "ProveedorNombre": "Distribuidora Central S.A.",
    "ProductoNombre": "Laptop HP 15-dy2024",
    "SucursalNombre": "Sucursal Central"
  }
]
```

## 🎯 Flujo de Trabajo

### Crear una Orden de Compra:

1. **Ir a Inventario** (`/inventario`)
2. Hacer clic en **"Generar Orden"** (solo si hay productos con stock bajo)
3. Completar el formulario:
   - Seleccionar producto
   - Seleccionar proveedor
   - Ingresar cantidad
   - Seleccionar fecha de entrega
4. Hacer clic en **"Generar Orden"**
5. La orden se guarda automáticamente en localStorage

### Ver y Gestionar Órdenes:

1. **Ir a Órdenes de Compra** (`/ordenes-compra`)
2. Ver todas las órdenes (locales + backend)
3. Filtrar por estado, sucursal o buscar
4. **Aprobar/Rechazar/Completar** órdenes según sea necesario
5. **Exportar JSON** para respaldo
6. **Limpiar Locales** para eliminar órdenes de prueba

## 🔄 Sincronización

El sistema combina automáticamente:
- ✅ Órdenes guardadas en localStorage (creadas localmente)
- ✅ Órdenes del backend (si hay conexión)

Si el backend no está disponible, el sistema funciona completamente con localStorage.

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Frontend
cd frontend
npm run dev

# Backend (si está disponible)
cd ..
npm run dev
```

### Limpiar Datos
Para limpiar todas las órdenes locales:
1. Ir a Órdenes de Compra
2. Hacer clic en **"Limpiar Locales"**
3. Confirmar la acción

O desde la consola del navegador:
```javascript
localStorage.removeItem('ordenes_compra_local')
```

## 📊 Ventajas del Sistema

1. **Sin dependencia del backend**: Funciona completamente offline
2. **Datos persistentes**: Las órdenes se mantienen al recargar la página
3. **Exportación fácil**: Descarga JSON para respaldo o análisis
4. **Combinación inteligente**: Integra datos locales y del servidor
5. **Interfaz intuitiva**: Fácil de usar y entender

## ⚠️ Consideraciones

- Los datos en localStorage son específicos del navegador
- Si cambias de navegador o limpias el caché, perderás las órdenes locales
- **Recomendación**: Exporta regularmente el JSON como respaldo
- Las órdenes locales tienen IDs independientes del backend

## 🎨 Características de UI

- **Badges de estado** con colores distintivos
- **Filtros dinámicos** por estado y sucursal
- **Búsqueda en tiempo real** por producto o proveedor
- **Estadísticas visuales** de órdenes
- **Días restantes** hasta la fecha de entrega
- **Acciones rápidas** (aprobar, rechazar, completar)

## 📝 Notas Técnicas

- **localStorage**: Capacidad aproximada de 5-10MB
- **JSON.stringify/parse**: Serialización automática
- **IDs únicos**: Generados automáticamente e incrementales
- **TypeScript**: Tipado completo para seguridad
- **Vue 3**: Composition API con `<script setup>`

---

**Desarrollado para**: Proyecto de Base de Datos 2  
**Fecha**: Noviembre 2025  
**Tecnologías**: Vue 3, TypeScript, localStorage, JSON
