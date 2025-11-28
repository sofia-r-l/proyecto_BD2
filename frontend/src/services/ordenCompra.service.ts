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

    // ✅ Obtener todas las órdenes de compra desde la BD
    async obtenerOrdenesCompra(): Promise<OrdenCompraCompleta[]> {
        try {
            console.log('📋 Obteniendo todas las órdenes de compra...');

            const response = await api.get('/ordenes-compra');
            console.log('✅ Órdenes obtenidas:', response.data.data.length);
            return response.data.data;

        } catch (error) {
            console.error('❌ Error obteniendo órdenes de compra:', error);
            throw new Error(`Error obteniendo órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener órdenes pendientes desde la BD
    async obtenerOrdenesPendientes(): Promise<OrdenCompraCompleta[]> {
        try {
            console.log('⏳ Obteniendo órdenes pendientes...');

            const response = await api.get('/ordenes-compra/pendientes');
            console.log('✅ Órdenes pendientes obtenidas:', response.data.data.length);
            return response.data.data;

        } catch (error) {
            console.error('❌ Error obteniendo órdenes pendientes:', error);
            throw new Error(`Error obteniendo órdenes pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Obtener una orden específica por ID desde la BD
    async obtenerOrdenPorId(id: number): Promise<OrdenCompraCompleta> {
        try {
            console.log(`📋 Obteniendo orden ${id}...`);

            const response = await api.get(`/ordenes-compra/${id}`);
            console.log('✅ Orden obtenida:', response.data.data);
            return response.data.data;

        } catch (error) {
            console.error('❌ Error obteniendo orden:', error);
            throw new Error(`Error obteniendo orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // ✅ Actualizar estado de una orden
    async actualizarEstadoOrden(id: number, nuevoEstado: string): Promise<any> {
        try {
            console.log(`🔄 Actualizando orden ${id} a estado: ${nuevoEstado}`);

            const response = await api.patch(`/ordenes-compra/${id}/estado`, {
                estado: nuevoEstado
            });
            console.log('✅ Estado actualizado:', response.data);
            return response.data;

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
    },

    // ✅ Método de simulación (solo para desarrollo/testing)
    async crearOrdenCompraSimulada(orden: OrdenCompra): Promise<any> {
        try {
            console.log('🔄 Creando orden de compra (simulación)...', orden);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const total = orden.Cantidad * orden.PrecioUnitario;

            const respuestaSimulada = {
                success: true,
                data: {
                    OrdenID: Math.floor(Math.random() * 1000) + 1000,
                    ProveedorID: orden.ProveedorID,
                    ProductoID: orden.ProductoID,
                    Cantidad: orden.Cantidad,
                    PrecioUnitario: orden.PrecioUnitario,
                    FechaEntrega: orden.FechaEntrega,
                    SucursalID: orden.SucursalID,
                    Estado: 'Pendiente',
                    FechaCreacion: new Date().toISOString(),
                    Total: total,
                    ProveedorNombre: 'Proveedor Simulado',
                    ProductoNombre: 'Producto Simulado',
                    SucursalNombre: 'Sucursal Simulada'
                },
                message: 'Orden de compra creada exitosamente (simulación)'
            };

            console.log('✅ Orden creada simulada:', respuestaSimulada);
            return respuestaSimulada;

        } catch (error) {
            console.error('❌ Error creando orden de compra simulada:', error);
            throw new Error(`Error creando orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};