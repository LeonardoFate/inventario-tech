const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS - Configurar según tus necesidades
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

// Logging
app.use(morgan('combined'));

// Rate limiting debe ir antes que las rutas
const { limitarAPI } = require('./middleware/rateLimiting');
app.use('/api', limitarAPI);

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        modulos: [
            'Autenticación',
            'Dispositivos',
            'Catálogos',
            'Usuarios',
            'Asignaciones',
            'Reportes',
            'Clientes (POS)',
            'Ventas (POS)',
            'POS'
        ]
    });
});

// Importar rutas existentes
const authRoutes = require('./routes/authRoutes');
const dispositivosRoutes = require('./routes/dispositivosRoutes');
const catalogosRoutes = require('./routes/catalogosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const reportesRoutes = require('./routes/reportesRoutes');

// Importar nuevas rutas POS
const clientesRoutes = require('./routes/clientesRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const posRoutes = require('./routes/posRoutes');

// Rutas de la API - Existentes
app.use('/api/auth', authRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/reportes', reportesRoutes);

// Nuevas rutas POS
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/pos', posRoutes);

// Documentación con Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sistema de Inventario y POS API',
            version: '1.0.0',
            description: 'API para gestión de inventario de dispositivos tecnológicos con sistema POS integrado',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints para autenticación y gestión de usuarios'
            },
            {
                name: 'Dispositivos',
                description: 'Gestión del inventario de dispositivos'
            },
            {
                name: 'Catálogos',
                description: 'Gestión de categorías, marcas, ubicaciones y proveedores'
            },
            {
                name: 'Clientes',
                description: 'Gestión de clientes para el sistema POS'
            },
            {
                name: 'Ventas',
                description: 'Gestión de ventas y facturación'
            },
            {
                name: 'POS',
                description: 'Funcionalidades específicas del punto de venta'
            }
        ]
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sistema Inventario + POS API',
    customfavIcon: '/favicon.ico'
}));

// Ruta para verificar el estado del sistema
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'Connected', // TODO: Agregar verificación real de BD
        modules: {
            inventario: 'Active',
            pos: 'Active',
            auth: 'Active'
        }
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe en este servidor`,
        rutasDisponibles: [
            '/api/auth',
            '/api/dispositivos',
            '/api/catalogos',
            '/api/clientes',
            '/api/ventas',
            '/api/pos',
            '/api/usuarios',
            '/api/asignaciones',
            '/api/reportes',
            '/api-docs'
        ]
    });
});

// Manejo global de errores (DEBE IR AL FINAL)
const manejarErrores = require('./middleware/errorHandler');
app.use(manejarErrores);

module.exports = app;