// src/routes/api.ts
import { Router } from 'express';

// Crear el router
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
            clientes: '/api/reportes/clientes',
            proveedores: '/api/proveedores'
        }
    });
});

// Ruta para obtener proveedores
router.get('/proveedores', async (req, res) => {
    let prisma;
    try {
        console.log('📞 Obteniendo proveedores desde la base de datos...');

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Consultar proveedores con la estructura correcta de tu BD
        const proveedores = await prisma.$queryRaw`
      SELECT 
        ProveedorID,
        Nombre,
        IdentidadFiscal,
        Telefono,
        Email,
        Direccion,
        ISNULL(LimiteCredito, 0) as LimiteCredito,
        ISNULL(SaldoActual, 0) as SaldoActual,
        ISNULL(LimiteCredito - SaldoActual, 0) as CreditoDisponible,
        CASE 
          WHEN ISNULL(LimiteCredito, 0) > 0 AND ISNULL(SaldoActual, 0) < ISNULL(LimiteCredito, 0) THEN 'activo'
          ELSE 'inactivo'
        END as Estado
      FROM Proveedor
      ORDER BY Nombre
    `;

        const proveedoresArray = Array.isArray(proveedores) ? proveedores : [];
        console.log(`✅ Proveedores obtenidos: ${proveedoresArray.length} registros`);

        res.json({
            success: true,
            data: proveedoresArray,
            message: `Proveedores obtenidos: ${proveedoresArray.length} registros`,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error al obtener proveedores:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedores de la base de datos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Ruta para obtener un proveedor por ID
router.get('/proveedores/:id', async (req, res) => {
    let prisma;
    try {
        const { id } = req.params;
        console.log(`📞 Obteniendo proveedor ID: ${id}...`);

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        const proveedores = await prisma.$queryRaw`
      SELECT 
        ProveedorID,
        Nombre,
        IdentidadFiscal,
        Telefono,
        Email,
        Direccion,
        ISNULL(LimiteCredito, 0) as LimiteCredito,
        ISNULL(SaldoActual, 0) as SaldoActual,
        ISNULL(LimiteCredito - SaldoActual, 0) as CreditoDisponible,
        CASE 
          WHEN ISNULL(LimiteCredito, 0) > 0 AND ISNULL(SaldoActual, 0) < ISNULL(LimiteCredito, 0) THEN 'activo'
          ELSE 'inactivo'
        END as Estado
      FROM Proveedor
      WHERE ProveedorID = ${parseInt(id)}
    `;

        const proveedor = Array.isArray(proveedores) ? proveedores[0] : null;

        if (!proveedor) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`✅ Proveedor ${id} obtenido exitosamente`);

        res.json({
            success: true,
            data: proveedor,
            message: 'Proveedor obtenido exitosamente',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error(`❌ Error al obtener proveedor ${req.params.id}:`, error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedor de la base de datos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Ruta para crear proveedor (usando stored procedure)
router.post('/proveedores', async (req, res) => {
    let prisma;
    try {
        const { Nombre, IdentidadFiscal, Telefono, Email, Direccion, LimiteCredito } = req.body;

        console.log('📝 Creando nuevo proveedor:', { Nombre, IdentidadFiscal, Email });

        // Validaciones básicas
        if (!Nombre || !IdentidadFiscal) {
            return res.status(400).json({
                success: false,
                message: 'Nombre e Identidad Fiscal son campos obligatorios',
                timestamp: new Date().toISOString()
            });
        }

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Llamar al stored procedure para crear proveedor
        const result = await prisma.$executeRaw`
      EXEC sp_CrearProveedor 
        @Nombre = ${Nombre},
        @IdentidadFiscal = ${IdentidadFiscal},
        @Telefono = ${Telefono || ''},
        @Email = ${Email || ''},
        @Direccion = ${Direccion || ''},
        @LimiteCredito = ${LimiteCredito || 0}
    `;

        console.log(`✅ Proveedor creado exitosamente: ${Nombre}`);

        res.json({
            success: true,
            data: {
                Mensaje: 'Proveedor creado exitosamente',
                ProveedorID: result // Ajustar según lo que retorne tu SP
            },
            message: 'Proveedor creado exitosamente',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error al crear proveedor:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear proveedor en la base de datos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Ruta para actualizar proveedor (usando stored procedure)
router.put('/proveedores/:id', async (req, res) => {
    let prisma;
    try {
        const { id } = req.params;
        const { Nombre, IdentidadFiscal, Telefono, Email, Direccion, LimiteCredito } = req.body;

        console.log(`📝 Actualizando proveedor ID: ${id}`, { Nombre, IdentidadFiscal, Email });

        // Validaciones básicas
        if (!Nombre || !IdentidadFiscal) {
            return res.status(400).json({
                success: false,
                message: 'Nombre e Identidad Fiscal son campos obligatorios',
                timestamp: new Date().toISOString()
            });
        }

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Llamar al stored procedure para actualizar proveedor
        const result = await prisma.$executeRaw`
      EXEC sp_ActualizarProveedor 
        @ProveedorID = ${parseInt(id)},
        @Nombre = ${Nombre},
        @IdentidadFiscal = ${IdentidadFiscal},
        @Telefono = ${Telefono || ''},
        @Email = ${Email || ''},
        @Direccion = ${Direccion || ''},
        @LimiteCredito = ${LimiteCredito || 0}
    `;

        console.log(`✅ Proveedor ${id} actualizado exitosamente`);

        res.json({
            success: true,
            data: {
                Mensaje: 'Proveedor actualizado exitosamente'
            },
            message: 'Proveedor actualizado exitosamente',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error(`❌ Error al actualizar proveedor ${req.params.id}:`, error);

        res.status(500).json({
            success: false,
            message: 'Error al actualizar proveedor en la base de datos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Ruta para eliminar proveedor (usando stored procedure)
router.delete('/proveedores/:id', async (req, res) => {
    let prisma;
    try {
        const { id } = req.params;
        console.log(`🗑️ Eliminando proveedor ID: ${id}...`);

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Llamar al stored procedure para eliminar proveedor
        const result = await prisma.$executeRaw`
      EXEC sp_EliminarProveedor @ProveedorID = ${parseInt(id)}
    `;

        console.log(`✅ Proveedor ${id} eliminado exitosamente`);

        res.json({
            success: true,
            data: {
                Mensaje: 'Proveedor eliminado exitosamente'
            },
            message: 'Proveedor eliminado exitosamente',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error(`❌ Error al eliminar proveedor ${req.params.id}:`, error);

        // Manejar error de integridad referencial
        if (error.message?.includes('REFERENCE') || error.message?.includes('foreign key')) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el proveedor porque tiene registros relacionados',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar proveedor de la base de datos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Ruta para generar reporte de proveedores con cursor
router.get('/proveedores/reporte/cursor', async (req, res) => {
    let prisma;
    try {
        console.log('📊 Generando reporte de proveedores con cursor...');

        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Llamar al stored procedure que usa cursor
        const reporte = await prisma.$queryRaw`
      EXEC sp_ReporteProveedoresCursor
    `;

        const reporteArray = Array.isArray(reporte) ? reporte : [reporte];
        console.log(`✅ Reporte generado: ${reporteArray.length} registros`);

        res.json({
            success: true,
            data: reporteArray,
            message: `Reporte de proveedores generado: ${reporteArray.length} registros`,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error al generar reporte de proveedores:', error);

        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de proveedores',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
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

// Agregar estas rutas de auth temporal
router.post('/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('📧 Login attempt:', { email, password });

        // Validación simple de prueba
        if (email === 'admin@comercializadora.com' && password === 'Admin123!') {
            res.json({
                success: true,
                message: 'Login exitoso',
                user: {
                    id: 1,
                    name: 'Administrador',
                    email: 'admin@comercializadora.com',
                    role: 'admin'
                },
                token: 'fake-jwt-token-for-demo-' + Date.now()
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta de verificación de token
router.get('/auth/me', (req, res) => {
    // Simular verificación de usuario autenticado
    res.json({
        success: true,
        user: {
            id: 1,
            name: 'Administrador',
            email: 'admin@comercializadora.com',
            role: 'admin'
        }
    });
});

// Importar rutas de órdenes de compra
import ordenesCompraRouter from './ordenesCompra';

// ... (existing code)

// Registrar rutas de órdenes de compra
router.use('/ordenes-compra', ordenesCompraRouter);

export default router;