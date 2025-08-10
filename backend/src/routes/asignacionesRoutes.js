const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');

// Placeholder para rutas de asignaciones
router.get('/', verificarToken, (req, res) => {
    res.json({ mensaje: 'Ruta de asignaciones - pendiente implementar' });
});

module.exports = router;