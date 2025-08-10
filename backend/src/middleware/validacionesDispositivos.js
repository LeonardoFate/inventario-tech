const { body, param, query, validationResult } = require('express-validator');

const manejarErroresValidacion = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Errores de validación',
            detalles: errors.array().map(error => ({
                campo: error.path,
                valor: error.value,
                mensaje: error.msg
            }))
        });
    }
    
    next();
};

// Validaciones para crear dispositivo
const validarCrearDispositivo = [
    body('nombreDispositivo')
        .notEmpty()
        .withMessage('El nombre del dispositivo es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    
    body('categoriaId')
        .isInt({ min: 1 })
        .withMessage('La categoría debe ser un ID válido'),
    
    body('marcaId')
        .isInt({ min: 1 })
        .withMessage('La marca debe ser un ID válido'),
    
    body('modelo')
        .notEmpty()
        .withMessage('El modelo es requerido')
        .isLength({ max: 100 })
        .withMessage('El modelo no puede tener más de 100 caracteres'),
    
    body('numeroSerie')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El número de serie no puede tener más de 100 caracteres'),
    
    body('estado')
        .optional()
        .isIn(['Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido'])
        .withMessage('Estado no válido'),
    
    body('condicion')
        .optional()
        .isIn(['Excelente', 'Bueno', 'Regular', 'Malo'])
        .withMessage('Condición no válida'),
    
    body('precioCompra')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    
    body('fechaCompra')
        .optional()
        .isISO8601()
        .withMessage('Fecha de compra debe ser una fecha válida'),
    
    body('vencimientoGarantia')
        .optional()
        .isISO8601()
        .withMessage('Vencimiento de garantía debe ser una fecha válida'),
    
    manejarErroresValidacion
];

// Validaciones para actualizar dispositivo
const validarActualizarDispositivo = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('nombreDispositivo')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    
    body('categoriaId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La categoría debe ser un ID válido'),
    
    body('marcaId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La marca debe ser un ID válido'),
    
    body('modelo')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El modelo debe tener entre 1 y 100 caracteres'),
    
    body('estado')
        .optional()
        .isIn(['Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido'])
        .withMessage('Estado no válido'),
    
    body('condicion')
        .optional()
        .isIn(['Excelente', 'Bueno', 'Regular', 'Malo'])
        .withMessage('Condición no válida'),
    
    manejarErroresValidacion
];

// Validaciones para consultas
const validarConsultas = [
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe estar entre 1 y 100'),
    
    query('categoria')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La categoría debe ser un ID válido'),
    
    query('estado')
        .optional()
        .isIn(['Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido'])
        .withMessage('Estado no válido'),
    
    query('buscar')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    
    manejarErroresValidacion
];

module.exports = {
    validarCrearDispositivo,
    validarActualizarDispositivo,
    validarConsultas,
    manejarErroresValidacion
};