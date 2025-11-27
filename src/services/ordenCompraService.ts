// services/ordenCompra.service.ts
import prisma from '../lib/prisma';

export interface OrdenCompra {
    ProveedorID: number;
    ProductoID: number;
    Cantidad: number;
    PrecioUnitario: number;
    FechaEntrega: string;
    SucursalID: number;
}

export class OrdenCompraService {
    async crearOrdenCompra(orden: OrdenCompra): Promise<any> {
        try {
            // Aquí implementarías la lógica para crear la orden de compra
            // Esto es un ejemplo - ajusta según tu base de datos
            const result = await prisma.$executeRaw`
        INSERT INTO OrdenesCompra (ProveedorID, ProductoID, Cantidad, PrecioUnitario, FechaEntrega, SucursalID, Estado)
        VALUES (${orden.ProveedorID}, ${orden.ProductoID}, ${orden.Cantidad}, ${orden.PrecioUnitario}, ${orden.FechaEntrega}, ${orden.SucursalID}, 'Pendiente')
      `;

            return { id: result, ...orden };
        } catch (error) {
            console.error('Error en crearOrdenCompra:', error);
            throw error;
        }
    }
}

export const ordenCompraService = new OrdenCompraService();