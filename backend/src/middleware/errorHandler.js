const manejarErrores = (error, req, res, next) => {
    console.error('Error capturado:', {
        mensaje: error.message,
        stack: error.stack,
        url: req.url,
        metodo: req.method,
        usuario: req.usuario?.UsuarioID || 'No autenticado',
        timestamp: new Date().toISOString()
    });

    // Error de validación de Joi o express-validator
    if (error.name === 'ValidationError' || error.details) {
        return res.status(400).json({
            error: 'Error de validación',
            message: 'Los datos enviados no son válidos',
            detalles: error.details || error.message
        });
    }

    // Error de autenticación JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'El token de acceso no es válido'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            message: 'El token de acceso ha expirado'
        });
    }

    // Error de base de datos SQL Server
    if (error.code && error.code.startsWith('EREQUEST')) {
        // Constraint violations
        if (error.number === 2627) { // Unique constraint
            return res.status(400).json({
                error: 'Datos duplicados',
                message: 'Ya existe un registro con esos datos'
            });
        }

        if (error.number === 547) { // Foreign key constraint
            return res.status(400).json({
                error: 'Referencia inválida',
                message: 'Los datos hacen referencia a registros que no existen'
            });
        }

        return res.status(500).json({
            error: 'Error de base de datos',
            message: 'Error en la operación de base de datos'
        });
    }

    // Error de archivo/upload
    if (error.code === 'ENOENT') {
        return res.status(404).json({
            error: 'Archivo no encontrado',
            message: 'El archivo solicitado no existe'
        });
    }

    if (error.code === 'EACCES') {
        return res.status(500).json({
            error: 'Error de permisos',
            message: 'No se tienen permisos para acceder al archivo'
        });
    }

    // Error genérico del servidor
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Ha ocurrido un error inesperado'
    });
};

module.exports = manejarErrores;