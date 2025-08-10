const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
const { verificarToken, esAdminOGerente, esTecnicoOSuperior } = require('../middleware/auth');
const { 
    validarCrearDispositivo, 
    validarActualizarDispositivo, 
    validarConsultas 
} = require('../middleware/validacionesDispositivos');
const { upload, manejarErroresUpload } = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     Dispositivo:
 *       type: object
 *       required:
 *         - nombreDispositivo
 *         - categoriaId
 *         - marcaId
 *         - modelo
 *       properties:
 *         dispositivoId:
 *           type: integer
 *           description: ID único del dispositivo
 *         codigoDispositivo:
 *           type: string
 *           description: Código único generado automáticamente
 *         nombreDispositivo:
 *           type: string
 *           description: Nombre descriptivo del dispositivo
 *         categoriaId:
 *           type: integer
 *           description: ID de la categoría
 *         marcaId:
 *           type: integer
 *           description: ID de la marca
 *         modelo:
 *           type: string
 *           description: Modelo del dispositivo
 *         numeroSerie:
 *           type: string
 *           description: Número de serie único
 *         estado:
 *           type: string
 *           enum: [Disponible, Asignado, En Reparacion, Dado de Baja, Perdido]
 *           description: Estado actual del dispositivo
 *         condicion:
 *           type: string
 *           enum: [Excelente, Bueno, Regular, Malo]
 *           description: Condición física del dispositivo
 */

/**
 * @swagger
 * /api/dispositivos:
 *   get:
 *     summary: Obtener lista de dispositivos con filtros y paginación
 *     tags: [Dispositivos]
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
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Disponible, Asignado, En Reparacion, Dado de Baja, Perdido]
 *         description: Filtrar por estado
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Búsqueda por texto libre
 *     responses:
 *       200:
 *         description: Lista de dispositivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dispositivos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dispositivo'
 *                 paginacion:
 *                   type: object
 */
router.get('/', verificarToken, validarConsultas, dispositivosController.obtenerDispositivos);

/**
 * @swagger
 * /api/dispositivos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del inventario
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/estadisticas', verificarToken, dispositivosController.obtenerEstadisticas);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   get:
 *     summary: Obtener dispositivo por ID
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del dispositivo
 */
router.get('/:id', verificarToken, dispositivosController.obtenerDispositivoPorId);

/**
 * @swagger
 * /api/dispositivos:
 *   post:
 *     summary: Crear nuevo dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dispositivo'
 */
router.post('/', verificarToken, esTecnicoOSuperior, validarCrearDispositivo, dispositivosController.crearDispositivo);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   put:
 *     summary: Actualizar dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verificarToken, esTecnicoOSuperior, validarActualizarDispositivo, dispositivosController.actualizarDispositivo);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   delete:
 *     summary: Dar de baja dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verificarToken, esAdminOGerente, dispositivosController.eliminarDispositivo);

/**
 * @swagger
 * /api/dispositivos/{id}/archivos:
 *   post:
 *     summary: Subir archivos al dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: archivos
 *         type: file
 *         required: true
 *         description: Archivos a subir (máximo 5)
 *       - in: formData
 *         name: tipoAdjunto
 *         type: string
 *         enum: [Factura, Manual, Foto, Garantia, Otro]
 */
router.post('/:id/archivos', 
    verificarToken, 
    upload.array('archivos', 5), 
    manejarErroresUpload, 
    dispositivosController.subirArchivos
);

/**
 * @swagger
 * /api/dispositivos/{id}/archivos/{archivoId}:
 *   delete:
 *     summary: Eliminar archivo del dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/archivos/:archivoId', verificarToken, esTecnicoOSuperior, dispositivosController.eliminarArchivo);

module.exports = router;