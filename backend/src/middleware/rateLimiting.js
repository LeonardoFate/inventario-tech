// src/middleware/rateLimiting.js - Rate limiting para seguridad
const rateLimit = require('express-rate-limit');

// Rate limiting para login (prevenir ataques de fuerza bruta)
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos por IP
    message: {
        error: 'Demasiados intentos de login',
        message: 'Has excedido el límite de intentos de login. Intenta de nuevo en 15 minutos.',
        tiempoEspera: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting general para API
const limitarAPI = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests por IP
    message: {
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes por IP. Intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    limitarLogin,
    limitarAPI
};
