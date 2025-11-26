// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar rutas usando ES6 import
import apiRoutes from './routes/api';

dotenv.config();

const app = express();


// ✅ CONFIGURAR CORS CORRECTAMENTE
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // URLs del frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'SQL Server (Stored Procedures)'
    });
});

// ✅ USAR LAS RUTAS DE LA API - CORREGIDO
app.use('/api', apiRoutes);

// Ruta raíz
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        message: '🏥 API Comercializadora de Productos Médicos',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            test: '/api/test',
            inventario: '/api/productos/inventario'
        }
    });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;