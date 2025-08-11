// src/middleware/validacionesClientes.js
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

// Validación de cédula ecuatoriana
const validarCedulaEcuatoriana = (value) => {
    if (!value || value.length !== 10) return false;
    
    const digits = value.split('').map(Number);
    const province = parseInt(value.substring(0, 2));
    
    // Validar provincia (01-24)
    if (province < 1 || province > 24) return false;
    
    // Algoritmo de validación de cédula ecuatoriana
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
        let product = digits[i] * coefficients[i];
        if (product > 9) product -= 9;
        sum += product;
    }
    
    const lastDigit = (10 - (sum % 10)) % 10;
    return digits[9] === lastDigit;
};

// Validación de RUC ecuatoriano
const validarRUCEcuatoriano = (value) => {
    if (!value || value.length !== 13) return false;
    
    const digits = value.split('').map(Number);
    const province = parseInt(value.substring(0, 2));
    const thirdDigit = digits[2];
    
    // Validar provincia
    if (province < 1 || province > 24) return false;
    
    // Persona natural (tercer dígito < 6)
    if (thirdDigit < 6) {
        const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            let product = digits[i] * coefficients[i];
            if (product > 9) product -= 9;
            sum += product;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return digits[9] === checkDigit && value.substring(10) === '001';
    }
    
    // Empresa privada (tercer dígito = 9)
    if (thirdDigit === 9) {
        const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * coefficients[i];
        }
        
        const checkDigit = 11 - (sum % 11);
        const finalCheckDigit = checkDigit === 11 ? 0 : (checkDigit === 10 ? 1 : checkDigit);
        return digits[9] === finalCheckDigit && value.substring(10) === '001';
    }
    
    // Empresa pública (tercer dígito = 6)
    if (thirdDigit === 6) {
        const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        
        for (let i = 0; i < 8; i++) {
            sum += digits[i] * coefficients[i];
        }
        
        const checkDigit = 11 - (sum % 11);
        const finalCheckDigit = checkDigit === 11 ? 0 : (checkDigit === 10 ? 1 : checkDigit);
        return digits[8] === finalCheckDigit && value.substring(9) === '0001';
    }
    
    return false;
};

// Validaciones para crear cliente
const validarCliente = [
    body('tipoDocumento')
        .isIn(['Cedula', 'RUC', 'Pasaporte'])
        .withMessage('Tipo de documento debe ser: Cedula, RUC o Pasaporte'),
    
    body('numeroDocumento')
        .notEmpty()
        .withMessage('El número de documento es requerido')
        .isLength({ min: 8, max: 20 })
        .withMessage('El número de documento debe tener entre 8 y 20 caracteres')
        .custom((value, { req }) => {
            const tipoDocumento = req.body.tipoDocumento;
            
            if (tipoDocumento === 'Cedula') {
                if (!validarCedulaEcuatoriana(value)) {
                    throw new Error('Número de cédula ecuatoriana inválido');
                }
            } else if (tipoDocumento === 'RUC') {
                if (!validarRUCEcuatoriano(value)) {
                    throw new Error('Número de RUC ecuatoriano inválido');
                }
            } else if (tipoDocumento === 'Pasaporte') {
                if (!/^[A-Z0-9]{6,20}$/.test(value)) {
                    throw new Error('Número de pasaporte inválido (solo letras mayúsculas y números)');
                }
            }
            
            return true;
        }),
    
    body('nombres')
        .notEmpty()
        .withMessage('Los nombres son requeridos')
        .isLength({ min: 2, max: 100 })
        .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('Los nombres solo pueden contener letras y espacios'),
    
    body('apellidos')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios'),
    
    body('razonSocial')
        .optional()
        .isLength({ min: 2, max: 200 })
        .withMessage('La razón social debe tener entre 2 y 200 caracteres'),
    
    body('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('telefono')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Formato de teléfono inválido')
        .isLength({ min: 7, max: 15 })
        .withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
    
    body('direccion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La dirección no puede tener más de 500 caracteres'),
    
    body('ciudad')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('La ciudad debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('La ciudad solo puede contener letras y espacios'),
    
    body('provincia')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('La provincia debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('La provincia solo puede contener letras y espacios'),
    
    body('fechaNacimiento')
        .optional()
        .isISO8601()
        .withMessage('Fecha de nacimiento debe ser una fecha válida')
        .custom((value) => {
            const fechaNacimiento = new Date(value);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            
            if (edad < 0 || edad > 120) {
                throw new Error('Fecha de nacimiento debe estar entre 0 y 120 años');
            }
            
            return true;
        }),
    
    body('genero')
        .optional()
        .isIn(['Masculino', 'Femenino', 'Otro'])
        .withMessage('Género debe ser: Masculino, Femenino u Otro'),
    
    // Validación condicional: si es RUC, razón social es requerida
    body('razonSocial')
        .if(body('tipoDocumento').equals('RUC'))
        .notEmpty()
        .withMessage('La razón social es requerida para empresas (RUC)'),
    
    // Validación condicional: si es persona natural, nombres y apellidos son requeridos
    body('apellidos')
        .if(body('tipoDocumento').equals('Cedula'))
        .notEmpty()
        .withMessage('Los apellidos son requeridos para personas naturales'),
    
    manejarErroresValidacion
];

// Validaciones para actualizar cliente (campos opcionales)
const validarActualizacionCliente = [
    body('tipoDocumento')
        .optional()
        .isIn(['Cedula', 'RUC', 'Pasaporte'])
        .withMessage('Tipo de documento debe ser: Cedula, RUC o Pasaporte'),
    
    body('numeroDocumento')
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage('El número de documento debe tener entre 8 y 20 caracteres'),
    
    body('nombres')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('Los nombres solo pueden contener letras y espacios'),
    
    body('apellidos')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios'),
    
    body('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('telefono')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Formato de teléfono inválido')
        .isLength({ min: 7, max: 15 })
        .withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
    
    manejarErroresValidacion
];

// Validaciones para consultas de clientes
const validarConsultasClientes = [
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe estar entre 1 y 100'),
    
    query('tipoDocumento')
        .optional()
        .isIn(['Cedula', 'RUC', 'Pasaporte'])
        .withMessage('Tipo de documento debe ser: Cedula, RUC o Pasaporte'),
    
    query('buscar')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
    
    manejarErroresValidacion
];

// Validación para búsqueda por documento
const validarBusquedaPorDocumento = [
    param('tipoDocumento')
        .isIn(['Cedula', 'RUC', 'Pasaporte'])
        .withMessage('Tipo de documento debe ser: Cedula, RUC o Pasaporte'),
    
    param('numeroDocumento')
        .isLength({ min: 8, max: 20 })
        .withMessage('El número de documento debe tener entre 8 y 20 caracteres')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('El número de documento solo puede contener letras mayúsculas y números'),
    
    manejarErroresValidacion
];

module.exports = {
    validarCliente,
    validarActualizacionCliente,
    validarConsultasClientes,
    validarBusquedaPorDocumento,
    manejarErroresValidacion
};