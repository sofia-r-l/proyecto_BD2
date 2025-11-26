import { Request, Response } from 'express'
import { inventarioService } from '../services/inventarioService'

export const getInventario = async (req: Request, res: Response) => {
    try {
        const inventario = await inventarioService.getInventarioSucursal()
        res.json({
            success: true,
            data: inventario,
            message: 'Inventario obtenido exitosamente'
        })
    } catch (error) {
        console.error('Error en getInventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener inventario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        })
    }
}

export const getInventarioBySucursal = async (req: Request, res: Response) => {
    try {
        const { sucursalId } = req.params
        const inventario = await inventarioService.getInventarioBySucursal(parseInt(sucursalId))
        res.json({
            success: true,
            data: inventario,
            message: 'Inventario de sucursal obtenido exitosamente'
        })
    } catch (error) {
        console.error('Error en getInventarioBySucursal:', error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener inventario de sucursal',
            error: error instanceof Error ? error.message : 'Error desconocido'
        })
    }
}

export const updateInventario = async (req: Request, res: Response) => {
    try {
        const { inventarioId } = req.params
        const { cantidad } = req.body

        const updated = await inventarioService.updateInventario(parseInt(inventarioId), cantidad)

        if (updated) {
            res.json({
                success: true,
                message: 'Inventario actualizado exitosamente'
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            })
        }
    } catch (error) {
        console.error('Error en updateInventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error al actualizar inventario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        })
    }
}