const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');
const { verificarToken, esAdminOGerente } = require('../middleware/auth');

/**
 * @swagger
 * /api/catalogos/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/categorias', verificarToken, catalogosController.obtenerCategorias);

/**
 * @swagger
 * /api/catalogos/marcas:
 *   get:
 *     summary: Obtener todas las marcas
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/marcas', verificarToken, catalogosController.obtenerMarcas);

/**
 * @swagger
 * /api/catalogos/ubicaciones:
 *   get:
 *     summary: Obtener todas las ubicaciones
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/ubicaciones', verificarToken, catalogosController.obtenerUbicaciones);

/**
 * @swagger
 * /api/catalogos/proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/proveedores', verificarToken, catalogosController.obtenerProveedores);

/**
 * @swagger
 * /api/catalogos/categorias:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/categorias', verificarToken, esAdminOGerente, catalogosController.crearCategoria);

/**
 * @swagger
 * /api/catalogos/marcas:
 *   post:
 *     summary: Crear nueva marca
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/marcas', verificarToken, esAdminOGerente, catalogosController.crearMarca);

module.exports = router;