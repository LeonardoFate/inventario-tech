// src/middleware/auth.js - Middleware de autenticación
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const database = require('../config/database');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Token requerido',
                message: 'Se requiere un token de autenticación válido'
            });
        }

        // Extraer el token
        const token = authHeader.substring(7); // Remover 'Bearer '

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar el usuario en la base de datos
        const result = await database.query(`
            SELECT UsuarioID, NombreUsuario, Email, Nombres, Apellidos, Rol, Departamento, Activo 
            FROM Usuarios 
            WHERE UsuarioID = @param0 AND Activo = 1
        `, [decoded.usuarioId]);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                error: 'Usuario no válido',
                message: 'El usuario no existe o está inactivo'
            });
        }

        // Agregar información del usuario al request
        req.usuario = result.recordset[0];
        
        // Actualizar último acceso
        await database.query(`
            UPDATE Usuarios 
            SET UltimoAcceso = GETDATE() 
            WHERE UsuarioID = @param0
        `, [decoded.usuarioId]);

        next();
    } catch (error) {
        console.error('Error en verificación de token:', error);
        
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

        return res.status(500).json({
            error: 'Error interno',
            message: 'Error verificando autenticación'
        });
    }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.Rol)) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
            });
        }

        next();
    };
};

// Middleware para verificar que es administrador
const esAdmin = verificarRol('Administrador');

// Middleware para verificar que es administrador o gerente
const esAdminOGerente = verificarRol('Administrador', 'Gerente');

// Middleware para verificar que es técnico, gerente o admin
const esTecnicoOSuperior = verificarRol('Administrador', 'Gerente', 'Tecnico');

// Middleware opcional (no requiere autenticación pero la procesa si existe)
const autenticacionOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.usuario = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await database.query(`
            SELECT UsuarioID, NombreUsuario, Email, Nombres, Apellidos, Rol, Departamento, Activo 
            FROM Usuarios 
            WHERE UsuarioID = @param0 AND Activo = 1
        `, [decoded.usuarioId]);

        req.usuario = result.recordset.length > 0 ? result.recordset[0] : null;
        next();
    } catch (error) {
        req.usuario = null;
        next();
    }
};

module.exports = {
    verificarToken,
    verificarRol,
    esAdmin,
    esAdminOGerente,
    esTecnicoOSuperior,
    autenticacionOpcional
};
