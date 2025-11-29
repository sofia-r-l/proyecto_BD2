import express from 'express';
import { ordenCompraController } from '../controllers/ordenCompraController';

const router = express.Router();

// Rutas específicas primero
router.get('/pendientes', ordenCompraController.getOrdenesPendientes);
router.get('/proveedores', ordenCompraController.getProveedores);
router.get('/productos', ordenCompraController.getProductos);

// Rutas generales
router.get('/', ordenCompraController.getTodasLasOrdenes);
router.post('/', ordenCompraController.crearOrden);

// Rutas con parámetros
router.get('/:id', ordenCompraController.getOrdenPorId);
router.patch('/:id/estado', ordenCompraController.actualizarEstado);

export default router;