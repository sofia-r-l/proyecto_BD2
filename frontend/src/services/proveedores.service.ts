// services/proveedores.service.ts
import { api } from './api';

export interface Proveedor {
    ProveedorID: number;
    Nombre: string;
    IdentidadFiscal: string;
    Telefono: string;
    Email: string;
    Direccion: string;
    LimiteCredito: number;
    SaldoActual: number;
    CreditoDisponible: number;
    Estado: 'activo' | 'inactivo';
}

export interface CrearProveedorData {
    Nombre: string;
    IdentidadFiscal: string;
    Telefono: string;
    Email: string;
    Direccion: string;
    LimiteCredito: number;
}

export interface ActualizarProveedorData extends CrearProveedorData {
    ProveedorID: number;
}

export const proveedoresService = {
    // Obtener todos los proveedores
    async getProveedores(): Promise<Proveedor[]> {
        try {
            const response = await api.get('/proveedores');
            const proveedores = response.data.data;

            // Importar storageService para obtener ajustes locales
            const { storageService } = await import('./storage.service');
            const ajustes = storageService.obtenerAjustesProveedores();

            // Aplicar ajustes
            return proveedores.map((p: Proveedor) => {
                const ajuste = ajustes[p.ProveedorID] || 0;
                // SaldoActual aumenta con las deudas (órdenes aprobadas)
                // CreditoDisponible disminuye con las deudas
                return {
                    ...p,
                    SaldoActual: p.SaldoActual + ajuste,
                    CreditoDisponible: p.CreditoDisponible - ajuste
                };
            });
        } catch (error) {
            console.error('Error obteniendo proveedores:', error);
            throw new Error(`Error obteniendo proveedores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // Obtener un proveedor por ID
    async getProveedor(id: number): Promise<Proveedor> {
        try {
            const response = await api.get(`/proveedores/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error obteniendo proveedor ${id}:`, error);
            throw new Error(`Error obteniendo proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // Crear proveedor (USANDO SP)
    async createProveedor(data: CrearProveedorData): Promise<{ Mensaje: string; ProveedorID: number }> {
        try {
            const response = await api.post('/proveedores', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creando proveedor:', error);
            throw new Error(`Error creando proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // Actualizar proveedor (USANDO SP)
    async updateProveedor(data: ActualizarProveedorData): Promise<{ Mensaje: string }> {
        try {
            const response = await api.put(`/proveedores/${data.ProveedorID}`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Error actualizando proveedor ${data.ProveedorID}:`, error);
            throw new Error(`Error actualizando proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // Eliminar proveedor (USANDO SP)
    async deleteProveedor(id: number): Promise<{ Mensaje: string }> {
        try {
            const response = await api.delete(`/proveedores/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error eliminando proveedor ${id}:`, error);
            throw new Error(`Error eliminando proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    // Generar reporte con cursor
    async generarReporteProveedores(): Promise<any[]> {
        try {
            const response = await api.get('/proveedores/reporte/cursor');
            return response.data.data;
        } catch (error) {
            console.error('Error generando reporte:', error);
            throw new Error(`Error generando reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};