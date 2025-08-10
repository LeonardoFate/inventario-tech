const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');

// Placeholder para rutas de usuarios
router.get('/', verificarToken, (req, res) => {
    res.json({ mensaje: 'Ruta de usuarios - pendiente implementar' });
});

module.exports = router;
