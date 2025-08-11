// src/controllers/ventasController.js
const database = require('../config/database');

// Obtener todas las ventas con filtros y paginación
const obtenerVentas = async (req, res) => {
    try {
        const {
            pagina = 1,
            limite = 20,
            clienteId,
            vendedorId,
            fechaInicio,
            fechaFin,
            estadoVenta,
            estadoPago,
            formaPago,
            buscar,
            ordenPor = 'FechaVenta',
            orden = 'DESC'
        } = req.query;

        const offset = (pagina - 1) * limite;
        
        let whereClause = 'WHERE v.VentaID IS NOT NULL';
        let params = [];
        let paramIndex = 0;

        if (clienteId) {
            whereClause += ` AND v.ClienteID = @param${paramIndex}`;
            params.push(parseInt(clienteId));
            paramIndex++;
        }

        if (vendedorId) {
            whereClause += ` AND v.VendedorID = @param${paramIndex}`;
            params.push(parseInt(vendedorId));
            paramIndex++;
        }

        if (fechaInicio) {
            whereClause += ` AND v.FechaVenta >= @param${paramIndex}`;
            params.push(fechaInicio);
            paramIndex++;
        }

        if (fechaFin) {
            whereClause += ` AND v.FechaVenta <= @param${paramIndex}`;
            params.push(fechaFin + ' 23:59:59');
            paramIndex++;
        }

        if (estadoVenta) {
            whereClause += ` AND v.EstadoVenta = @param${paramIndex}`;
            params.push(estadoVenta);
            paramIndex++;
        }

        if (estadoPago) {
            whereClause += ` AND v.EstadoPago = @param${paramIndex}`;
            params.push(estadoPago);
            paramIndex++;
        }

        if (formaPago) {
            whereClause += ` AND v.FormaPago = @param${paramIndex}`;
            params.push(formaPago);
            paramIndex++;
        }

        if (buscar) {
            whereClause += ` AND (
                v.NumeroFactura LIKE @param${paramIndex} OR
                CONCAT(c.Nombres, ' ', ISNULL(c.Apellidos, '')) LIKE @param${paramIndex} OR
                c.NumeroDocumento LIKE @param${paramIndex} OR
                CONCAT(u.Nombres, ' ', u.Apellidos) LIKE @param${paramIndex}
            )`;
            params.push(`%${buscar}%`);
            paramIndex++;
        }

        const consulta = `
            SELECT v.VentaID, v.NumeroFactura, v.FechaVenta, v.Subtotal, v.IVA,
                   v.Descuento, v.Total, v.FormaPago, v.EstadoPago, v.EstadoVenta,
                   CONCAT(c.Nombres, ' ', ISNULL(c.Apellidos, '')) as NombreCliente,
                   c.NumeroDocumento, c.TipoDocumento,
                   CONCAT(u.Nombres, ' ', u.Apellidos) as NombreVendedor,
                   (SELECT COUNT(*) FROM DetalleVenta WHERE VentaID = v.VentaID) as TotalArticulos,
                   (SELECT SUM(Cantidad) FROM DetalleVenta WHERE VentaID = v.VentaID) as TotalUnidades
            FROM Ventas v
            INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
            INNER JOIN Usuarios u ON v.VendedorID = u.UsuarioID
            ${whereClause}
            ORDER BY v.${ordenPor} ${orden}
            OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
        `;

        const consultaTotal = `
            SELECT COUNT(*) as total
            FROM Ventas v
            INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
            INNER JOIN Usuarios u ON v.VendedorID = u.UsuarioID
            ${whereClause}
        `;

        const [resultados, total] = await Promise.all([
            database.query(consulta, params),
            database.query(consultaTotal, params)
        ]);

        const totalRegistros = total.recordset[0].total;
        const totalPaginas = Math.ceil(totalRegistros / limite);

        res.json({
            ventas: resultados.recordset,
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
        console.error('Error obteniendo ventas:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando la venta'
        });
    }
};

// Actualizar estado de venta
const actualizarEstadoVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estadoVenta, estadoPago, observaciones } = req.body;

        // Verificar que la venta existe
        const existeVenta = await database.query(`
            SELECT VentaID, EstadoVenta FROM Ventas WHERE VentaID = @param0
        `, [id]);

        if (existeVenta.recordset.length === 0) {
            return res.status(404).json({
                error: 'Venta no encontrada',
                message: `No existe una venta con ID ${id}`
            });
        }

        const actualizaciones = [];
        const parametros = [];
        let paramIndex = 0;

        if (estadoVenta) {
            actualizaciones.push(`EstadoVenta = @param${paramIndex}`);
            parametros.push(estadoVenta);
            paramIndex++;
        }

        if (estadoPago) {
            actualizaciones.push(`EstadoPago = @param${paramIndex}`);
            parametros.push(estadoPago);
            paramIndex++;
        }

        if (observaciones !== undefined) {
            actualizaciones.push(`Observaciones = @param${paramIndex}`);
            parametros.push(observaciones);
            paramIndex++;
        }

        if (actualizaciones.length === 0) {
            return res.status(400).json({
                error: 'Sin cambios',
                message: 'No se proporcionaron campos válidos para actualizar'
            });
        }

        actualizaciones.push('FechaActualizacion = GETDATE()');

        const consulta = `
            UPDATE Ventas 
            SET ${actualizaciones.join(', ')}
            WHERE VentaID = @param${paramIndex}
        `;
        
        parametros.push(id);

        await database.query(consulta, parametros);

        res.json({
            mensaje: 'Venta actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando venta:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error actualizando la venta'
        });
    }
};

// Cancelar venta
const cancelarVenta = async (req, res) => {
    const transaction = await database.pool.request().transaction();
    
    try {
        await transaction.begin();

        const { id } = req.params;
        const { motivo = 'Cancelación solicitada' } = req.body;

        // Verificar que la venta existe y puede cancelarse
        const ventaResult = await transaction.request()
            .input('ventaId', id)
            .query(`
                SELECT VentaID, EstadoVenta, EstadoPago 
                FROM Ventas 
                WHERE VentaID = @ventaId
            `);

        if (ventaResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                error: 'Venta no encontrada'
            });
        }

        const venta = ventaResult.recordset[0];

        if (venta.EstadoVenta === 'Cancelada') {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Venta ya cancelada',
                message: 'Esta venta ya está cancelada'
            });
        }

        // Restaurar stock de los dispositivos
        await transaction.request()
            .input('ventaId', id)
            .query(`
                UPDATE Dispositivos 
                SET StockActual = StockActual + dv.Cantidad,
                    Estado = CASE 
                        WHEN Estado = 'Vendido' THEN 'En Venta'
                        ELSE Estado
                    END,
                    FechaActualizacion = GETDATE()
                FROM Dispositivos d
                INNER JOIN DetalleVenta dv ON d.DispositivoID = dv.DispositivoID
                WHERE dv.VentaID = @ventaId
            `);

        // Actualizar estado de la venta
        await transaction.request()
            .input('ventaId', id)
            .input('motivo', motivo)
            .query(`
                UPDATE Ventas 
                SET EstadoVenta = 'Cancelada',
                    EstadoPago = 'Cancelado',
                    Observaciones = ISNULL(Observaciones, '') + CHAR(13) + CHAR(10) + 'CANCELADA: ' + @motivo,
                    FechaActualizacion = GETDATE()
                WHERE VentaID = @ventaId
            `);

        // Registrar en historial de dispositivos
        await transaction.request()
            .input('ventaId', id)
            .input('usuarioId', req.usuario.UsuarioID)
            .input('motivo', motivo)
            .query(`
                INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
                SELECT dv.DispositivoID, 'Venta Cancelada', @usuarioId, 
                       'Venta cancelada: ' + v.NumeroFactura + '. Motivo: ' + @motivo
                FROM DetalleVenta dv
                INNER JOIN Ventas v ON dv.VentaID = v.VentaID
                WHERE dv.VentaID = @ventaId
            `);

        await transaction.commit();

        res.json({
            mensaje: 'Venta cancelada exitosamente'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error cancelando venta:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error cancelando la venta'
        });
    }
};

// Registrar pago de venta
const registrarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, formaPago, numeroTransaccion, observaciones } = req.body;

        // Verificar que la venta existe
        const ventaResult = await database.query(`
            SELECT VentaID, Total, EstadoPago,
                   (SELECT ISNULL(SUM(Monto), 0) FROM PagosVenta WHERE VentaID = @param0) as TotalPagado
            FROM Ventas 
            WHERE VentaID = @param0
        `, [id]);

        if (ventaResult.recordset.length === 0) {
            return res.status(404).json({
                error: 'Venta no encontrada'
            });
        }

        const venta = ventaResult.recordset[0];
        const montoPendiente = venta.Total - venta.TotalPagado;

        if (monto > montoPendiente) {
            return res.status(400).json({
                error: 'Monto excesivo',
                message: `El monto no puede ser mayor al pendiente: ${montoPendiente.toFixed(2)}`
            });
        }

        // Registrar el pago
        await database.query(`
            INSERT INTO PagosVenta (VentaID, Monto, FormaPago, NumeroTransaccion, Observaciones, RealizadoPor)
            VALUES (@param0, @param1, @param2, @param3, @param4, @param5)
        `, [id, monto, formaPago, numeroTransaccion, observaciones, req.usuario.UsuarioID]);

        // Actualizar estado de pago de la venta
        const nuevoTotalPagado = venta.TotalPagado + monto;
        let nuevoEstadoPago;

        if (nuevoTotalPagado >= venta.Total) {
            nuevoEstadoPago = 'Pagado';
        } else if (nuevoTotalPagado > 0) {
            nuevoEstadoPago = 'Parcial';
        } else {
            nuevoEstadoPago = 'Pendiente';
        }

        await database.query(`
            UPDATE Ventas 
            SET EstadoPago = @param0, FechaActualizacion = GETDATE()
            WHERE VentaID = @param1
        `, [nuevoEstadoPago, id]);

        res.json({
            mensaje: 'Pago registrado exitosamente',
            montoPagado: monto,
            totalPagado: nuevoTotalPagado,
            montoPendiente: venta.Total - nuevoTotalPagado,
            estadoPago: nuevoEstadoPago
        });

    } catch (error) {
        console.error('Error registrando pago:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error registrando el pago'
        });
    }
};

// Obtener estadísticas de ventas
const obtenerEstadisticasVentas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        let whereClause = '';
        let params = [];

        if (fechaInicio && fechaFin) {
            whereClause = 'WHERE v.FechaVenta BETWEEN @param0 AND @param1';
            params = [fechaInicio, fechaFin + ' 23:59:59'];
        }

        const estadisticasGenerales = await database.query(`
            SELECT 
                COUNT(*) as TotalVentas,
                ISNULL(SUM(v.Total), 0) as VentasTotales,
                ISNULL(AVG(v.Total), 0) as PromedioVenta,
                SUM(CASE WHEN v.EstadoVenta = 'Completada' THEN 1 ELSE 0 END) as VentasCompletadas,
                SUM(CASE WHEN v.EstadoVenta = 'Cancelada' THEN 1 ELSE 0 END) as VentasCanceladas,
                SUM(CASE WHEN v.EstadoPago = 'Pagado' THEN 1 ELSE 0 END) as VentasPagadas,
                SUM(CASE WHEN v.EstadoPago = 'Pendiente' THEN 1 ELSE 0 END) as VentasPendientes
            FROM Ventas v
            ${whereClause}
        `, params);

        const ventasPorVendedor = await database.query(`
            SELECT 
                CONCAT(u.Nombres, ' ', u.Apellidos) as Vendedor,
                COUNT(v.VentaID) as TotalVentas,
                ISNULL(SUM(v.Total), 0) as MontoVentas
            FROM Ventas v
            INNER JOIN Usuarios u ON v.VendedorID = u.UsuarioID
            ${whereClause}
            GROUP BY v.VendedorID, u.Nombres, u.Apellidos
            ORDER BY MontoVentas DESC
        `, params);

        const ventasPorFormaPago = await database.query(`
            SELECT 
                v.FormaPago,
                COUNT(*) as Cantidad,
                ISNULL(SUM(v.Total), 0) as Monto
            FROM Ventas v
            ${whereClause}
            GROUP BY v.FormaPago
            ORDER BY Monto DESC
        `, params);

        const productosMasVendidos = await database.query(`
            SELECT TOP 10
                d.NombreDispositivo,
                SUM(dv.Cantidad) as CantidadVendida,
                ISNULL(SUM(dv.Total), 0) as MontoVentas
            FROM DetalleVenta dv
            INNER JOIN Dispositivos d ON dv.DispositivoID = d.DispositivoID
            INNER JOIN Ventas v ON dv.VentaID = v.VentaID
            ${whereClause}
            GROUP BY d.DispositivoID, d.NombreDispositivo
            ORDER BY CantidadVendida DESC
        `, params);

        res.json({
            general: estadisticasGenerales.recordset[0],
            ventasPorVendedor: ventasPorVendedor.recordset,
            ventasPorFormaPago: ventasPorFormaPago.recordset,
            productosMasVendidos: productosMasVendidos.recordset
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo estadísticas de ventas'
        });
    }
};

// Obtener venta por ID con detalles completos
const obtenerVentaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const consultaVenta = `
            SELECT v.*, 
                   CONCAT(c.Nombres, ' ', ISNULL(c.Apellidos, '')) as NombreCliente,
                   c.TipoDocumento, c.NumeroDocumento, c.Email, c.Telefono,
                   c.Direccion, c.Ciudad, c.Provincia,
                   CONCAT(u.Nombres, ' ', u.Apellidos) as NombreVendedor,
                   u.Email as EmailVendedor
            FROM Ventas v
            INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
            INNER JOIN Usuarios u ON v.VendedorID = u.UsuarioID
            WHERE v.VentaID = @param0
        `;

        const resultadoVenta = await database.query(consultaVenta, [id]);

        if (resultadoVenta.recordset.length === 0) {
            return res.status(404).json({
                error: 'Venta no encontrada',
                message: `No existe una venta con ID ${id}`
            });
        }

        // Obtener detalles de la venta
        const detalles = await database.query(`
            SELECT dv.*, d.CodigoDispositivo, d.NombreDispositivo, 
                   c.NombreCategoria, m.NombreMarca, d.Modelo
            FROM DetalleVenta dv
            INNER JOIN Dispositivos d ON dv.DispositivoID = d.DispositivoID
            LEFT JOIN Categorias c ON d.CategoriaID = c.CategoriaID
            LEFT JOIN Marcas m ON d.MarcaID = m.MarcaID
            WHERE dv.VentaID = @param0
        `, [id]);

        // Obtener pagos (si los hay)
        const pagos = await database.query(`
            SELECT p.*, CONCAT(u.Nombres, ' ', u.Apellidos) as RealizadoPor
            FROM PagosVenta p
            LEFT JOIN Usuarios u ON p.RealizadoPor = u.UsuarioID
            WHERE p.VentaID = @param0
            ORDER BY p.FechaPago DESC
        `, [id]);

        res.json({
            venta: resultadoVenta.recordset[0],
            detalles: detalles.recordset,
            pagos: pagos.recordset
        });

    } catch (error) {
        console.error('Error obteniendo venta:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo la venta'
        });
    }
};

// Crear nueva venta completa
const crearVenta = async (req, res) => {
    const transaction = await database.pool.request().transaction();
    
    try {
        await transaction.begin();

        const {
            clienteId,
            items, // Array de { dispositivoId, cantidad, precioUnitario, descuento }
            formaPago = 'Efectivo',
            descuentoGlobal = 0,
            observaciones = ''
        } = req.body;

        const vendedorId = req.usuario.UsuarioID;

        // Validar que hay items
        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Sin items',
                message: 'La venta debe tener al menos un item'
            });
        }

        // Obtener configuración del POS para IVA
        const configResult = await transaction.request().query(`
            SELECT PorcentajeIVA FROM ConfiguracionPOS
        `);
        
        const porcentajeIVA = configResult.recordset.length > 0 
            ? configResult.recordset[0].PorcentajeIVA 
            : 12.00;

        // Generar número de factura
        const facturaResult = await transaction.request().query(`
            SELECT dbo.FN_GenerarNumeroFactura() as numeroFactura
        `);
        
        const numeroFactura = facturaResult.recordset[0].numeroFactura;

        // Validar stock y calcular totales
        let subtotalGeneral = 0;
        const itemsValidados = [];

        for (const item of items) {
            // Validar stock disponible
            const stockResult = await transaction.request()
                .input('dispositivoId', item.dispositivoId)
                .input('cantidad', item.cantidad)
                .execute('SP_ValidarStockVenta');

            if (stockResult.recordset[0].EsValido === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'Stock insuficiente',
                    message: stockResult.recordset[0].Mensaje
                });
            }

            // Calcular totales del item
            const subtotalItem = (item.precioUnitario * item.cantidad) - (item.descuento || 0);
            const ivaItem = subtotalItem * (porcentajeIVA / 100);
            const totalItem = subtotalItem + ivaItem;

            itemsValidados.push({
                ...item,
                subtotal: subtotalItem,
                iva: ivaItem,
                total: totalItem
            });

            subtotalGeneral += subtotalItem;
        }

        // Aplicar descuento global
        const descuentoReal = Math.min(descuentoGlobal, subtotalGeneral);
        const subtotalConDescuento = subtotalGeneral - descuentoReal;
        const ivaGeneral = subtotalConDescuento * (porcentajeIVA / 100);
        const totalGeneral = subtotalConDescuento + ivaGeneral;

        // Crear la venta principal
        const ventaResult = await transaction.request()
            .input('numeroFactura', numeroFactura)
            .input('clienteId', clienteId)
            .input('vendedorId', vendedorId)
            .input('subtotal', subtotalConDescuento)
            .input('iva', ivaGeneral)
            .input('descuento', descuentoReal)
            .input('total', totalGeneral)
            .input('formaPago', formaPago)
            .input('observaciones', observaciones)
            .query(`
                INSERT INTO Ventas (NumeroFactura, ClienteID, VendedorID, Subtotal, IVA, 
                                  Descuento, Total, FormaPago, Observaciones)
                OUTPUT INSERTED.VentaID
                VALUES (@numeroFactura, @clienteId, @vendedorId, @subtotal, @iva,
                        @descuento, @total, @formaPago, @observaciones)
            `);

        const ventaId = ventaResult.recordset[0].VentaID;

        // Insertar detalles de venta
        for (const item of itemsValidados) {
            await transaction.request()
                .input('ventaId', ventaId)
                .input('dispositivoId', item.dispositivoId)
                .input('cantidad', item.cantidad)
                .input('precioUnitario', item.precioUnitario)
                .input('descuento', item.descuento || 0)
                .input('subtotal', item.subtotal)
                .input('iva', item.iva)
                .input('total', item.total)
                .query(`
                    INSERT INTO DetalleVenta (VentaID, DispositivoID, Cantidad, PrecioUnitario,
                                            Descuento, Subtotal, IVA, Total)
                    VALUES (@ventaId, @dispositivoId, @cantidad, @precioUnitario,
                            @descuento, @subtotal, @iva, @total)
                `);
        }

        await transaction.commit();

        res.status(201).json({
            mensaje: 'Venta creada exitosamente',
            venta: {
                ventaId,
                numeroFactura,
                total: totalGeneral
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creando venta:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando la venta'
        });
    }
}
// Exportar las funciones del controlador
module.exports = {
    obtenerVentas,
    obtenerVentaPorId,
    crearVenta,
    actualizarEstadoVenta,
    cancelarVenta,
    registrarPago,
    obtenerEstadisticasVentas
};