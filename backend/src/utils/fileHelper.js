const fs = require('fs').promises;
const path = require('path');

// Limpiar archivos huérfanos (sin registro en BD)
const limpiarArchivosHuerfanos = async () => {
    try {
        const directorioUploads = path.join(process.cwd(), 'uploads', 'dispositivos');
        
        // Verificar si el directorio existe
        try {
            await fs.access(directorioUploads);
        } catch {
            console.log('Directorio de uploads no existe, creándolo...');
            await fs.mkdir(directorioUploads, { recursive: true });
            return;
        }

        const archivosEnDisco = await fs.readdir(directorioUploads);
        
        if (archivosEnDisco.length === 0) {
            return;
        }

        const database = require('../config/database');
        
        // Obtener archivos registrados en BD
        const archivosEnBD = await database.query(`
            SELECT SUBSTRING(RutaArchivo, CHARINDEX('/', RutaArchivo, CHARINDEX('/', RutaArchivo) + 1) + 1, LEN(RutaArchivo)) as NombreArchivo
            FROM ArchivosDispositivos
            WHERE RutaArchivo LIKE 'uploads/dispositivos/%'
        `);

        const nombresEnBD = new Set(archivosEnBD.recordset.map(r => r.NombreArchivo));
        
        // Encontrar archivos huérfanos
        const archivosHuerfanos = archivosEnDisco.filter(archivo => !nombresEnBD.has(archivo));
        
        // Eliminar archivos huérfanos (más de 24 horas de antigüedad)
        for (const archivo of archivosHuerfanos) {
            const rutaCompleta = path.join(directorioUploads, archivo);
            const stats = await fs.stat(rutaCompleta);
            const tiempoCreacion = new Date(stats.birthtime);
            const ahora = new Date();
            const diferencia = ahora - tiempoCreacion;
            
            // Si el archivo tiene más de 24 horas, eliminarlo
            if (diferencia > 24 * 60 * 60 * 1000) {
                await fs.unlink(rutaCompleta);
                console.log(`Archivo huérfano eliminado: ${archivo}`);
            }
        }
        
    } catch (error) {
        console.error('Error limpiando archivos huérfanos:', error);
    }
};

// Obtener información de archivo
const obtenerInfoArchivo = async (rutaArchivo) => {
    try {
        const stats = await fs.stat(rutaArchivo);
        return {
            existe: true,
            tamaño: stats.size,
            fechaCreacion: stats.birthtime,
            fechaModificacion: stats.mtime
        };
    } catch (error) {
        return {
            existe: false,
            error: error.message
        };
    }
};

// Validar tipo de archivo
const validarTipoArchivo = (mimetype) => {
    const tiposPermitidos = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    
    return tiposPermitidos.includes(mimetype);
};

// Generar nombre de archivo seguro
const generarNombreSeguro = (nombreOriginal) => {
    const extension = path.extname(nombreOriginal);
    const nombreSinExtension = path.basename(nombreOriginal, extension);
    const nombreLimpio = nombreSinExtension.replace(/[^a-zA-Z0-9áéíóúñü]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${random}_${nombreLimpio}${extension}`;
};

module.exports = {
    limpiarArchivosHuerfanos,
    obtenerInfoArchivo,
    validarTipoArchivo,
    generarNombreSeguro
};