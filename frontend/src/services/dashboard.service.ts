//import api from './api';
import { inventarioService } from './inventario.service';

export interface DashboardStats {
    totalProductos: number;
    totalVentasHoy: number;
    totalClientes: number;
    inventarioBajo: number;
    ventasUltimaSemana: { fecha: string; total: number }[];
    productosPopulares: { producto: string; cantidad: number }[];
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        try {
            // Obtener datos reales del inventario
            const inventario = await inventarioService.getInventario();
            const totalProductos = inventario.length;
            const inventarioBajo = inventario.filter(p => p.Cantidad < 50).length;

            // Datos simulados para ventas y clientes (aún no implementado)
            return {
                totalProductos: totalProductos,
                totalVentasHoy: 12500,
                totalClientes: 156,
                inventarioBajo: inventarioBajo,
                ventasUltimaSemana: [
                    { fecha: '2024-01-15', total: 4500 },
                    { fecha: '2024-01-16', total: 5200 },
                    { fecha: '2024-01-17', total: 4800 },
                    { fecha: '2024-01-18', total: 6100 },
                    { fecha: '2024-01-19', total: 12500 },
                ],
                productosPopulares: [
                    { producto: 'Paracetamol 500mg', cantidad: 45 },
                    { producto: 'Ibuprofeno 400mg', cantidad: 38 },
                    { producto: 'Amoxicilina 500mg', cantidad: 32 },
                    { producto: 'Vitamina C 1g', cantidad: 28 },
                ]
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas del dashboard:', error);
            // Fallback a datos mock si falla la API
            return {
                totalProductos: 0,
                totalVentasHoy: 0,
                totalClientes: 0,
                inventarioBajo: 0,
                ventasUltimaSemana: [],
                productosPopulares: []
            };
        }
    }
};