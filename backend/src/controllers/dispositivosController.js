const database = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// Obtener todos los dispositivos con filtros y paginación
const obtenerDispositivos = async (req, res) => {
    try {
        const {
            pagina = 1,
            limite = 20,
            categoria,
            marca,
            estado,
            condicion,
            ubicacion,
            buscar,
            ordenPor = 'FechaCreacion',
            orden = 'DESC'
        } = req.query;

        const offset = (pagina - 1) * limite;
        
        // Construir consulta con filtros
        let whereClause = 'WHERE d.DispositivoID IS NOT NULL';
        let params = [];
        let paramIndex = 0;

        if (categoria) {
            whereClause += ` AND d.CategoriaID = @param${paramIndex}`;
            params.push(parseInt(categoria));
            paramIndex++;
        }

        if (marca) {
            whereClause += ` AND d.MarcaID = @param${paramIndex}`;
            params.push(parseInt(marca));
            paramIndex++;
        }

        if (estado) {
            whereClause += ` AND d.Estado = @param${paramIndex}`;
            params.push(estado);
            paramIndex++;
        }

        if (condicion) {
            whereClause += ` AND d.Condicion = @param${paramIndex}`;
            params.push(condicion);
            paramIndex++;
        }

        if (ubicacion) {
            whereClause += ` AND d.UbicacionID = @param${paramIndex}`;
            params.push(parseInt(ubicacion));
            paramIndex++;
        }

        if (buscar) {
            whereClause += ` AND (
                d.NombreDispositivo LIKE @param${paramIndex} OR 
                d.CodigoDispositivo LIKE @param${paramIndex} OR 
                d.Modelo LIKE @param${paramIndex} OR 
                d.NumeroSerie LIKE @param${paramIndex} OR
                m.NombreMarca LIKE @param${paramIndex}
            )`;
            params.push(`%${buscar}%`);
            paramIndex++;
        }

        // Consulta principal con información completa
        const consulta = `
            SELECT d.DispositivoID, d.CodigoDispositivo, d.NombreDispositivo,
                   c.NombreCategoria, m.NombreMarca, d.Modelo, d.NumeroSerie,
                   d.Estado, d.Condicion, u.NombreUbicacion,
                   d.FechaCompra, d.VencimientoGarantia, d.PrecioCompra,
                   d.Procesador, d.MemoriaRAM, d.Almacenamiento, d.SistemaOperativo,
                   d.FechaCreacion, d.FechaActualizacion,
                   CONCAT(usr.Nombres, ' ', usr.Apellidos) as CreadoPor,
                   CASE 
                       WHEN d.VencimientoGarantia < GETDATE() THEN 'Vencida'
                       WHEN d.VencimientoGarantia < DATEADD(month, 3, GETDATE()) THEN 'Por Vencer'
                       ELSE 'Vigente'
                   END as EstadoGarantia,
                   (SELECT COUNT(*) FROM ArchivosDispositivos WHERE DispositivoID = d.DispositivoID) as TotalArchivos
            FROM Dispositivos d
            LEFT JOIN Categorias c ON d.CategoriaID = c.CategoriaID
            LEFT JOIN Marcas m ON d.MarcaID = m.MarcaID
            LEFT JOIN Ubicaciones u ON d.UbicacionID = u.UbicacionID
            LEFT JOIN Usuarios usr ON d.CreadoPor = usr.UsuarioID
            ${whereClause}
            ORDER BY d.${ordenPor} ${orden}
            OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
        `;

        // Consulta para contar total
        const consultaTotal = `
            SELECT COUNT(*) as total
            FROM Dispositivos d
            LEFT JOIN Marcas m ON d.MarcaID = m.MarcaID
            ${whereClause}
        `;

        const [resultados, total] = await Promise.all([
            database.query(consulta, params),
            database.query(consultaTotal, params)
        ]);

        const totalRegistros = total.recordset[0].total;
        const totalPaginas = Math.ceil(totalRegistros / limite);

        res.json({
            dispositivos: resultados.recordset,
            paginacion: {
                paginaActual: parseInt(pagina),
                totalPaginas,
                totalRegistros,
                registrosPorPagina: parseInt(limite),
                tieneAnterior: pagina > 1,
                tieneSiguiente: pagina < totalPaginas
            }
        });

    } catch (error) {
        console.error('Error obteniendo dispositivos:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo la lista de dispositivos'
        });
    }
};

// Obtener dispositivo por ID
const obtenerDispositivoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const consulta = `
            SELECT d.*, 
                   c.NombreCategoria, m.NombreMarca, u.NombreUbicacion,
                   p.NombreProveedor, p.Telefono as TelefonoProveedor,
                   CONCAT(usr.Nombres, ' ', usr.Apellidos) as CreadoPor,
                   CASE 
                       WHEN d.VencimientoGarantia < GETDATE() THEN 'Vencida'
                       WHEN d.VencimientoGarantia < DATEADD(month, 3, GETDATE()) THEN 'Por Vencer'
                       ELSE 'Vigente'
                   END as EstadoGarantia
            FROM Dispositivos d
            LEFT JOIN Categorias c ON d.CategoriaID = c.CategoriaID
            LEFT JOIN Marcas m ON d.MarcaID = m.MarcaID
            LEFT JOIN Ubicaciones u ON d.UbicacionID = u.UbicacionID
            LEFT JOIN Proveedores p ON d.ProveedorID = p.ProveedorID
            LEFT JOIN Usuarios usr ON d.CreadoPor = usr.UsuarioID
            WHERE d.DispositivoID = @param0
        `;

        const resultado = await database.query(consulta, [id]);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Dispositivo no encontrado',
                message: `No existe un dispositivo con ID ${id}`
            });
        }

        // Obtener archivos adjuntos
        const archivos = await database.query(`
            SELECT ArchivoID, NombreArchivo, TipoArchivo, TipoAdjunto, 
                   TamanoArchivo, FechaSubida,
                   CONCAT(u.Nombres, ' ', u.Apellidos) as SubidoPor
            FROM ArchivosDispositivos ad
            LEFT JOIN Usuarios u ON ad.SubidoPor = u.UsuarioID
            WHERE ad.DispositivoID = @param0
            ORDER BY ad.FechaSubida DESC
        `, [id]);

        // Obtener historial reciente
        const historial = await database.query(`
            SELECT TOP 10 h.Accion, h.Comentarios, h.FechaAccion,
                   CONCAT(u.Nombres, ' ', u.Apellidos) as RealizadoPor
            FROM HistorialDispositivos h
            LEFT JOIN Usuarios u ON h.RealizadoPor = u.UsuarioID
            WHERE h.DispositivoID = @param0
            ORDER BY h.FechaAccion DESC
        `, [id]);

        res.json({
            dispositivo: resultado.recordset[0],
            archivos: archivos.recordset,
            historial: historial.recordset
        });

    } catch (error) {
        console.error('Error obteniendo dispositivo:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el dispositivo'
        });
    }
};

// Crear nuevo dispositivo
const crearDispositivo = async (req, res) => {
    try {
        const {
            nombreDispositivo,
            categoriaId,
            marcaId,
            modelo,
            numeroSerie,
            numeroParte,
            procesador,
            memoriaRAM,
            almacenamiento,
            sistemaOperativo,
            versionSO,
            proveedorId,
            fechaCompra,
            precioCompra,
            vencimientoGarantia,
            numeroFactura,
            estado = 'Disponible',
            condicion = 'Bueno',
            ubicacionId,
            observaciones
        } = req.body;

        // Generar código único del dispositivo
        const codigoResult = await database.query(`
            SELECT dbo.FN_GenerarCodigoDispositivo(@param0) as codigo
        `, [categoriaId]);
        
        const codigoDispositivo = codigoResult.recordset[0].codigo;

        // Verificar que el número de serie no exista (si se proporciona)
        if (numeroSerie) {
            const existeSerie = await database.query(`
                SELECT DispositivoID FROM Dispositivos WHERE NumeroSerie = @param0
            `, [numeroSerie]);

            if (existeSerie.recordset.length > 0) {
                return res.status(400).json({
                    error: 'Número de serie duplicado',
                    message: 'Ya existe un dispositivo con ese número de serie'
                });
            }
        }

        // Insertar dispositivo
        const consulta = `
            INSERT INTO Dispositivos (
                CodigoDispositivo, NombreDispositivo, CategoriaID, MarcaID, Modelo, 
                NumeroSerie, NumeroParte, Procesador, MemoriaRAM, Almacenamiento, 
                SistemaOperativo, VersionSO, ProveedorID, FechaCompra, PrecioCompra, 
                VencimientoGarantia, NumeroFactura, Estado, Condicion, UbicacionID, 
                Observaciones, CreadoPor
            )
            OUTPUT INSERTED.DispositivoID, INSERTED.CodigoDispositivo
            VALUES (
                @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, 
                @param8, @param9, @param10, @param11, @param12, @param13, @param14, 
                @param15, @param16, @param17, @param18, @param19, @param20, @param21
            )
        `;

        const params = [
            codigoDispositivo, nombreDispositivo, categoriaId, marcaId, modelo,
            numeroSerie, numeroParte, procesador, memoriaRAM, almacenamiento,
            sistemaOperativo, versionSO, proveedorId, fechaCompra, precioCompra,
            vencimientoGarantia, numeroFactura, estado, condicion, ubicacionId,
            observaciones, req.usuario.UsuarioID
        ];

        const resultado = await database.query(consulta, params);
        const nuevoDispositivo = resultado.recordset[0];

        // Registrar en historial
        await database.query(`
            INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
            VALUES (@param0, 'Creado', @param1, 'Dispositivo creado en el sistema')
        `, [nuevoDispositivo.DispositivoID, req.usuario.UsuarioID]);

        res.status(201).json({
            mensaje: 'Dispositivo creado exitosamente',
            dispositivo: nuevoDispositivo
        });

    } catch (error) {
        console.error('Error creando dispositivo:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando el dispositivo'
        });
    }
};

// Actualizar dispositivo
const actualizarDispositivo = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;

        // Verificar que el dispositivo existe
        const existeDispositivo = await database.query(`
            SELECT DispositivoID FROM Dispositivos WHERE DispositivoID = @param0
        `, [id]);

        if (existeDispositivo.recordset.length === 0) {
            return res.status(404).json({
                error: 'Dispositivo no encontrado',
                message: `No existe un dispositivo con ID ${id}`
            });
        }

        // Verificar número de serie único (si se actualiza)
        if (datosActualizacion.numeroSerie) {
            const existeSerie = await database.query(`
                SELECT DispositivoID FROM Dispositivos 
                WHERE NumeroSerie = @param0 AND DispositivoID != @param1
            `, [datosActualizacion.numeroSerie, id]);

            if (existeSerie.recordset.length > 0) {
                return res.status(400).json({
                    error: 'Número de serie duplicado',
                    message: 'Ya existe otro dispositivo con ese número de serie'
                });
            }
        }

        // Construir consulta de actualización dinámicamente
        const camposPermitidos = [
            'nombreDispositivo', 'categoriaId', 'marcaId', 'modelo', 'numeroSerie', 'numeroParte',
            'procesador', 'memoriaRAM', 'almacenamiento', 'sistemaOperativo', 'versionSO',
            'proveedorId', 'fechaCompra', 'precioCompra', 'vencimientoGarantia', 'numeroFactura',
            'estado', 'condicion', 'ubicacionId', 'observaciones'
        ];

        const mapeoColumnas = {
            'nombreDispositivo': 'NombreDispositivo',
            'categoriaId': 'CategoriaID',
            'marcaId': 'MarcaID',
            'modelo': 'Modelo',
            'numeroSerie': 'NumeroSerie',
            'numeroParte': 'NumeroParte',
            'procesador': 'Procesador',
            'memoriaRAM': 'MemoriaRAM',
            'almacenamiento': 'Almacenamiento',
            'sistemaOperativo': 'SistemaOperativo',
            'versionSO': 'VersionSO',
            'proveedorId': 'ProveedorID',
            'fechaCompra': 'FechaCompra',
            'precioCompra': 'PrecioCompra',
            'vencimientoGarantia': 'VencimientoGarantia',
            'numeroFactura': 'NumeroFactura',
            'estado': 'Estado',
            'condicion': 'Condicion',
            'ubicacionId': 'UbicacionID',
            'observaciones': 'Observaciones'
        };

        const actualizaciones = [];
        const parametros = [];
        let paramIndex = 0;

        Object.keys(datosActualizacion).forEach(key => {
            if (camposPermitidos.includes(key) && datosActualizacion[key] !== undefined) {
                actualizaciones.push(`${mapeoColumnas[key]} = @param${paramIndex}`);
                parametros.push(datosActualizacion[key]);
                paramIndex++;
            }
        });

        if (actualizaciones.length === 0) {
            return res.status(400).json({
                error: 'Sin cambios',
                message: 'No se proporcionaron campos válidos para actualizar'
            });
        }

        // Agregar timestamp de actualización
        actualizaciones.push('FechaActualizacion = GETDATE()');

        // Ejecutar actualización
        const consulta = `
            UPDATE Dispositivos 
            SET ${actualizaciones.join(', ')}
            WHERE DispositivoID = @param${paramIndex}
        `;
        
        parametros.push(id);

        await database.query(consulta, parametros);

        // Registrar en historial
        await database.query(`
            INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
            VALUES (@param0, 'Actualizado', @param1, 'Información del dispositivo actualizada')
        `, [id, req.usuario.UsuarioID]);

        res.json({
            mensaje: 'Dispositivo actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando dispositivo:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error actualizando el dispositivo'
        });
    }
};

// Eliminar dispositivo (cambiar estado a "Dado de Baja")
const eliminarDispositivo = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el dispositivo existe
        const existeDispositivo = await database.query(`
            SELECT DispositivoID, Estado FROM Dispositivos WHERE DispositivoID = @param0
        `, [id]);

        if (existeDispositivo.recordset.length === 0) {
            return res.status(404).json({
                error: 'Dispositivo no encontrado',
                message: `No existe un dispositivo con ID ${id}`
            });
        }

        // Verificar que no esté asignado
        const estaAsignado = await database.query(`
            SELECT COUNT(*) as total FROM Asignaciones 
            WHERE DispositivoID = @param0 AND Estado = 'Activo'
        `, [id]);

        if (estaAsignado.recordset[0].total > 0) {
            return res.status(400).json({
                error: 'Dispositivo asignado',
                message: 'No se puede eliminar un dispositivo que está actualmente asignado'
            });
        }

        // Cambiar estado a "Dado de Baja" en lugar de eliminar físicamente
        await database.query(`
            UPDATE Dispositivos 
            SET Estado = 'Dado de Baja', FechaActualizacion = GETDATE()
            WHERE DispositivoID = @param0
        `, [id]);

        // Registrar en historial
        await database.query(`
            INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
            VALUES (@param0, 'Dado de Baja', @param1, 'Dispositivo dado de baja del inventario')
        `, [id, req.usuario.UsuarioID]);

        res.json({
            mensaje: 'Dispositivo dado de baja exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando dispositivo:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error eliminando el dispositivo'
        });
    }
};

// Subir archivos al dispositivo
const subirArchivos = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoAdjunto = 'Otro' } = req.body;

        // Verificar que el dispositivo existe
        const existeDispositivo = await database.query(`
            SELECT DispositivoID FROM Dispositivos WHERE DispositivoID = @param0
        `, [id]);

        if (existeDispositivo.recordset.length === 0) {
            return res.status(404).json({
                error: 'Dispositivo no encontrado'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No se enviaron archivos'
            });
        }

        const archivosSubidos = [];

        // Procesar cada archivo
        for (const file of req.files) {
            const consulta = `
                INSERT INTO ArchivosDispositivos (
                    DispositivoID, NombreArchivo, TipoArchivo, RutaArchivo, 
                    TamanoArchivo, TipoAdjunto, SubidoPor
                )
                OUTPUT INSERTED.ArchivoID, INSERTED.NombreArchivo
                VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6)
            `;

            const tipoArchivo = file.mimetype.split('/')[1];
            const rutaRelativa = `uploads/dispositivos/${file.filename}`;

            const resultado = await database.query(consulta, [
                id,
                file.originalname,
                tipoArchivo,
                rutaRelativa,
                file.size,
                tipoAdjunto,
                req.usuario.UsuarioID
            ]);

            archivosSubidos.push({
                archivoId: resultado.recordset[0].ArchivoID,
                nombreOriginal: file.originalname,
                nombreArchivo: file.filename,
                tamaño: file.size,
                tipo: tipoArchivo,
                url: `/uploads/dispositivos/${file.filename}`
            });
        }

        // Registrar en historial
        await database.query(`
            INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
            VALUES (@param0, 'Archivos Agregados', @param1, 'Se subieron ${archivosSubidos.length} archivo(s)')
        `, [id, req.usuario.UsuarioID]);

        res.json({
            mensaje: 'Archivos subidos exitosamente',
            archivos: archivosSubidos
        });

    } catch (error) {
        console.error('Error subiendo archivos:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error subiendo los archivos'
        });
    }
};

// Eliminar archivo del dispositivo
const eliminarArchivo = async (req, res) => {
    try {
        const { id, archivoId } = req.params;

        // Obtener información del archivo
        const archivo = await database.query(`
            SELECT RutaArchivo, NombreArchivo 
            FROM ArchivosDispositivos 
            WHERE ArchivoID = @param0 AND DispositivoID = @param1
        `, [archivoId, id]);

        if (archivo.recordset.length === 0) {
            return res.status(404).json({
                error: 'Archivo no encontrado'
            });
        }

        const rutaArchivo = path.join(process.cwd(), archivo.recordset[0].RutaArchivo);

        // Eliminar archivo físico
        try {
            await fs.unlink(rutaArchivo);
        } catch (error) {
            console.warn('No se pudo eliminar archivo físico:', error.message);
        }

        // Eliminar registro de la base de datos
        await database.query(`
            DELETE FROM ArchivosDispositivos 
            WHERE ArchivoID = @param0 AND DispositivoID = @param1
        `, [archivoId, id]);

        // Registrar en historial
        await database.query(`
            INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
            VALUES (@param0, 'Archivo Eliminado', @param1, 'Archivo eliminado: ${archivo.recordset[0].NombreArchivo}')
        `, [id, req.usuario.UsuarioID]);

        res.json({
            mensaje: 'Archivo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando archivo:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error eliminando el archivo'
        });
    }
};

// Obtener estadísticas del inventario
const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await database.query(`
            SELECT 
                COUNT(*) as TotalDispositivos,
                SUM(CASE WHEN Estado = 'Disponible' THEN 1 ELSE 0 END) as Disponibles,
                SUM(CASE WHEN Estado = 'Asignado' THEN 1 ELSE 0 END) as Asignados,
                SUM(CASE WHEN Estado = 'En Reparacion' THEN 1 ELSE 0 END) as EnReparacion,
                SUM(CASE WHEN Estado = 'Dado de Baja' THEN 1 ELSE 0 END) as DadosDeBaja,
                SUM(CASE WHEN Estado = 'Perdido' THEN 1 ELSE 0 END) as Perdidos,
                SUM(CASE WHEN VencimientoGarantia < GETDATE() THEN 1 ELSE 0 END) as GarantiaVencida,
                SUM(CASE WHEN VencimientoGarantia BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) THEN 1 ELSE 0 END) as GarantiaPorVencer,
                AVG(CAST(PrecioCompra as FLOAT)) as PrecioPromedio,
                SUM(CAST(PrecioCompra as FLOAT)) as ValorTotalInventario
            FROM Dispositivos
        `);

        const porCategoria = await database.query(`
            SELECT c.NombreCategoria, COUNT(d.DispositivoID) as Cantidad
            FROM Categorias c
            LEFT JOIN Dispositivos d ON c.CategoriaID = d.CategoriaID
            GROUP BY c.CategoriaID, c.NombreCategoria
            ORDER BY Cantidad DESC
        `);

        const porMarca = await database.query(`
            SELECT TOP 10 m.NombreMarca, COUNT(d.DispositivoID) as Cantidad
            FROM Marcas m
            LEFT JOIN Dispositivos d ON m.MarcaID = d.MarcaID
            GROUP BY m.MarcaID, m.NombreMarca
            ORDER BY Cantidad DESC
        `);

        const porUbicacion = await database.query(`
            SELECT u.NombreUbicacion, COUNT(d.DispositivoID) as Cantidad
            FROM Ubicaciones u
            LEFT JOIN Dispositivos d ON u.UbicacionID = d.UbicacionID
            GROUP BY u.UbicacionID, u.NombreUbicacion
            ORDER BY Cantidad DESC
        `);

        res.json({
            general: estadisticas.recordset[0],
            porCategoria: porCategoria.recordset,
            porMarca: porMarca.recordset,
            porUbicacion: porUbicacion.recordset
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo estadísticas'
        });
    }
};

module.exports = {
    obtenerDispositivos,
    obtenerDispositivoPorId,
    crearDispositivo,
    actualizarDispositivo,
    eliminarDispositivo,
    subirArchivos,
    eliminarArchivo,
    obtenerEstadisticas
};

