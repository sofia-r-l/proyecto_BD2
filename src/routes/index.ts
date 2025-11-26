import { Router } from 'express';

const router = Router();

// Ruta de prueba básica
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ Backend funcionando correctamente!',
        timestamp: new Date().toISOString(),
        endpoints: {
            inventario: '/api/productos/inventario',
            ventas: '/api/facturas',
            clientes: '/api/reportes/clientes'
        }
    });
});

// Ruta para obtener inventario (usando la vista SQL)
router.get('/productos/inventario', async (req, res) => {
    try {
        // Importación dinámica para evitar ciclos
        const { productosService } = await import('../services/productoService');
        const inventario = await productosService.getInventario();

        res.json({
            success: true,
            data: inventario,
            message: 'Inventario obtenido exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en /api/productos/inventario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inventario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default router;