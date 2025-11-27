import prisma from '../lib/prisma'

export interface InventarioSucursal {
    SucursalID: number
    Sucursal: string
    ProductoID: number
    Producto: string
    Categoria: string
    Cantidad: number
    PrecioBase: number
    ValorTotalInventario: number
}

export class InventarioService {
    async getInventarioSucursal(): Promise<InventarioSucursal[]> {
        try {
            const result = await prisma.$queryRaw<InventarioSucursal[]>`
        SELECT * FROM vw_InventarioSucursal
      `
            return result
        } catch (error) {
            console.error('Error en getInventarioSucursal:', error)
            throw error
        }
    }

    async getInventarioBySucursal(sucursalId: number): Promise<InventarioSucursal[]> {
        try {
            const result = await prisma.$queryRaw<InventarioSucursal[]>`
        SELECT * FROM vw_InventarioSucursal WHERE SucursalID = ${sucursalId}
      `
            return result
        } catch (error) {
            console.error('Error en getInventarioBySucursal:', error)
            throw error
        }
    }

    async updateInventario(inventarioId: number, cantidad: number): Promise<boolean> {
        try {
            const result = await prisma.$executeRaw`
        UPDATE Inventario SET Cantidad = ${cantidad} WHERE InventarioID = ${inventarioId}
      `
            return result > 0
        } catch (error) {
            console.error('Error en updateInventario:', error)
            throw error
        }
    }


    async getProductosConAlerta(): Promise<InventarioSucursal[]> {
        try {
            const result = await prisma.$queryRaw<InventarioSucursal[]>`
        SELECT * FROM vw_InventarioSucursal 
        WHERE Cantidad < 50
        ORDER BY Cantidad ASC
      `;
            return result;
        } catch (error) {
            console.error('Error en getProductosConAlerta:', error);
            throw error;
        }
    }
}

export const inventarioService = new InventarioService()