import { api } from './api'; // ← Cambiar a import nombrado

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

export const inventarioService = {
    async getInventario(): Promise<ProductoInventario[]> {
        try {
            const response = await api.get('/productos/inventario');
            return response.data.data;
        } catch (error) {
            throw new Error(`Error obteniendo inventario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async getInventarioBajo(): Promise<ProductoInventario[]> {
        try {
            const inventario = await this.getInventario();
            return inventario.filter(item => item.Cantidad < 50); // Productos con menos de 50 unidades
        } catch (error) {
            throw new Error(`Error obteniendo inventario bajo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};