// backend/src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middleware/auth');
const database = require('../config/database');

// Obtener todos los usuarios (solo para admins)
router.get('/', verificarToken, esAdmin, async (req, res) => {
    try {
        console.log('📋 Backend - Obteniendo lista de usuarios');
        
        const resultado = await database.query(`
            SELECT u.UsuarioID, u.NombreUsuario, u.Email, u.Nombres, u.Apellidos, 
                   u.Cedula, u.Rol, u.Departamento, u.Activo, u.FechaCreacion, 
                   u.UltimoAcceso, ub.NombreUbicacion, u.UbicacionID
            FROM Usuarios u
            LEFT JOIN Ubicaciones ub ON u.UbicacionID = ub.UbicacionID
            WHERE u.Activo = 1
            ORDER BY u.FechaCreacion DESC
        `);
        
        console.log(`✅ Backend - ${resultado.recordset.length} usuarios encontrados`);
        
        // Retornar directamente el array de usuarios
        res.json(resultado.recordset);
        
    } catch (error) {
        console.error('❌ Backend - Error obteniendo usuarios:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo la lista de usuarios'
        });
    }
});

// Obtener usuario por ID
router.get('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const resultado = await database.query(`
            SELECT u.UsuarioID, u.NombreUsuario, u.Email, u.Nombres, u.Apellidos, 
                   u.Cedula, u.Rol, u.Departamento, u.Activo, u.FechaCreacion, 
                   u.UltimoAcceso, ub.NombreUbicacion
            FROM Usuarios u
            LEFT JOIN Ubicaciones ub ON u.UbicacionID = ub.UbicacionID
            WHERE u.UsuarioID = @param0
        `, [id]);
        
        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No existe un usuario con ID ${id}`
            });
        }
        
        res.json(resultado.recordset[0]);
        
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el usuario'
        });
    }
});

// Actualizar usuario
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, email, cedula, rol, departamento, ubicacionId, activo } = req.body;
        
        // Verificar si el usuario existe
        const usuarioExiste = await database.query(`
            SELECT UsuarioID FROM Usuarios WHERE UsuarioID = @param0
        `, [id]);
        
        if (usuarioExiste.recordset.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Actualizar usuario
        await database.query(`
            UPDATE Usuarios 
            SET Nombres = @param0, Apellidos = @param1, Email = @param2, 
                Cedula = @param3, Rol = @param4, Departamento = @param5, 
                UbicacionID = @param6, Activo = @param7, FechaActualizacion = GETDATE()
            WHERE UsuarioID = @param8
        `, [nombres, apellidos, email, cedula, rol, departamento, ubicacionId, activo, id]);
        
        res.json({
            mensaje: 'Usuario actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error actualizando el usuario'
        });
    }
});

// Eliminar usuario (desactivar)
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // No permitir eliminar al propio usuario admin
        if (parseInt(id) === req.usuario.UsuarioID) {
            return res.status(400).json({
                error: 'Operación no permitida',
                message: 'No puedes eliminar tu propio usuario'
            });
        }
        
        // Desactivar usuario en lugar de eliminar
        await database.query(`
            UPDATE Usuarios 
            SET Activo = 0, FechaActualizacion = GETDATE()
            WHERE UsuarioID = @param0
        `, [id]);
        
        res.json({
            mensaje: 'Usuario desactivado exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error eliminando el usuario'
        });
    }
});

module.exports = router;