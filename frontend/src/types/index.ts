// src/types/index.ts
export interface Usuario {
    id: number;
    codigo: string;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
}

export interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Proveedor {
    id: number;
    codigo: string;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    nit?: string;
    limiteCredito: number;
    saldoActual: number;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    tipo: string;
    categoriaId: number;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    stockMinimo: number;
    stockMaximo: number;
    stockActual: number;
    lote?: string;
    fechaVencimiento?: string;
    activo: boolean;
    categoria?: Categoria;
    proveedor?: Proveedor;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    usuario: Usuario;
}