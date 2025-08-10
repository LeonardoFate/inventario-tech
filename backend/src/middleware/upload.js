// src/middleware/upload.js - Configuración de subida de archivos
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const crearDirectorio = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'dispositivos');
        crearDirectorio(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp_dispositivoId_originalname
        const timestamp = Date.now();
        const dispositivoId = req.params.id || 'nuevo';
        const extension = path.extname(file.originalname);
        const nombreSinExtension = path.basename(file.originalname, extension);
        const nombreLimpio = nombreSinExtension.replace(/[^a-zA-Z0-9]/g, '_');
        
        const nombreFinal = `${timestamp}_${dispositivoId}_${nombreLimpio}${extension}`;
        cb(null, nombreFinal);
    }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt'
    };

    if (tiposPermitidos[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${Object.values(tiposPermitidos).join(', ')}`), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
        files: 5 // Máximo 5 archivos por request
    }
});

// Middleware para manejo de errores de multer
const manejarErroresUpload = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Archivo demasiado grande',
                message: `El archivo excede el tamaño máximo permitido de ${(parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024}MB`
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados archivos',
                message: 'Máximo 5 archivos por solicitud'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de archivo inesperado',
                message: 'Campo de archivo no válido'
            });
        }
    }
    
    if (error && error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            error: 'Tipo de archivo no válido',
            message: error.message
        });
    }

    next(error);
};

module.exports = {
    upload,
    manejarErroresUpload
};