// src/controllers/clientesController.js
const database = require('../config/database');

// Obtener todos los clientes con filtros y paginación
const obtenerClientes = async (req, res) => {
    try {
        const {
            pagina = 1,
            limite = 20,
            tipoDocumento,
            buscar,
            ordenPor = 'FechaCreacion',
            orden = 'DESC'
        } = req.query;

        const offset = (pagina - 1) * limite;
        
        let whereClause = 'WHERE c.Activo = 1';
        let params = [];
        let paramIndex = 0;

        if (tipoDocumento) {
            whereClause += ` AND c.TipoDocumento = @param${paramIndex}`;
            params.push(tipoDocumento);
            paramIndex++;
        }

        if (buscar) {
            whereClause += ` AND (
                c.Nombres LIKE @param${paramIndex} OR 
                c.Apellidos LIKE @param${paramIndex} OR 
                c.RazonSocial LIKE @param${paramIndex} OR 
                c.NumeroDocumento LIKE @param${paramIndex} OR
                c.Email LIKE @param${paramIndex}
            )`;
            params.push(`%${buscar}%`);
            paramIndex++;
        }

        const consulta = `
            SELECT c.ClienteID, c.TipoDocumento, c.NumeroDocumento, c.Nombres, c.Apellidos,
                   c.RazonSocial, c.Email, c.Telefono, c.Ciudad, c.Provincia,
                   c.FechaCreacion, c.FechaActualizacion,
                   CONCAT(u.Nombres, ' ', u.Apellidos) as CreadoPor,
                   (SELECT COUNT(*) FROM Ventas WHERE ClienteID = c.ClienteID) as TotalVentas,
                   (SELECT ISNULL(SUM(Total), 0) FROM Ventas WHERE ClienteID = c.ClienteID AND EstadoVenta = 'Completada') as MontoTotalCompras
            FROM Clientes c
            LEFT JOIN Usuarios u ON c.CreadoPor = u.UsuarioID
            ${whereClause}
            ORDER BY c.${ordenPor} ${orden}
            OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
        `;

        const consultaTotal = `
            SELECT COUNT(*) as total
            FROM Clientes c
            ${whereClause}
        `;

        const [resultados, total] = await Promise.all([
            database.query(consulta, params),
            database.query(consultaTotal, params)
        ]);

        const totalRegistros = total.recordset[0].total;
        const totalPaginas = Math.ceil(totalRegistros / limite);

        res.json({
            clientes: resultados.recordset,
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
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo la lista de clientes'
        });
    }
};

// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const consulta = `
            SELECT c.*, 
                   CONCAT(u.Nombres, ' ', u.Apellidos) as CreadoPor,
                   (SELECT COUNT(*) FROM Ventas WHERE ClienteID = c.ClienteID) as TotalVentas,
                   (SELECT ISNULL(SUM(Total), 0) FROM Ventas WHERE ClienteID = c.ClienteID AND EstadoVenta = 'Completada') as MontoTotalCompras,
                   (SELECT TOP 1 FechaVenta FROM Ventas WHERE ClienteID = c.ClienteID ORDER BY FechaVenta DESC) as UltimaCompra
            FROM Clientes c
            LEFT JOIN Usuarios u ON c.CreadoPor = u.UsuarioID
            WHERE c.ClienteID = @param0 AND c.Activo = 1
        `;

        const resultado = await database.query(consulta, [id]);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                message: `No existe un cliente con ID ${id}`
            });
        }

        // Obtener historial de compras reciente
        const historialCompras = await database.query(`
            SELECT TOP 10 v.VentaID, v.NumeroFactura, v.FechaVenta, v.Total, v.EstadoVenta,
                   (SELECT COUNT(*) FROM DetalleVenta WHERE VentaID = v.VentaID) as TotalArticulos
            FROM Ventas v
            WHERE v.ClienteID = @param0
            ORDER BY v.FechaVenta DESC
        `, [id]);

        res.json({
            cliente: resultado.recordset[0],
            historialCompras: historialCompras.recordset
        });

    } catch (error) {
        console.error('Error obteniendo cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el cliente'
        });
    }
};

// Crear nuevo cliente
const crearCliente = async (req, res) => {
    try {
        const {
            tipoDocumento = 'Cedula',
            numeroDocumento,
            nombres,
            apellidos,
            razonSocial,
            email,
            telefono,
            direccion,
            ciudad,
            provincia,
            fechaNacimiento,
            genero
        } = req.body;

        // Verificar que el documento no exista
        const existeDocumento = await database.query(`
            SELECT ClienteID FROM Clientes 
            WHERE TipoDocumento = @param0 AND NumeroDocumento = @param1 AND Activo = 1
        `, [tipoDocumento, numeroDocumento]);

        if (existeDocumento.recordset.length > 0) {
            return res.status(400).json({
                error: 'Documento duplicado',
                message: 'Ya existe un cliente con ese tipo y número de documento'
            });
        }

        // Validar email único (si se proporciona)
        if (email) {
            const existeEmail = await database.query(`
                SELECT ClienteID FROM Clientes WHERE Email = @param0 AND Activo = 1
            `, [email]);

            if (existeEmail.recordset.length > 0) {
                return res.status(400).json({
                    error: 'Email duplicado',
                    message: 'Ya existe un cliente con ese email'
                });
            }
        }

        const consulta = `
            INSERT INTO Clientes (
                TipoDocumento, NumeroDocumento, Nombres, Apellidos, RazonSocial,
                Email, Telefono, Direccion, Ciudad, Provincia, FechaNacimiento,
                Genero, CreadoPor
            )
            OUTPUT INSERTED.ClienteID, INSERTED.TipoDocumento, INSERTED.NumeroDocumento,
                   INSERTED.Nombres, INSERTED.Apellidos
            VALUES (
                @param0, @param1, @param2, @param3, @param4, @param5, @param6,
                @param7, @param8, @param9, @param10, @param11, @param12
            )
        `;

        const params = [
            tipoDocumento, numeroDocumento, nombres, apellidos, razonSocial,
            email, telefono, direccion, ciudad, provincia, fechaNacimiento,
            genero, req.usuario.UsuarioID
        ];

        const resultado = await database.query(consulta, params);

        res.status(201).json({
            mensaje: 'Cliente creado exitosamente',
            cliente: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error creando cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando el cliente'
        });
    }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;

        // Verificar que el cliente existe
        const existeCliente = await database.query(`
            SELECT ClienteID FROM Clientes WHERE ClienteID = @param0 AND Activo = 1
        `, [id]);

        if (existeCliente.recordset.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                message: `No existe un cliente con ID ${id}`
            });
        }

        // Verificar documento único (si se actualiza)
        if (datosActualizacion.numeroDocumento && datosActualizacion.tipoDocumento) {
            const existeDocumento = await database.query(`
                SELECT ClienteID FROM Clientes 
                WHERE TipoDocumento = @param0 AND NumeroDocumento = @param1 
                AND ClienteID != @param2 AND Activo = 1
            `, [datosActualizacion.tipoDocumento, datosActualizacion.numeroDocumento, id]);

            if (existeDocumento.recordset.length > 0) {
                return res.status(400).json({
                    error: 'Documento duplicado',
                    message: 'Ya existe otro cliente con ese tipo y número de documento'
                });
            }
        }

        // Verificar email único (si se actualiza)
        if (datosActualizacion.email) {
            const existeEmail = await database.query(`
                SELECT ClienteID FROM Clientes 
                WHERE Email = @param0 AND ClienteID != @param1 AND Activo = 1
            `, [datosActualizacion.email, id]);

            if (existeEmail.recordset.length > 0) {
                return res.status(400).json({
                    error: 'Email duplicado',
                    message: 'Ya existe otro cliente con ese email'
                });
            }
        }

        const camposPermitidos = [
            'tipoDocumento', 'numeroDocumento', 'nombres', 'apellidos', 'razonSocial',
            'email', 'telefono', 'direccion', 'ciudad', 'provincia', 
            'fechaNacimiento', 'genero'
        ];

        const mapeoColumnas = {
            'tipoDocumento': 'TipoDocumento',
            'numeroDocumento': 'NumeroDocumento',
            'nombres': 'Nombres',
            'apellidos': 'Apellidos',
            'razonSocial': 'RazonSocial',
            'email': 'Email',
            'telefono': 'Telefono',
            'direccion': 'Direccion',
            'ciudad': 'Ciudad',
            'provincia': 'Provincia',
            'fechaNacimiento': 'FechaNacimiento',
            'genero': 'Genero'
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

        actualizaciones.push('FechaActualizacion = GETDATE()');

        const consulta = `
            UPDATE Clientes 
            SET ${actualizaciones.join(', ')}
            WHERE ClienteID = @param${paramIndex}
        `;
        
        parametros.push(id);

        await database.query(consulta, parametros);

        res.json({
            mensaje: 'Cliente actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error actualizando el cliente'
        });
    }
};

// Desactivar cliente (no eliminar físicamente)
const desactivarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que no tenga ventas pendientes
        const ventasPendientes = await database.query(`
            SELECT COUNT(*) as total FROM Ventas 
            WHERE ClienteID = @param0 AND EstadoPago = 'Pendiente'
        `, [id]);

        if (ventasPendientes.recordset[0].total > 0) {
            return res.status(400).json({
                error: 'Cliente con ventas pendientes',
                message: 'No se puede desactivar un cliente con ventas pendientes de pago'
            });
        }

        await database.query(`
            UPDATE Clientes 
            SET Activo = 0, FechaActualizacion = GETDATE()
            WHERE ClienteID = @param0
        `, [id]);

        res.json({
            mensaje: 'Cliente desactivado exitosamente'
        });

    } catch (error) {
        console.error('Error desactivando cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error desactivando el cliente'
        });
    }
};

// Buscar cliente por documento
const buscarPorDocumento = async (req, res) => {
    try {
        const { tipoDocumento, numeroDocumento } = req.params;

        const consulta = `
            SELECT c.ClienteID, c.TipoDocumento, c.NumeroDocumento, c.Nombres, c.Apellidos,
                   c.RazonSocial, c.Email, c.Telefono, c.Ciudad, c.Provincia,
                   (SELECT COUNT(*) FROM Ventas WHERE ClienteID = c.ClienteID) as TotalVentas
            FROM Clientes c
            WHERE c.TipoDocumento = @param0 AND c.NumeroDocumento = @param1 AND c.Activo = 1
        `;

        const resultado = await database.query(consulta, [tipoDocumento, numeroDocumento]);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                message: 'No existe un cliente con ese documento'
            });
        }

        res.json({
            cliente: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error buscando cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error buscando el cliente'
        });
    }
};

// Obtener cliente genérico (consumidor final)
const obtenerClienteGenerico = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT ClienteID, TipoDocumento, NumeroDocumento, Nombres, Apellidos
            FROM Clientes 
            WHERE TipoDocumento = 'Cedula' AND NumeroDocumento = '9999999999' AND Activo = 1
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Cliente genérico no encontrado',
                message: 'El cliente genérico no está configurado en el sistema'
            });
        }

        res.json({
            cliente: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error obteniendo cliente genérico:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el cliente genérico'
        });
    }
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    desactivarCliente,
    buscarPorDocumento,
    obtenerClienteGenerico
};