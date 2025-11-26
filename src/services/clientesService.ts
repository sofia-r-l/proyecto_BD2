import prisma from '../lib/prisma'

export interface EstadoCuentaCliente {
    ClienteID: number
    PersonaID: number
    Cliente: string
    Telefono: string
    Email: string
    LimiteCredito: number
    SaldoActual: number
    CreditoDisponible: number
    NivelRiesgo: string
}

export class ClientesService {
    async getEstadoCuentaClientes(): Promise<EstadoCuentaCliente[]> {
        try {
            const result = await prisma.$queryRaw<EstadoCuentaCliente[]>`
        SELECT * FROM vw_EstadoCuentaClientes
      `
            return result
        } catch (error) {
            console.error('Error en getEstadoCuentaClientes:', error)
            throw error
        }
    }

    async getClientesRiesgoAlto(): Promise<EstadoCuentaCliente[]> {
        try {
            const result = await prisma.$queryRaw<EstadoCuentaCliente[]>`
        SELECT * FROM vw_EstadoCuentaClientes WHERE NivelRiesgo = 'ALTO'
      `
            return result
        } catch (error) {
            console.error('Error en getClientesRiesgoAlto:', error)
            throw error
        }
    }

    async updateClienteSaldo(clienteId: number, monto: number): Promise<boolean> {
        try {
            const result = await prisma.$executeRaw`
        UPDATE Cliente SET SaldoActual = SaldoActual + ${monto} WHERE ClienteID = ${clienteId}
      `
            return result > 0
        } catch (error) {
            console.error('Error en updateClienteSaldo:', error)
            throw error
        }
    }
}

export const clientesService = new ClientesService()