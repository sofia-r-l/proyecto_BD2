
//import api from './api';
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
            // Por ahora, datos de prueba - luego conectaremos con endpoints reales
            return {
                totalProductos: 45,
                totalVentasHoy: 12500,
                totalClientes: 156,
                inventarioBajo: 8,
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
            throw new Error(`Error obteniendo estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};