// En backend/src/routes/dispositivosRoutes.js
// REORDENA las rutas - las rutas específicas ANTES que las genéricas

const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
const { verificarToken, esAdminOGerente, esTecnicoOSuperior } = require('../middleware/auth');
const { 
    validarCrearDispositivo, 
    validarActualizarDispositivo, 
    validarConsultas,
    validarIdDispositivo 
} = require('../middleware/validacionesDispositivos');
const { upload, manejarErroresUpload } = require('../middleware/upload');

// ✅ IMPORTANTE: Rutas específicas PRIMERO, antes de las rutas con parámetros

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
 * /api/dispositivos:
 *   get:
 *     summary: Obtener lista de dispositivos con filtros y paginación
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verificarToken, validarConsultas, dispositivosController.obtenerDispositivos);

/**
 * @swagger
 * /api/dispositivos:
 *   post:
 *     summary: Crear nuevo dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verificarToken, esTecnicoOSuperior, validarCrearDispositivo, dispositivosController.crearDispositivo);

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
router.get('/:id', verificarToken, validarIdDispositivo, dispositivosController.obtenerDispositivoPorId);

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