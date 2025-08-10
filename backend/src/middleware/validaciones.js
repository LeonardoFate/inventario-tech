const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
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

// Validaciones para login
const validarLogin = [
    body('nombreUsuario')
        .notEmpty()
        .withMessage('El nombre de usuario es requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    manejarErroresValidacion
];

// Validaciones para registro
const validarRegistro = [
    body('nombreUsuario')
        .notEmpty()
        .withMessage('El nombre de usuario es requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    body('nombres')
        .notEmpty()
        .withMessage('Los nombres son requeridos')
        .isLength({ min: 2, max: 50 })
        .withMessage('Los nombres deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los nombres solo pueden contener letras y espacios'),
    
    body('apellidos')
        .notEmpty()
        .withMessage('Los apellidos son requeridos')
        .isLength({ min: 2, max: 50 })
        .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios'),
    
    body('cedula')
        .optional()
        .isLength({ min: 10, max: 10 })
        .withMessage('La cédula debe tener exactamente 10 dígitos')
        .matches(/^\d{10}$/)
        .withMessage('La cédula solo puede contener números'),
    
    body('rol')
        .optional()
        .isIn(['Administrador', 'Gerente', 'Tecnico', 'Empleado'])
        .withMessage('Rol no válido'),
    
    body('departamento')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El departamento no puede tener más de 50 caracteres'),
    
    manejarErroresValidacion
];

// Validación para cambio de contraseña
const validarCambioPassword = [
    body('passwordActual')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    
    body('passwordNuevo')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.passwordNuevo) {
                throw new Error('La confirmación de contraseña no coincide');
            }
            return true;
        }),
    
    manejarErroresValidacion
];

// Validación de ID de parámetro
const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    manejarErroresValidacion
];

module.exports = {
    manejarErroresValidacion,
    validarLogin,
    validarRegistro,
    validarCambioPassword,
    validarId
};