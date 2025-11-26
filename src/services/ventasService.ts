import prisma from '../lib/prisma'

export interface VentaDetallada {
    FacturaID: number
    NumeroFactura: string
    Fecha: Date
    Cliente: string
    ProductoID: number
    Producto: string
    Cantidad: number
    PrecioUnitario: number
    DescuentoLinea: number
    TotalLinea: number
    Sucursal: string
    TipoPago: string
}

export interface FacturaData {
    numeroFactura: string
    usuarioId: number
    sucursalId: number
    tipoPagoId: number
    clienteId: number
    subtotal: number
    impuesto: number
    descuentoTotal: number
    total: number
    detalles: FacturaDetalle[]
}

export interface FacturaDetalle {
    productoId: number
    cantidad: number
    precioUnitario: number
    descuentoLinea: number
    totalLinea: number
}

export class VentasService {
    async getVentasDetalladas(fechaInicio?: string, fechaFin?: string): Promise<VentaDetallada[]> {
        try {
            let query = `SELECT * FROM vw_VentasDetalladas WHERE 1=1`
            const params: any[] = []

            if (fechaInicio) {
                query += ` AND Fecha >= ?`
                params.push(new Date(fechaInicio))
            }

            if (fechaFin) {
                query += ` AND Fecha <= ?`
                params.push(new Date(fechaFin))
            }

            query += ` ORDER BY Fecha DESC`

            const result = await prisma.$queryRawUnsafe<VentaDetallada[]>(query, ...params)
            return result
        } catch (error) {
            console.error('Error en getVentasDetalladas:', error)
            throw error
        }
    }

    async createFactura(facturaData: FacturaData): Promise<{ facturaId: number; message: string }> {
        try {
            // Para una implementación real, necesitaríamos crear un stored procedure
            // Por ahora simulamos la creación
            const result = await prisma.$executeRaw`
        INSERT INTO Factura (
          NumeroFactura, UsuarioID, SucursalID, TipoPagoID, Fecha, 
          Subtotal, Impuesto, DescuentoTotal, Total, ClienteID
        ) VALUES (
          ${facturaData.numeroFactura}, 
          ${facturaData.usuarioId}, 
          ${facturaData.sucursalId}, 
          ${facturaData.tipoPagoId}, 
          GETDATE(), 
          ${facturaData.subtotal}, 
          ${facturaData.impuesto}, 
          ${facturaData.descuentoTotal}, 
          ${facturaData.total}, 
          ${facturaData.clienteId}
        )
      `

            return {
                facturaId: 1, // En una implementación real, obtendríamos el ID insertado
                message: 'Factura creada exitosamente'
            }
        } catch (error) {
            console.error('Error en createFactura:', error)
            throw error
        }
    }
}

export const ventasService = new VentasService()