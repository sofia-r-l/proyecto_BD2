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
            // 1. Insertar en OrdenCompra y obtener ID
            // Nota: Usamos queryRaw para obtener el ID generado (SCOPE_IDENTITY)
            const result: any[] = await prisma.$queryRaw`
                INSERT INTO OrdenCompra (ProveedorID, Fecha, TotalEstimado, Estado)
                VALUES (${orden.ProveedorID}, GETDATE(), ${orden.Cantidad * orden.PrecioUnitario}, 'Pendiente');
                
                SELECT SCOPE_IDENTITY() as id;
            `;

            const ordenId = result[0]?.id;

            if (!ordenId) {
                throw new Error('No se pudo obtener el ID de la orden creada');
            }

            // 2. Insertar en OrdenCompraDetalle
            await prisma.$executeRaw`
                INSERT INTO OrdenCompraDetalle (OrdenID, ProductoID, CantidadSolicitada, PrecioEstimado)
                VALUES (${ordenId}, ${orden.ProductoID}, ${orden.Cantidad}, ${orden.PrecioUnitario})
            `;

            return { success: true, message: 'Orden creada', id: ordenId };
        } catch (error) {
            console.error('Error en crearOrdenCompra:', error);
            throw error;
        }
    }

    async getTodasLasOrdenesCompra(): Promise<any[]> {
        try {
            // Unimos OrdenCompra con OrdenCompraDetalle para obtener la vista plana que espera el frontend
            const ordenes = await prisma.$queryRaw`
                SELECT 
                    oc.OrdenID,
                    oc.ProveedorID,
                    p.Nombre as ProveedorNombre,
                    od.ProductoID,
                    prod.Nombre as ProductoNombre,
                    od.CantidadSolicitada as Cantidad,
                    od.PrecioEstimado as PrecioUnitario,
                    oc.TotalEstimado as Total,
                    -- Usamos Fecha como FechaCreacion y simulamos FechaEntrega (ya que no existe en BD)
                    oc.Fecha as FechaCreacion,
                    DATEADD(day, 7, oc.Fecha) as FechaEntrega, 
                    oc.Estado,
                    -- Simulamos Sucursal ya que no existe en esta tabla
                    1 as SucursalID,
                    'Sucursal Central' as SucursalNombre
                FROM OrdenCompra oc
                JOIN OrdenCompraDetalle od ON oc.OrdenID = od.OrdenID
                LEFT JOIN Proveedor p ON oc.ProveedorID = p.ProveedorID
                LEFT JOIN Producto prod ON od.ProductoID = prod.ProductoID
                ORDER BY oc.Fecha DESC
            `;
            return Array.isArray(ordenes) ? ordenes : [];
        } catch (error) {
            console.error('Error en getTodasLasOrdenesCompra:', error);
            throw error;
        }
    }

    async getOrdenesCompraPendientes(): Promise<any[]> {
        try {
            const ordenes = await prisma.$queryRaw`
                SELECT 
                    oc.OrdenID,
                    oc.ProveedorID,
                    p.Nombre as ProveedorNombre,
                    od.ProductoID,
                    prod.Nombre as ProductoNombre,
                    od.CantidadSolicitada as Cantidad,
                    od.PrecioEstimado as PrecioUnitario,
                    oc.TotalEstimado as Total,
                    oc.Fecha as FechaCreacion,
                    DATEADD(day, 7, oc.Fecha) as FechaEntrega,
                    oc.Estado,
                    1 as SucursalID,
                    'Sucursal Central' as SucursalNombre
                FROM OrdenCompra oc
                JOIN OrdenCompraDetalle od ON oc.OrdenID = od.OrdenID
                LEFT JOIN Proveedor p ON oc.ProveedorID = p.ProveedorID
                LEFT JOIN Producto prod ON od.ProductoID = prod.ProductoID
                WHERE oc.Estado = 'Pendiente'
                ORDER BY oc.Fecha ASC
            `;
            return Array.isArray(ordenes) ? ordenes : [];
        } catch (error) {
            console.error('Error en getOrdenesCompraPendientes:', error);
            throw error;
        }
    }

    async getOrdenCompraPorId(id: number): Promise<any> {
        try {
            const ordenes = await prisma.$queryRaw`
                SELECT 
                    oc.OrdenID,
                    oc.ProveedorID,
                    p.Nombre as ProveedorNombre,
                    od.ProductoID,
                    prod.Nombre as ProductoNombre,
                    od.CantidadSolicitada as Cantidad,
                    od.PrecioEstimado as PrecioUnitario,
                    oc.TotalEstimado as Total,
                    oc.Fecha as FechaCreacion,
                    DATEADD(day, 7, oc.Fecha) as FechaEntrega,
                    oc.Estado,
                    1 as SucursalID,
                    'Sucursal Central' as SucursalNombre
                FROM OrdenCompra oc
                JOIN OrdenCompraDetalle od ON oc.OrdenID = od.OrdenID
                LEFT JOIN Proveedor p ON oc.ProveedorID = p.ProveedorID
                LEFT JOIN Producto prod ON od.ProductoID = prod.ProductoID
                WHERE oc.OrdenID = ${id}
            `;
            return Array.isArray(ordenes) ? ordenes[0] : null;
        } catch (error) {
            console.error('Error en getOrdenCompraPorId:', error);
            throw error;
        }
    }

    async actualizarEstadoOrden(id: number, estado: string): Promise<any> {
        try {
            await prisma.$executeRaw`
                UPDATE OrdenCompra
                SET Estado = ${estado}
                WHERE OrdenID = ${id}
            `;
            return { success: true, message: `Orden actualizada a ${estado}` };
        } catch (error) {
            console.error('Error en actualizarEstadoOrden:', error);
            throw error;
        }
    }

    async getProveedores(): Promise<any[]> {
        try {
            const proveedores = await prisma.$queryRaw`
                SELECT * FROM Proveedor ORDER BY Nombre
            `;
            return Array.isArray(proveedores) ? proveedores : [];
        } catch (error) {
            console.error('Error en getProveedores:', error);
            throw error;
        }
    }

    async getProductos(): Promise<any[]> {
        try {
            const productos = await prisma.$queryRaw`
                SELECT * FROM Producto ORDER BY Nombre
            `;
            return Array.isArray(productos) ? productos : [];
        } catch (error) {
            console.error('Error en getProductos:', error);
            throw error;
        }
    }
}

export const ordenCompraService = new OrdenCompraService();