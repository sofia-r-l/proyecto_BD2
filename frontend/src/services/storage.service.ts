// services/storage.service.ts
// Servicio para manejar el almacenamiento local de órdenes de compra en JSON

export interface OrdenCompraLocal {
    OrdenID: number;
    ProveedorID: number;
    ProductoID: number;
    Cantidad: number;
    PrecioUnitario: number;
    FechaEntrega: string;
    SucursalID: number;
    Estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
    FechaCreacion: string;
    Total: number;
    ProveedorNombre: string;
    ProductoNombre: string;
    SucursalNombre: string;
}

const STORAGE_KEY = 'ordenes_compra_local';

export const storageService = {
    /**
     * Obtener todas las órdenes guardadas en localStorage
     */
    obtenerOrdenes(): OrdenCompraLocal[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                console.log('📭 No hay órdenes guardadas en localStorage');
                return [];
            }

            const ordenes = JSON.parse(data);
            console.log('✅ Órdenes cargadas desde localStorage:', ordenes.length);
            return ordenes;
        } catch (error) {
            console.error('❌ Error leyendo órdenes desde localStorage:', error);
            return [];
        }
    },

    /**
     * Guardar una nueva orden en localStorage
     */
    guardarOrden(orden: Omit<OrdenCompraLocal, 'OrdenID' | 'FechaCreacion' | 'Total'>): OrdenCompraLocal {
        try {
            const ordenes = this.obtenerOrdenes();

            // Generar un ID único
            const nuevoId = ordenes.length > 0
                ? Math.max(...ordenes.map(o => o.OrdenID)) + 1
                : 1;

            // Calcular el total
            const total = orden.Cantidad * orden.PrecioUnitario;

            // Crear la orden completa
            const nuevaOrden: OrdenCompraLocal = {
                ...orden,
                OrdenID: nuevoId,
                FechaCreacion: new Date().toISOString(),
                Total: total
            };

            // Agregar al array
            ordenes.push(nuevaOrden);

            // Guardar en localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenes));

            console.log('✅ Orden guardada en localStorage:', nuevaOrden);
            return nuevaOrden;
        } catch (error) {
            console.error('❌ Error guardando orden en localStorage:', error);
            throw new Error('Error guardando la orden');
        }
    },

    /**
     * Actualizar el estado de una orden
     */
    actualizarEstado(ordenId: number, nuevoEstado: OrdenCompraLocal['Estado']): void {
        try {
            const ordenes = this.obtenerOrdenes();
            const index = ordenes.findIndex(o => o.OrdenID === ordenId);

            if (index === -1) {
                throw new Error(`Orden ${ordenId} no encontrada`);
            }

            const orden = ordenes[index];
            if (orden) {
                orden.Estado = nuevoEstado;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenes));
                console.log(`✅ Estado de orden ${ordenId} actualizado a: ${nuevoEstado}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            throw error;
        }
    },

    /**
     * Obtener una orden por ID
     */
    obtenerOrdenPorId(ordenId: number): OrdenCompraLocal | null {
        try {
            const ordenes = this.obtenerOrdenes();
            return ordenes.find(o => o.OrdenID === ordenId) || null;
        } catch (error) {
            console.error('❌ Error obteniendo orden por ID:', error);
            return null;
        }
    },

    /**
     * Eliminar una orden
     */
    eliminarOrden(ordenId: number): void {
        try {
            const ordenes = this.obtenerOrdenes();
            const nuevasOrdenes = ordenes.filter(o => o.OrdenID !== ordenId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasOrdenes));

            console.log(`✅ Orden ${ordenId} eliminada`);
        } catch (error) {
            console.error('❌ Error eliminando orden:', error);
            throw error;
        }
    },

    /**
     * Limpiar todas las órdenes (útil para desarrollo/testing)
     */
    limpiarOrdenes(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('✅ Todas las órdenes han sido eliminadas');
        } catch (error) {
            console.error('❌ Error limpiando órdenes:', error);
            throw error;
        }
    },

    /**
     * Exportar órdenes a un archivo JSON
     */
    exportarJSON(): string {
        const ordenes = this.obtenerOrdenes();
        return JSON.stringify(ordenes, null, 2);
    },

    /**
     * Importar órdenes desde un JSON
     */
    importarJSON(jsonString: string): void {
        try {
            const ordenes = JSON.parse(jsonString);
            if (!Array.isArray(ordenes)) {
                throw new Error('El JSON debe ser un array de órdenes');
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenes));
            console.log('✅ Órdenes importadas exitosamente:', ordenes.length);
        } catch (error) {
            console.error('❌ Error importando JSON:', error);
            throw error;
        }
    },

    // === GESTIÓN DE SALDOS DE PROVEEDORES ===

    obtenerAjustesProveedores(): Record<number, number> {
        try {
            const ajustes = localStorage.getItem('ajustes_saldo_proveedores');
            return ajustes ? JSON.parse(ajustes) : {};
        } catch (error) {
            console.error('Error al leer ajustes de saldo:', error);
            return {};
        }
    },

    guardarAjustesProveedores(ajustes: Record<number, number>): void {
        try {
            localStorage.setItem('ajustes_saldo_proveedores', JSON.stringify(ajustes));
        } catch (error) {
            console.error('Error al guardar ajustes de saldo:', error);
        }
    },

    actualizarSaldoProveedor(proveedorId: number, monto: number): void {
        const ajustes = this.obtenerAjustesProveedores();
        // Sumamos el monto al ajuste existente (o 0 si no existe)
        // Nota: El monto es positivo si es una deuda (orden aprobada)
        ajustes[proveedorId] = (ajustes[proveedorId] || 0) + monto;
        this.guardarAjustesProveedores(ajustes);
        console.log(`💰 Saldo ajustado para proveedor ${proveedorId}: +${monto} (Total ajuste: ${ajustes[proveedorId]})`);
    },

    obtenerAjusteProveedor(proveedorId: number): number {
        const ajustes = this.obtenerAjustesProveedores();
        return ajustes[proveedorId] || 0;
    }
};
