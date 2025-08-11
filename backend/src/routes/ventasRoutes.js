// src/routes/ventasRoutes.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken, esAdminOGerente, esTecnicoOSuperior } = require('../middleware/auth');
const { validarId } = require('../middleware/validaciones');
const { validarVenta, validarPago, validarConsultasVentas } = require('../middleware/validacionesVentas');

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       required:
 *         - clienteId
 *         - items
 *         - formaPago
 *       properties:
 *         ventaId:
 *           type: integer
 *           description: ID único de la venta
 *         numeroFactura:
 *           type: string
 *           description: Número de factura generado automáticamente
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *         vendedorId:
 *           type: integer
 *           description: ID del vendedor (usuario actual)
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dispositivoId:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               precioUnitario:
 *                 type: number
 *               descuento:
 *                 type: number
 *         formaPago:
 *           type: string
 *           enum: [Efectivo, Tarjeta, Transferencia, Credito]
 *         descuentoGlobal:
 *           type: number
 *           description: Descuento aplicado a toda la venta
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener lista de ventas con filtros y paginación
 *     tags: [Ventas]
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
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: vendedorId
 *         schema:
 *           type: integer
 *         description: Filtrar por vendedor
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *       - in: query
 *         name: estadoVenta
 *         schema:
 *           type: string
 *           enum: [Completada, Cancelada, Devuelta]
 *         description: Filtrar por estado de venta
 *       - in: query
 *         name: estadoPago
 *         schema:
 *           type: string
 *           enum: [Pagado, Pendiente, Parcial]
 *         description: Filtrar por estado de pago
 *       - in: query
 *         name: formaPago
 *         schema:
 *           type: string
 *           enum: [Efectivo, Tarjeta, Transferencia, Credito]
 *         description: Filtrar por forma de pago
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Búsqueda por texto libre
 *     responses:
 *       200:
 *         description: Lista de ventas obtenida exitosamente
 */
router.get('/', verificarToken, validarConsultasVentas, ventasController.obtenerVentas);

/**
 * @swagger
 * /api/ventas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (opcional)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (opcional)
 */
router.get('/estadisticas', verificarToken, ventasController.obtenerEstadisticasVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID con detalles completos
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 */
router.get('/:id', verificarToken, validarId, ventasController.obtenerVentaPorId);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear nueva venta completa
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venta'
 */
router.post('/', verificarToken, esTecnicoOSuperior, validarVenta, ventasController.crearVenta);

/**
 * @swagger
 * /api/ventas/{id}/estado:
 *   put:
 *     summary: Actualizar estado de venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estadoVenta:
 *                 type: string
 *                 enum: [Completada, Cancelada, Devuelta]
 *               estadoPago:
 *                 type: string
 *                 enum: [Pagado, Pendiente, Parcial]
 *               observaciones:
 *                 type: string
 */
router.put('/:id/estado', verificarToken, esTecnicoOSuperior, validarId, ventasController.actualizarEstadoVenta);

/**
 * @swagger
 * /api/ventas/{id}/cancelar:
 *   put:
 *     summary: Cancelar venta (restaura stock)
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la cancelación
 */
router.put('/:id/cancelar', verificarToken, esAdminOGerente, validarId, ventasController.cancelarVenta);

/**
 * @swagger
 * /api/ventas/{id}/pagos:
 *   post:
 *     summary: Registrar pago de venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - formaPago
 *             properties:
 *               monto:
 *                 type: number
 *                 minimum: 0.01
 *               formaPago:
 *                 type: string
 *                 enum: [Efectivo, Tarjeta, Transferencia]
 *               numeroTransaccion:
 *                 type: string
 *               observaciones:
 *                 type: string
 */
router.post('/:id/pagos', verificarToken, esTecnicoOSuperior, validarId, validarPago, ventasController.registrarPago);

module.exports = router;