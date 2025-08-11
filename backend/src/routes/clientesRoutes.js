// src/routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken, esAdminOGerente, esTecnicoOSuperior } = require('../middleware/auth');
const { validarId } = require('../middleware/validaciones');
const { validarCliente, validarConsultasClientes } = require('../middleware/validacionesClientes');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - tipoDocumento
 *         - numeroDocumento
 *         - nombres
 *       properties:
 *         clienteId:
 *           type: integer
 *           description: ID único del cliente
 *         tipoDocumento:
 *           type: string
 *           enum: [Cedula, RUC, Pasaporte]
 *           description: Tipo de documento de identificación
 *         numeroDocumento:
 *           type: string
 *           description: Número del documento de identificación
 *         nombres:
 *           type: string
 *           description: Nombres del cliente
 *         apellidos:
 *           type: string
 *           description: Apellidos del cliente
 *         razonSocial:
 *           type: string
 *           description: Razón social (para empresas)
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         direccion:
 *           type: string
 *           description: Dirección física
 *         ciudad:
 *           type: string
 *           description: Ciudad de residencia
 *         provincia:
 *           type: string
 *           description: Provincia de residencia
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         genero:
 *           type: string
 *           enum: [Masculino, Femenino, Otro]
 *           description: Género del cliente
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener lista de clientes con filtros y paginación
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: [Cedula, RUC, Pasaporte]
 *         description: Filtrar por tipo de documento
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Búsqueda por texto libre
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 */
router.get('/', verificarToken, validarConsultasClientes, clientesController.obtenerClientes);

/**
 * @swagger
 * /api/clientes/generico:
 *   get:
 *     summary: Obtener cliente genérico (consumidor final)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/generico', verificarToken, clientesController.obtenerClienteGenerico);

/**
 * @swagger
 * /api/clientes/buscar/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Buscar cliente por documento
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Cedula, RUC, Pasaporte]
 *       - in: path
 *         name: numeroDocumento
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/buscar/:tipoDocumento/:numeroDocumento', verificarToken, clientesController.buscarPorDocumento);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 */
router.get('/:id', verificarToken, validarId, clientesController.obtenerClientePorId);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 */
router.post('/', verificarToken, validarCliente, clientesController.crearCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', verificarToken, esTecnicoOSuperior, validarId, clientesController.actualizarCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Desactivar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', verificarToken, esAdminOGerente, validarId, clientesController.desactivarCliente);

module.exports = router;