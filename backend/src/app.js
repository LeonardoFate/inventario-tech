const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Rate limiting debe ir antes que las rutas
const { limitarAPI } = require('./middleware/rateLimiting');
app.use('/api', limitarAPI);

// Middleware de seguridad
app.use(helmet());

// CORS - Configurar según tus necesidades
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const dispositivosRoutes = require('./routes/dispositivosRoutes');
const catalogosRoutes = require('./routes/catalogosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const reportesRoutes = require('./routes/reportesRoutes');

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Documentación con Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sistema de Inventario API',
            version: '1.0.0',
            description: 'API para gestión de inventario de dispositivos tecnológicos',
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
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe en este servidor`
    });
});

// Manejo global de errores (DEBE IR AL FINAL)
const manejarErrores = require('./middleware/errorHandler');
app.use(manejarErrores);

module.exports = app;