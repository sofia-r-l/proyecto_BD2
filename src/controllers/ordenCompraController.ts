// backend/controllers/ordenCompra.controller.ts
import { Request, Response } from 'express';
import { OrdenCompraService } from '../services/ordenCompraService';

const ordenCompraService = new OrdenCompraService();

export const ordenCompraController = {
    // ✅ Crear orden
    crearOrden: async (req: Request, res: Response) => {
        try {
            const ordenData = req.body;

            // Validaciones
            if (!ordenData.ProveedorID || !ordenData.ProductoID || !ordenData.Cantidad) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos incompletos',
                    message: 'ProveedorID, ProductoID y Cantidad son requeridos'
                });
            }

            const resultado = await ordenCompraService.crearOrdenCompra(ordenData);
            res.status(201).json(resultado);

        } catch (error) {
            console.error('❌ Error en crearOrden:', error);

            if (error instanceof Error && error.message.includes('Crédito insuficiente')) {
                return res.status(400).json({
                    success: false,
                    error: 'Crédito insuficiente',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Error creando orden de compra',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Obtener todas las órdenes
    getTodasLasOrdenes: async (req: Request, res: Response) => {
        try {
            const ordenes = await ordenCompraService.getTodasLasOrdenesCompra();
            res.json({
                success: true,
                data: ordenes,
                count: ordenes.length
            });
        } catch (error) {
            console.error('❌ Error en getTodasLasOrdenes:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo órdenes de compra',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Obtener órdenes pendientes
    getOrdenesPendientes: async (req: Request, res: Response) => {
        try {
            const ordenes = await ordenCompraService.getOrdenesCompraPendientes();
            res.json({
                success: true,
                data: ordenes,
                count: ordenes.length
            });
        } catch (error) {
            console.error('❌ Error en getOrdenesPendientes:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo órdenes pendientes',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Obtener una orden específica
    getOrdenPorId: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ordenId = parseInt(id);

            if (isNaN(ordenId) || ordenId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido',
                    message: 'El ID de la orden debe ser un número positivo'
                });
            }

            const orden = await ordenCompraService.getOrdenCompraPorId(ordenId);
            res.json({
                success: true,
                data: orden
            });

        } catch (error) {
            console.error('❌ Error en getOrdenPorId:', error);

            if (error instanceof Error && error.message.includes('no encontrada')) {
                return res.status(404).json({
                    success: false,
                    error: 'Orden no encontrada',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Error obteniendo orden',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Actualizar estado
    actualizarEstado: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const ordenId = parseInt(id);
            if (isNaN(ordenId) || ordenId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido',
                    message: 'El ID de la orden debe ser un número positivo'
                });
            }

            if (!estado) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado requerido',
                    message: 'El campo estado es requerido'
                });
            }

            const resultado = await ordenCompraService.actualizarEstadoOrden(ordenId, estado);
            res.json(resultado);

        } catch (error) {
            console.error('❌ Error en actualizarEstado:', error);
            res.status(500).json({
                success: false,
                error: 'Error actualizando estado de orden',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Obtener proveedores
    getProveedores: async (req: Request, res: Response) => {
        try {
            const proveedores = await ordenCompraService.getProveedores();
            res.json({
                success: true,
                data: proveedores,
                count: proveedores.length
            });
        } catch (error) {
            console.error('❌ Error en getProveedores:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo proveedores',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // ✅ Obtener productos
    getProductos: async (req: Request, res: Response) => {
        try {
            const productos = await ordenCompraService.getProductos();
            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            console.error('❌ Error en getProductos:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo productos',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};