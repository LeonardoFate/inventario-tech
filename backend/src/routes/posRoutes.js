// src/routes/posRoutes.js
const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { verificarToken, esAdminOGerente, esTecnicoOSuperior } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionPOS:
 *       type: object
 *       properties:
 *         nombreEmpresa:
 *           type: string
 *           description: Nombre de la empresa
 *         rucEmpresa:
 *           type: string
 *           description: RUC de la empresa
 *         direccionEmpresa:
 *           type: string
 *           description: Dirección de la empresa
 *         telefonoEmpresa:
 *           type: string
 *           description: Teléfono de la empresa
 *         emailEmpresa:
 *           type: string
 *           format: email
 *           description: Email de la empresa
 *         porcentajeIVA:
 *           type: number
 *           description: Porcentaje de IVA aplicable
 *         monedaDefecto:
 *           type: string
 *           description: Moneda por defecto (USD, EUR, etc.)
 *         prefijoFactura:
 *           type: string
 *           description: Prefijo para números de factura
 *         mensajePieFactura:
 *           type: string
 *           description: Mensaje que aparece al pie de la factura
 *         imprimirAutomatico:
 *           type: boolean
 *           description: Si se debe imprimir automáticamente
 *         requiereClienteObligatorio:
 *           type: boolean
 *           description: Si es obligatorio especificar cliente
 *         permiteVentaCredito:
 *           type: boolean
 *           description: Si se permiten ventas a crédito
 *         diasVencimientoCredito:
 *           type: integer
 *           description: Días de vencimiento para créditos
 */

/**
 * @swagger
 * /api/pos/configuracion:
 *   get:
 *     summary: Obtener configuración del POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 */
router.get('/configuracion', verificarToken, posController.obtenerConfiguracionPOS);

/**
 * @swagger
 * /api/pos/configuracion:
 *   put:
 *     summary: Actualizar configuración del POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfiguracionPOS'
 */
router.put('/configuracion', verificarToken, esAdminOGerente, posController.actualizarConfiguracionPOS);

/**
 * @swagger
 * /api/pos/dispositivos-venta:
 *   get:
 *     summary: Obtener dispositivos disponibles para venta
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: marca
 *         schema:
 *           type: integer
 *         description: Filtrar por marca
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Búsqueda por texto libre
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 */
router.get('/dispositivos-venta', verificarToken, posController.obtenerDispositivosParaVenta);

/**
 * @swagger
 * /api/pos/validar-stock:
 *   post:
 *     summary: Validar stock disponible antes de venta
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dispositivoId
 *               - cantidad
 *             properties:
 *               dispositivoId:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 */
router.post('/validar-stock', verificarToken, posController.validarStock);

/**
 * @swagger
 * /api/pos/calcular-totales:
 *   post:
 *     summary: Calcular totales de venta (subtotal, IVA, descuentos)
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dispositivoId:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precioUnitario:
 *                       type: number
 *                     descuento:
 *                       type: number
 *               descuentoGlobal:
 *                 type: number
 *                 description: Descuento aplicado a toda la venta
 */
router.post('/calcular-totales', verificarToken, posController.calcularTotales);

/**
 * @swagger
 * /api/pos/siguiente-factura:
 *   get:
 *     summary: Obtener el próximo número de factura
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 */
router.get('/siguiente-factura', verificarToken, posController.obtenerProximoNumeroFactura);

/**
 * @swagger
 * /api/pos/buscar-cliente:
 *   get:
 *     summary: Búsqueda rápida de cliente para POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buscar
 *         required: true
 *         schema:
 *           type: string
 *           minimum: 2
 *         description: Término de búsqueda (mínimo 2 caracteres)
 */
router.get('/buscar-cliente', verificarToken, posController.buscarClienteRapido);

/**
 * @swagger
 * /api/pos/resumen-caja:
 *   get:
 *     summary: Obtener resumen de caja del día
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica (por defecto hoy)
 */
router.get('/resumen-caja', verificarToken, posController.obtenerResumenCaja);

module.exports = router;