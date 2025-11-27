// services/inventario.service.ts
import { api } from './api';
import { proveedoresService, type Proveedor as ProveedorType } from './proveedores.service';

export interface ProductoInventario {
    SucursalID: number;
    Sucursal: string;
    ProductoID: number;
    Producto: string;
    Categoria: string;
    Cantidad: number;
    PrecioBase: string;
    ValorTotalInventario: string;
}

export interface ProductoConAlerta extends ProductoInventario {
    Estado: 'normal' | 'alerta' | 'critico';
}

export interface OrdenCompra {
    ProveedorID: number;
    ProductoID: number;
    Cantidad: number;
    PrecioUnitario: number;
    FechaEntrega: string;
    SucursalID: number;
}

// Re-exportar Proveedor desde proveedores service
export type Proveedor = ProveedorType;

// Función helper para determinar el estado
const determinarEstado = (cantidad: number): 'normal' | 'alerta' | 'critico' => {
    if (cantidad >= 50) return 'normal';
    if (cantidad > 0 && cantidad < 50) return 'alerta';
    return 'critico';
};

export const inventarioService = {
    async getInventario(): Promise<ProductoInventario[]> {
        try {
            console.log('🔄 Obteniendo inventario...');
            const response = await api.get('/productos/inventario');
            console.log('✅ Inventario obtenido:', response.data.data.length, 'productos');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error obteniendo inventario:', error);
            throw new Error(`Error obteniendo inventario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async getInventarioBajo(): Promise<ProductoInventario[]> {
        try {
            const inventario = await this.getInventario();
            const inventarioBajo = inventario.filter(item => item.Cantidad < 50);
            console.log('📊 Inventario bajo:', inventarioBajo.length, 'productos');
            return inventarioBajo;
        } catch (error) {
            console.error('❌ Error obteniendo inventario bajo:', error);
            throw new Error(`Error obteniendo inventario bajo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async getProductosConAlerta(): Promise<ProductoConAlerta[]> {
        try {
            console.log('🔄 Obteniendo productos con alerta...');
            const inventario = await this.getInventario();
            const productosConAlerta: ProductoConAlerta[] = inventario
                .filter(item => item.Cantidad < 50)
                .map(item => ({
                    ...item,
                    Estado: determinarEstado(item.Cantidad)
                }));

            console.log('✅ Productos con alerta encontrados:', productosConAlerta.length);
            return productosConAlerta;
        } catch (error) {
            console.error('❌ Error obteniendo productos con alerta:', error);
            throw new Error(`Error obteniendo productos con alerta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async getProveedores(): Promise<Proveedor[]> {
        try {
            console.log('🔄 Obteniendo proveedores desde proveedoresService...');
            // Usar directamente el servicio de proveedores
            const proveedores = await proveedoresService.getProveedores();
            console.log('✅ Proveedores obtenidos:', proveedores.length);
            return proveedores;
        } catch (error) {
            console.error('❌ Error obteniendo proveedores:', error);
            throw new Error(`Error obteniendo proveedores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async crearOrdenCompra(orden: OrdenCompra): Promise<any> {
        try {
            console.log('🔄 Creando orden de compra:', orden);
            // Por ahora simulamos la respuesta hasta que tengas el backend
            // const response = await api.post('/ordenes-compra', orden);
            // return response.data;

            // Simulación temporal
            await new Promise(resolve => setTimeout(resolve, 1000));
            const respuestaSimulada = {
                success: true,
                data: {
                    id: Math.floor(Math.random() * 1000),
                    ...orden,
                    Estado: 'Pendiente',
                    FechaCreacion: new Date().toISOString()
                },
                message: 'Orden de compra creada exitosamente'
            };
            console.log('✅ Orden creada simulada:', respuestaSimulada);
            return respuestaSimulada;
        } catch (error) {
            console.error('❌ Error creando orden de compra:', error);
            throw new Error(`Error creando orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};