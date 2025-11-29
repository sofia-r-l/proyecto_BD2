// frontend/services/ordenCompra.service.ts
import { api } from './api';
import { proveedoresService, type Proveedor } from './proveedores.service'

export interface OrdenCompra {
    ProveedorID: number;
    ProductoID: number;
    Cantidad: number;
    PrecioUnitario: number;
    FechaEntrega: string;
    SucursalID: number;
}

export interface OrdenCompraCompleta {
    OrdenID: number;
    ProveedorID: number;
    ProductoID: number;
    Cantidad: number;
    PrecioUnitario: number;
    FechaEntrega: string;
    SucursalID: number;
    Estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
    FechaCreacion: string;
    Total: number;
    ProveedorNombre?: string;
    ProductoNombre?: string;
    SucursalNombre?: string;
}


export const ordenCompraService = {
    // ✅ Crear orden de compra (llamada real al backend)
    async crearOrdenCompra(orden: OrdenCompra): Promise<any> {
        try {
            console.log('🔄 Creando orden de compra...', orden);

            const response = await api.post('/ordenes-compra', orden);
            console.log('✅ Orden creada:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Error creando orden de compra:', error);
            throw new Error(`Error creando orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener todas las órdenes de compra desde localStorage únicamente
    async obtenerOrdenesCompra(): Promise<OrdenCompraCompleta[]> {
        try {
            console.log('📋 Obteniendo órdenes de compra desde localStorage...');

            // Importar el servicio de almacenamiento
            const { storageService } = await import('./storage.service');

            // Obtener solo órdenes locales
            const ordenesLocales = storageService.obtenerOrdenes();
            console.log('📦 Órdenes locales:', ordenesLocales.length);

            return ordenesLocales;

        } catch (error) {
            console.error('❌ Error obteniendo órdenes de compra:', error);
            throw new Error(`Error obteniendo órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener órdenes pendientes desde localStorage
    async obtenerOrdenesPendientes(): Promise<OrdenCompraCompleta[]> {
        try {
            console.log('⏳ Obteniendo órdenes pendientes...');

            const todasLasOrdenes = await this.obtenerOrdenesCompra();
            const ordenesPendientes = todasLasOrdenes.filter(o => o.Estado === 'Pendiente');

            console.log('✅ Órdenes pendientes obtenidas:', ordenesPendientes.length);
            return ordenesPendientes;

        } catch (error) {
            console.error('❌ Error obteniendo órdenes pendientes:', error);
            throw new Error(`Error obteniendo órdenes pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener una orden específica por ID desde localStorage
    async obtenerOrdenPorId(id: number): Promise<OrdenCompraCompleta> {
        try {
            console.log(`📋 Obteniendo orden ${id}...`);

            const { storageService } = await import('./storage.service');
            const ordenLocal = storageService.obtenerOrdenPorId(id);

            if (ordenLocal) {
                console.log('✅ Orden obtenida desde localStorage:', ordenLocal);
                return ordenLocal;
            }

            throw new Error(`Orden ${id} no encontrada`);

        } catch (error) {
            console.error('❌ Error obteniendo orden:', error);
            throw new Error(`Error obteniendo orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Actualizar estado de una orden en localStorage
    async actualizarEstadoOrden(id: number, nuevoEstado: string): Promise<any> {
        try {
            console.log(`🔄 Actualizando orden ${id} a estado: ${nuevoEstado}`);

            const { storageService } = await import('./storage.service');

            // Si el nuevo estado es 'Aprobada', necesitamos descontar del crédito del proveedor
            if (nuevoEstado === 'Aprobada') {
                const orden = storageService.obtenerOrdenPorId(id);
                if (orden) {
                    // Actualizar saldo del proveedor (sumar deuda)
                    storageService.actualizarSaldoProveedor(orden.ProveedorID, orden.Total);
                    console.log(`💰 Crédito descontado para proveedor ${orden.ProveedorID}: L. ${orden.Total}`);
                }
            }

            storageService.actualizarEstado(id, nuevoEstado as OrdenCompraCompleta['Estado']);
            console.log('✅ Estado actualizado en localStorage');
            return { success: true, message: 'Estado actualizado' };

        } catch (error) {
            console.error('❌ Error actualizando orden:', error);
            throw new Error(`Error actualizando orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener proveedores desde la BD
    async obtenerProveedores(): Promise<Proveedor[]> {
        try {
            console.log('🔄 Obteniendo proveedores...');

            const response = await api.get('/ordenes-compra/proveedores');
            console.log('✅ Proveedores obtenidos:', response.data.data.length);
            return response.data.data;

        } catch (error) {
            console.error('❌ Error obteniendo proveedores:', error);
            throw new Error(`Error obteniendo proveedores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener productos desde la BD
    async obtenerProductos(): Promise<any[]> {
        try {
            console.log('🔄 Obteniendo productos...');

            const response = await api.get('/ordenes-compra/productos');
            console.log('✅ Productos obtenidos:', response.data.data.length);
            return response.data.data;

        } catch (error) {
            console.error('❌ Error obteniendo productos:', error);
            throw new Error(`Error obteniendo productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};