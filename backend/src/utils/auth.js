const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generar hash de password
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Verificar password
const verificarPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generar token JWT
const generarToken = (usuario) => {
    const payload = {
        usuarioId: usuario.UsuarioID,
        nombreUsuario: usuario.NombreUsuario,
        email: usuario.Email,
        rol: usuario.Rol
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Generar refresh token (opcional para implementar luego)
const generarRefreshToken = (usuario) => {
    const payload = {
        usuarioId: usuario.UsuarioID,
        type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d' // Refresh token dura 7 días
    });
};

// Decodificar token sin verificar (para obtener info básica)
const decodificarToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

module.exports = {
    hashPassword,
    verificarPassword,
    generarToken,
    generarRefreshToken,
    decodificarToken
};
