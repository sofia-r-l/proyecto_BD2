const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export interface ProductoInventario {
    SucursalID: number;
    Sucursal: string;
    ProductoID: number;
    Producto: string;
    Categoria: string;
    Cantidad: number;
    PrecioBase: number;
    ValorTotalInventario: number;
}

export const productosService = {
    async getInventario(): Promise<ProductoInventario[]> {
        try {
            console.log('📦 Obteniendo inventario desde la base de datos...');

            // Usar la vista SQL que creamos anteriormente
            const inventario = await prisma.$queryRaw`
        SELECT * FROM vw_InventarioSucursal
      `;

            console.log(`✅ Inventario obtenido: ${inventario.length} productos`);
            return inventario;
        } catch (error: any) {
            console.error('❌ Error en getInventario service:', error);
            throw error;
        }
    }
};