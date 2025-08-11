// src/middleware/validacionesVentas.js
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

// Validaciones para crear venta
const validarVenta = [
    body('clienteId')
        .isInt({ min: 1 })
        .withMessage('El ID del cliente debe ser un número entero positivo'),
    
    body('items')
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un item en la venta'),
    
    body('items.*.dispositivoId')
        .isInt({ min: 1 })
        .withMessage('El ID del dispositivo debe ser un número entero positivo'),
    
    body('items.*.cantidad')
        .isInt({ min: 1, max: 1000 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 1000'),
    
    body('items.*.precioUnitario')
        .isFloat({ min: 0.01 })
        .withMessage('El precio unitario debe ser un número positivo mayor a 0'),
    
    body('items.*.descuento')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser un número positivo o cero')
        .custom((value, { req }) => {
            const itemIndex = req.body.items.findIndex(item => item.descuento === value);
            if (itemIndex !== -1) {
                const item = req.body.items[itemIndex];
                const subtotal = item.precioUnitario * item.cantidad;
                if (value > subtotal) {
                    throw new Error('El descuento no puede ser mayor al subtotal del item');
                }
            }
            return true;
        }),
    
    body('formaPago')
        .isIn(['Efectivo', 'Tarjeta', 'Transferencia', 'Credito'])
        .withMessage('Forma de pago debe ser: Efectivo, Tarjeta, Transferencia o Credito'),
    
    body('descuentoGlobal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento global debe ser un número positivo o cero'),
    
    body('observaciones')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las observaciones no pueden tener más de 1000 caracteres'),
    
    // Validación personalizada para verificar que los items no estén duplicados
    body('items')
        .custom((items) => {
            const dispositivoIds = items.map(item => item.dispositivoId);
            const uniqueIds = [...new Set(dispositivoIds)];
            
            if (dispositivoIds.length !== uniqueIds.length) {
                throw new Error('No se pueden incluir dispositivos duplicados en la misma venta');
            }
            
            return true;
        }),
    
    manejarErroresValidacion
];

// Validaciones para actualizar estado de venta
const validarActualizacionEstadoVenta = [
    body('estadoVenta')
        .optional()
        .isIn(['Completada', 'Cancelada', 'Devuelta'])
        .withMessage('Estado de venta debe ser: Completada, Cancelada o Devuelta'),
    
    body('estadoPago')
        .optional()
        .isIn(['Pagado', 'Pendiente', 'Parcial', 'Cancelado'])
        .withMessage('Estado de pago debe ser: Pagado, Pendiente, Parcial o Cancelado'),
    
    body('observaciones')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las observaciones no pueden tener más de 1000 caracteres'),
    
    // Al menos uno de los campos debe estar presente
    body()
        .custom((body) => {
            if (!body.estadoVenta && !body.estadoPago && body.observaciones === undefined) {
                throw new Error('Debe proporcionar al menos un campo para actualizar');
            }
            return true;
        }),
    
    manejarErroresValidacion
];

// Validaciones para registrar pago
const validarPago = [
    body('monto')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser un número positivo mayor a 0'),
    
    body('formaPago')
        .isIn(['Efectivo', 'Tarjeta', 'Transferencia'])
        .withMessage('Forma de pago debe ser: Efectivo, Tarjeta o Transferencia'),
    
    body('numeroTransaccion')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El número de transacción debe tener entre 1 y 100 caracteres')
        .matches(/^[A-Z0-9\-]+$/)
        .withMessage('El número de transacción solo puede contener letras mayúsculas, números y guiones'),
    
    body('observaciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las observaciones no pueden tener más de 500 caracteres'),
    
    // Validación condicional: si es tarjeta o transferencia, número de transacción es requerido
    body('numeroTransaccion')
        .if(body('formaPago').isIn(['Tarjeta', 'Transferencia']))
        .notEmpty()
        .withMessage('El número de transacción es requerido para pagos con tarjeta o transferencia'),
    
    manejarErroresValidacion
];

// Validaciones para consultas de ventas
const validarConsultasVentas = [
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe estar entre 1 y 100'),
    
    query('clienteId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del cliente debe ser un número entero positivo'),
    
    query('vendedorId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del vendedor debe ser un número entero positivo'),
    
    query('fechaInicio')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser una fecha válida (formato: YYYY-MM-DD)'),
    
    query('fechaFin')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser una fecha válida (formato: YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (req.query.fechaInicio && value) {
                const fechaInicio = new Date(req.query.fechaInicio);
                const fechaFin = new Date(value);
                
                if (fechaFin < fechaInicio) {
                    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
                }
                
                // Verificar que el rango no sea mayor a 1 año
                const unAnoEnMs = 365 * 24 * 60 * 60 * 1000;
                if (fechaFin - fechaInicio > unAnoEnMs) {
                    throw new Error('El rango de fechas no puede ser mayor a un año');
                }
            }
            
            return true;
        }),
    
    query('estadoVenta')
        .optional()
        .isIn(['Completada', 'Cancelada', 'Devuelta'])
        .withMessage('Estado de venta debe ser: Completada, Cancelada o Devuelta'),
    
    query('estadoPago')
        .optional()
        .isIn(['Pagado', 'Pendiente', 'Parcial', 'Cancelado'])
        .withMessage('Estado de pago debe ser: Pagado, Pendiente, Parcial o Cancelado'),
    
    query('formaPago')
        .optional()
        .isIn(['Efectivo', 'Tarjeta', 'Transferencia', 'Credito'])
        .withMessage('Forma de pago debe ser: Efectivo, Tarjeta, Transferencia o Credito'),
    
    query('buscar')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
    
    query('ordenPor')
        .optional()
        .isIn(['FechaVenta', 'NumeroFactura', 'Total', 'Cliente', 'Vendedor'])
        .withMessage('Campo de ordenamiento debe ser: FechaVenta, NumeroFactura, Total, Cliente o Vendedor'),
    
    query('orden')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Orden debe ser: ASC o DESC'),
    
    manejarErroresValidacion
];

// Validaciones para cancelación de venta
const validarCancelacionVenta = [
    body('motivo')
        .optional()
        .isLength({ min: 10, max: 500 })
        .withMessage('El motivo de cancelación debe tener entre 10 y 500 caracteres'),
    
    manejarErroresValidacion
];

// Validaciones para estadísticas de ventas
const validarEstadisticasVentas = [
    query('fechaInicio')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser una fecha válida (formato: YYYY-MM-DD)'),
    
    query('fechaFin')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser una fecha válida (formato: YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (req.query.fechaInicio && value) {
                const fechaInicio = new Date(req.query.fechaInicio);
                const fechaFin = new Date(value);
                
                if (fechaFin < fechaInicio) {
                    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
                }
            }
            
            return true;
        }),
    
    manejarErroresValidacion
];

// Validaciones para items de venta individuales (usado en cálculos)
const validarItemVenta = [
    body('dispositivoId')
        .isInt({ min: 1 })
        .withMessage('El ID del dispositivo debe ser un número entero positivo'),
    
    body('cantidad')
        .isInt({ min: 1, max: 1000 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 1000'),
    
    body('precioUnitario')
        .isFloat({ min: 0.01 })
        .withMessage('El precio unitario debe ser un número positivo mayor a 0'),
    
    body('descuento')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser un número positivo o cero'),
    
    manejarErroresValidacion
];

module.exports = {
    validarVenta,
    validarActualizacionEstadoVenta,
    validarPago,
    validarConsultasVentas,
    validarCancelacionVenta,
    validarEstadisticasVentas,
    validarItemVenta,
    manejarErroresValidacion
};