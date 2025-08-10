const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');

// Placeholder para rutas de reportes
router.get('/', verificarToken, (req, res) => {
    res.json({ mensaje: 'Ruta de reportes - pendiente implementar' });
});

module.exports = router;