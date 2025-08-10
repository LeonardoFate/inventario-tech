const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, esAdmin } = require('../middleware/auth');
const { validarLogin, validarRegistro, validarCambioPassword } = require('../middleware/validaciones');
const { limitarLogin } = require('../middleware/rateLimiting');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - password
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', limitarLogin, validarLogin, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario (solo admins)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post('/register', verificarToken, esAdmin, validarRegistro, authController.registrarUsuario);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', verificarToken, authController.obtenerPerfil);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 */
router.put('/change-password', verificarToken, validarCambioPassword, authController.cambiarPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', verificarToken, authController.logout);

module.exports = router;