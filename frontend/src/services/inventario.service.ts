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
            if (response.data.data.length > 0) {
                console.log('🔍 Estructura del primer producto:', response.data.data[0]);
            }
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

            // Importar dinámicamente el storageService
            const { storageService } = await import('./storage.service');

            // Obtener información del producto y proveedor para nombres completos
            const inventario = await this.getInventario();

            console.log('📊 Total productos en inventario:', inventario.length);
            console.log('🔍 Buscando producto con:', {
                ProductoID: orden.ProductoID,
                SucursalID: orden.SucursalID
            });

            // Buscar el producto específico por ProductoID Y SucursalID
            const producto = inventario.find(p =>
                p.ProductoID === orden.ProductoID &&
                p.SucursalID === orden.SucursalID
            );

            if (producto) {
                console.log('✅ Producto encontrado:', {
                    ProductoID: producto.ProductoID,
                    Nombre: producto.Producto,
                    SucursalID: producto.SucursalID,
                    Sucursal: producto.Sucursal,
                    PrecioBase: producto.PrecioBase
                });
            } else {
                console.error('❌ PRODUCTO NO ENCONTRADO!');
                console.log('📋 Productos disponibles con ProductoID', orden.ProductoID, ':');
                const productosConMismoID = inventario.filter(p => p.ProductoID === orden.ProductoID);
                productosConMismoID.forEach(p => {
                    console.log(`   - ${p.Producto} en ${p.Sucursal} (SucursalID: ${p.SucursalID})`);
                });
            }

            const proveedores = await this.getProveedores();
            const proveedor = proveedores.find(p => p.ProveedorID === orden.ProveedorID);

            // Guardar en localStorage
            const ordenGuardada = storageService.guardarOrden({
                ProveedorID: orden.ProveedorID,
                ProductoID: orden.ProductoID,
                Cantidad: orden.Cantidad,
                PrecioUnitario: orden.PrecioUnitario,
                FechaEntrega: orden.FechaEntrega,
                SucursalID: orden.SucursalID,
                Estado: 'Pendiente',
                ProveedorNombre: proveedor?.Nombre || 'Proveedor desconocido',
                ProductoNombre: producto?.Producto || 'Producto desconocido',
                SucursalNombre: producto?.Sucursal || 'Sucursal desconocida'
            });

            console.log('✅ Orden guardada en localStorage:', ordenGuardada);

            return {
                success: true,
                data: ordenGuardada,
                message: 'Orden de compra creada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error creando orden de compra:', error);
            throw new Error(`Error creando orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};