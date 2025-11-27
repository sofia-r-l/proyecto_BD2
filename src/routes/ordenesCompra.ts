// Crea un nuevo archivo: routes/ordenesCompra.ts
import express from 'express';
import { ordenCompraService } from '../services/ordenCompraService';

const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const orden = req.body;
        const result = await ordenCompraService.crearOrdenCompra(orden);
        res.json({
            success: true,
            data: result,
            message: 'Orden de compra creada exitosamente'
        });
    } catch (error) {
        console.error('Error creando orden de compra:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

export default router;