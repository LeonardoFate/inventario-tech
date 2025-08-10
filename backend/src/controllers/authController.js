// src/controllers/authController.js - Controlador de autenticación
const database = require('../config/database');
const { hashPassword, verificarPassword, generarToken } = require('../utils/auth');

// Login de usuario
const login = async (req, res) => {
    try {
        const { nombreUsuario, password } = req.body;

        // Buscar usuario en la base de datos
        const result = await database.query(`
            SELECT UsuarioID, NombreUsuario, Email, ClaveHash, Nombres, Apellidos, 
                   Rol, Departamento, UbicacionID, Activo
            FROM Usuarios 
            WHERE (NombreUsuario = @param0 OR Email = @param0) AND Activo = 1
        `, [nombreUsuario]);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Usuario o contraseña incorrectos'
            });
        }

        const usuario = result.recordset[0];

        // Verificar contraseña
        const passwordValido = await verificarPassword(password, usuario.ClaveHash);
        
        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Usuario o contraseña incorrectos'
            });
        }

        // Generar token
        const token = generarToken(usuario);

        // Actualizar último acceso
        await database.query(`
            UPDATE Usuarios 
            SET UltimoAcceso = GETDATE() 
            WHERE UsuarioID = @param0
        `, [usuario.UsuarioID]);

        // Respuesta exitosa (no incluir el hash de la contraseña)
        const { ClaveHash, ...usuarioSeguro } = usuario;
        
        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: usuarioSeguro,
            tiempoExpiracion: process.env.JWT_EXPIRES_IN || '24h'
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error procesando el login'
        });
    }
};

// Registro de usuario (solo para admins)
const registrarUsuario = async (req, res) => {
    try {
        const { 
            nombreUsuario, 
            email, 
            password, 
            nombres, 
            apellidos, 
            cedula, 
            rol = 'Empleado', 
            departamento,
            ubicacionId 
        } = req.body;

        // Verificar si el usuario o email ya existen
        const existeUsuario = await database.query(`
            SELECT UsuarioID FROM Usuarios 
            WHERE NombreUsuario = @param0 OR Email = @param1
        `, [nombreUsuario, email]);

        if (existeUsuario.recordset.length > 0) {
            return res.status(400).json({
                error: 'Usuario ya existe',
                message: 'Ya existe un usuario con ese nombre de usuario o email'
            });
        }

        // Hash de la contraseña
        const claveHash = await hashPassword(password);

        // Insertar nuevo usuario
        const result = await database.query(`
            INSERT INTO Usuarios (NombreUsuario, Email, ClaveHash, Nombres, Apellidos, 
                                Cedula, Rol, Departamento, UbicacionID, CreadoPor)
            OUTPUT INSERTED.UsuarioID, INSERTED.NombreUsuario, INSERTED.Email, 
                   INSERTED.Nombres, INSERTED.Apellidos, INSERTED.Rol
            VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
        `, [nombreUsuario, email, claveHash, nombres, apellidos, cedula, rol, departamento, ubicacionId, req.usuario.UsuarioID]);

        const nuevoUsuario = result.recordset[0];

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando el usuario'
        });
    }
};

// Obtener perfil del usuario actual
const obtenerPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuario.UsuarioID;

        const result = await database.query(`
            SELECT u.UsuarioID, u.NombreUsuario, u.Email, u.Nombres, u.Apellidos, 
                   u.Cedula, u.Rol, u.Departamento, u.FechaCreacion, u.UltimoAcceso,
                   ub.NombreUbicacion, ub.Ciudad, ub.Provincia
            FROM Usuarios u
            LEFT JOIN Ubicaciones ub ON u.UbicacionID = ub.UbicacionID
            WHERE u.UsuarioID = @param0 AND u.Activo = 1
        `, [usuarioId]);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: 'El usuario no existe'
            });
        }

        res.json({
            usuario: result.recordset[0]
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el perfil del usuario'
        });
    }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNuevo } = req.body;
        const usuarioId = req.usuario.UsuarioID;

        // Obtener hash actual
        const result = await database.query(`
            SELECT ClaveHash FROM Usuarios WHERE UsuarioID = @param0
        `, [usuarioId]);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const passwordValido = await verificarPassword(passwordActual, result.recordset[0].ClaveHash);
        
        if (!passwordValido) {
            return res.status(400).json({
                error: 'Contraseña actual incorrecta'
            });
        }

        // Hash de la nueva contraseña
        const nuevoHash = await hashPassword(passwordNuevo);

        // Actualizar contraseña
        await database.query(`
            UPDATE Usuarios 
            SET ClaveHash = @param0, FechaActualizacion = GETDATE()
            WHERE UsuarioID = @param1
        `, [nuevoHash, usuarioId]);

        res.json({
            mensaje: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error cambiando la contraseña'
        });
    }
};

// Logout (invalidar token - implementación básica)
const logout = async (req, res) => {
    try {
        // En una implementación más robusta, aquí agregarías el token a una blacklist
        // Por ahora, solo respondemos exitosamente
        res.json({
            mensaje: 'Logout exitoso'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error procesando el logout'
        });
    }
};

module.exports = {
    login,
    registrarUsuario,
    obtenerPerfil,
    cambiarPassword,
    logout
};