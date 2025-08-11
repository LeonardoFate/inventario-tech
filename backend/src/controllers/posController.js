// src/controllers/posController.js
const database = require('../config/database');

// Obtener configuración del POS
const obtenerConfiguracionPOS = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT * FROM ConfiguracionPOS
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                error: 'Configuración no encontrada',
                message: 'No se ha configurado el sistema POS'
            });
        }

        res.json({
            configuracion: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error obteniendo configuración POS:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo la configuración del POS'
        });
    }
};

// Actualizar configuración del POS
const actualizarConfiguracionPOS = async (req, res) => {
    try {
        const {
            nombreEmpresa,
            rucEmpresa,
            direccionEmpresa,
            telefonoEmpresa,
            emailEmpresa,
            porcentajeIVA,
            monedaDefecto,
            prefijoFactura,
            mensajePieFactura,
            terminosCondiciones,
            imprimirAutomatico,
            requiereClienteObligatorio,
            permiteVentaCredito,
            diasVencimientoCredito
        } = req.body;

        // Verificar si existe configuración
        const existeConfig = await database.query(`
            SELECT ConfigID FROM ConfiguracionPOS
        `);

        if (existeConfig.recordset.length === 0) {
            // Crear nueva configuración
            await database.query(`
                INSERT INTO ConfiguracionPOS (
                    NombreEmpresa, RUCEmpresa, DireccionEmpresa, TelefonoEmpresa, EmailEmpresa,
                    PorcentajeIVA, MonedaDefecto, PrefijoFactura, MensajePieFactura, TerminosCondiciones,
                    ImprimirAutomatico, RequiereClienteObligatorio, PermiteVentaCredito, DiasVencimientoCredito,
                    ActualizadoPor
                )
                VALUES (
                    @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9,
                    @param10, @param11, @param12, @param13, @param14
                )
            `, [
                nombreEmpresa, rucEmpresa, direccionEmpresa, telefonoEmpresa, emailEmpresa,
                porcentajeIVA, monedaDefecto, prefijoFactura, mensajePieFactura, terminosCondiciones,
                imprimirAutomatico, requiereClienteObligatorio, permiteVentaCredito, diasVencimientoCredito,
                req.usuario.UsuarioID
            ]);

            res.status(201).json({
                mensaje: 'Configuración POS creada exitosamente'
            });
        } else {
            // Actualizar configuración existente
            const camposPermitidos = [
                'nombreEmpresa', 'rucEmpresa', 'direccionEmpresa', 'telefonoEmpresa', 'emailEmpresa',
                'porcentajeIVA', 'monedaDefecto', 'prefijoFactura', 'mensajePieFactura', 'terminosCondiciones',
                'imprimirAutomatico', 'requiereClienteObligatorio', 'permiteVentaCredito', 'diasVencimientoCredito'
            ];

            const mapeoColumnas = {
                'nombreEmpresa': 'NombreEmpresa',
                'rucEmpresa': 'RUCEmpresa',
                'direccionEmpresa': 'DireccionEmpresa',
                'telefonoEmpresa': 'TelefonoEmpresa',
                'emailEmpresa': 'EmailEmpresa',
                'porcentajeIVA': 'PorcentajeIVA',
                'monedaDefecto': 'MonedaDefecto',
                'prefijoFactura': 'PrefijoFactura',
                'mensajePieFactura': 'MensajePieFactura',
                'terminosCondiciones': 'TerminosCondiciones',
                'imprimirAutomatico': 'ImprimirAutomatico',
                'requiereClienteObligatorio': 'RequiereClienteObligatorio',
                'permiteVentaCredito': 'PermiteVentaCredito',
                'diasVencimientoCredito': 'DiasVencimientoCredito'
            };

            const actualizaciones = [];
            const parametros = [];
            let paramIndex = 0;

            Object.keys(req.body).forEach(key => {
                if (camposPermitidos.includes(key) && req.body[key] !== undefined) {
                    actualizaciones.push(`${mapeoColumnas[key]} = @param${paramIndex}`);
                    parametros.push(req.body[key]);
                    paramIndex++;
                }
            });

            if (actualizaciones.length > 0) {
                actualizaciones.push('FechaActualizacion = GETDATE()');
                actualizaciones.push(`ActualizadoPor = @param${paramIndex}`);
                parametros.push(req.usuario.UsuarioID);

                const consulta = `
                    UPDATE ConfiguracionPOS 
                    SET ${actualizaciones.join(', ')}
                `;

                await database.query(consulta, parametros);
            }

            res.json({
                mensaje: 'Configuración POS actualizada exitosamente'
            });
        }

    } catch (error) {
        console.error('Error actualizando configuración POS:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error actualizando la configuración del POS'
        });
    }
};

// Obtener dispositivos disponibles para venta
const obtenerDispositivosParaVenta = async (req, res) => {
    try {
        const {
            categoria,
            marca,
            buscar,
            limite = 50
        } = req.query;

        let whereClause = '';
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

        if (buscar) {
            whereClause += ` AND (
                d.NombreDispositivo LIKE @param${paramIndex} OR 
                d.CodigoDispositivo LIKE @param${paramIndex} OR 
                m.NombreMarca LIKE @param${paramIndex} OR
                d.Modelo LIKE @param${paramIndex}
            )`;
            params.push(`%${buscar}%`);
            paramIndex++;
        }

        const consulta = `
            SELECT TOP ${limite}
                d.DispositivoID, d.CodigoDispositivo, d.NombreDispositivo,
                c.NombreCategoria, m.NombreMarca, d.Modelo, d.NumeroSerie,
                d.Estado, d.Condicion, d.StockActual, d.StockMinimo,
                d.PrecioCompra, d.PrecioVenta,
                ISNULL(p.Precio, d.PrecioVenta) as PrecioVentaActual,
                p.PorcentajeGanancia,
                CASE 
                    WHEN d.StockActual <= 0 THEN 'Sin Stock'
                    WHEN d.StockActual <= d.StockMinimo THEN 'Stock Bajo'
                    ELSE 'Stock OK'
                END as EstadoStock,
                CASE 
                    WHEN d.VencimientoGarantia IS NOT NULL AND d.VencimientoGarantia > GETDATE() THEN 'Con Garantía'
                    ELSE 'Sin Garantía'
                END as EstadoGarantia
            FROM Dispositivos d
            INNER JOIN Categorias c ON d.CategoriaID = c.CategoriaID
            INNER JOIN Marcas m ON d.MarcaID = m.MarcaID
            LEFT JOIN PreciosDispositivos p ON d.DispositivoID = p.DispositivoID 
                AND p.TipoPrecio = 'Venta' 
                AND p.Activo = 1
                AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta >= GETDATE())
            WHERE d.PermiteVenta = 1 
                AND d.Estado IN ('Disponible', 'En Venta')
                AND d.StockActual > 0
                ${whereClause}
            ORDER BY d.NombreDispositivo
        `;

        const resultado = await database.query(consulta, params);

        res.json({
            dispositivos: resultado.recordset
        });

    } catch (error) {
        console.error('Error obteniendo dispositivos para venta:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo dispositivos disponibles para venta'
        });
    }
};

// Validar stock antes de venta
const validarStock = async (req, res) => {
    try {
        const { dispositivoId, cantidad } = req.body;

        const resultado = await database.execute('SP_ValidarStockVenta', {
            DispositivoID: dispositivoId,
            CantidadSolicitada: cantidad
        });

        const validacion = resultado.recordset[0];

        if (validacion.EsValido === 1) {
            res.json({
                valido: true,
                mensaje: validacion.Mensaje,
                stockDisponible: validacion.StockDisponible
            });
        } else {
            res.status(400).json({
                valido: false,
                mensaje: validacion.Mensaje
            });
        }

    } catch (error) {
        console.error('Error validando stock:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error validando el stock'
        });
    }
};

// Calcular totales de venta
const calcularTotales = async (req, res) => {
    try {
        const { items, descuentoGlobal = 0 } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                error: 'Sin items',
                message: 'Se requieren items para calcular totales'
            });
        }

        // Obtener porcentaje de IVA
        const configResult = await database.query(`
            SELECT PorcentajeIVA FROM ConfiguracionPOS
        `);
        
        const porcentajeIVA = configResult.recordset.length > 0 
            ? configResult.recordset[0].PorcentajeIVA 
            : 12.00;

        let subtotal = 0;
        const itemsCalculados = [];

        // Calcular totales por item
        for (const item of items) {
            const subtotalItem = (item.precioUnitario * item.cantidad) - (item.descuento || 0);
            const ivaItem = subtotalItem * (porcentajeIVA / 100);
            const totalItem = subtotalItem + ivaItem;

            itemsCalculados.push({
                ...item,
                subtotal: parseFloat(subtotalItem.toFixed(2)),
                iva: parseFloat(ivaItem.toFixed(2)),
                total: parseFloat(totalItem.toFixed(2))
            });

            subtotal += subtotalItem;
        }

        // Aplicar descuento global
        const descuentoReal = Math.min(descuentoGlobal, subtotal);
        const subtotalConDescuento = subtotal - descuentoReal;
        const ivaTotal = subtotalConDescuento * (porcentajeIVA / 100);
        const total = subtotalConDescuento + ivaTotal;

        res.json({
            items: itemsCalculados,
            resumen: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                descuento: parseFloat(descuentoReal.toFixed(2)),
                subtotalConDescuento: parseFloat(subtotalConDescuento.toFixed(2)),
                iva: parseFloat(ivaTotal.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                porcentajeIVA
            }
        });

    } catch (error) {
        console.error('Error calculando totales:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error calculando los totales'
        });
    }
};

// Obtener próximo número de factura
const obtenerProximoNumeroFactura = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT dbo.FN_GenerarNumeroFactura() as numeroFactura
        `);

        res.json({
            numeroFactura: resultado.recordset[0].numeroFactura
        });

    } catch (error) {
        console.error('Error obteniendo número de factura:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el número de factura'
        });
    }
};

// Buscar cliente rápido para POS
const buscarClienteRapido = async (req, res) => {
    try {
        const { buscar } = req.query;

        if (!buscar || buscar.length < 2) {
            return res.status(400).json({
                error: 'Búsqueda muy corta',
                message: 'Ingrese al menos 2 caracteres para buscar'
            });
        }

        const resultado = await database.query(`
            SELECT TOP 10 
                ClienteID, TipoDocumento, NumeroDocumento, Nombres, Apellidos,
                RazonSocial, Email, Telefono,
                CASE 
                    WHEN RazonSocial IS NOT NULL AND RazonSocial != '' THEN RazonSocial
                    ELSE CONCAT(Nombres, ' ', ISNULL(Apellidos, ''))
                END as NombreCompleto
            FROM Clientes 
            WHERE Activo = 1 
            AND (
                NumeroDocumento LIKE @param0 OR
                Nombres LIKE @param0 OR
                Apellidos LIKE @param0 OR
                RazonSocial LIKE @param0 OR
                Email LIKE @param0
            )
            ORDER BY FechaCreacion DESC
        `, [`%${buscar}%`]);

        res.json({
            clientes: resultado.recordset
        });

    } catch (error) {
        console.error('Error buscando cliente:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error buscando cliente'
        });
    }
};

// Obtener resumen de caja del día
const obtenerResumenCaja = async (req, res) => {
    try {
        const { fecha = new Date().toISOString().split('T')[0] } = req.query;

        const resumen = await database.query(`
            SELECT 
                COUNT(*) as TotalVentas,
                ISNULL(SUM(CASE WHEN EstadoVenta = 'Completada' THEN Total ELSE 0 END), 0) as VentasCompletadas,
                ISNULL(SUM(CASE WHEN EstadoVenta = 'Cancelada' THEN Total ELSE 0 END), 0) as VentasCanceladas,
                ISNULL(SUM(CASE WHEN FormaPago = 'Efectivo' AND EstadoVenta = 'Completada' THEN Total ELSE 0 END), 0) as VentasEfectivo,
                ISNULL(SUM(CASE WHEN FormaPago = 'Tarjeta' AND EstadoVenta = 'Completada' THEN Total ELSE 0 END), 0) as VentasTarjeta,
                ISNULL(SUM(CASE WHEN FormaPago = 'Transferencia' AND EstadoVenta = 'Completada' THEN Total ELSE 0 END), 0) as VentasTransferencia,
                COUNT(DISTINCT ClienteID) as ClientesAtendidos
            FROM Ventas 
            WHERE CAST(FechaVenta AS DATE) = @param0
        `, [fecha]);

        const ventasDelDia = await database.query(`
            SELECT TOP 10
                v.NumeroFactura, v.FechaVenta, v.Total, v.FormaPago, v.EstadoVenta,
                CASE 
                    WHEN c.RazonSocial IS NOT NULL AND c.RazonSocial != '' THEN c.RazonSocial
                    ELSE CONCAT(c.Nombres, ' ', ISNULL(c.Apellidos, ''))
                END as NombreCliente
            FROM Ventas v
            INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
            WHERE CAST(v.FechaVenta AS DATE) = @param0
            ORDER BY v.FechaVenta DESC
        `, [fecha]);

        res.json({
            resumen: resumen.recordset[0],
            ventasDelDia: ventasDelDia.recordset
        });

    } catch (error) {
        console.error('Error obteniendo resumen de caja:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo el resumen de caja'
        });
    }
};

module.exports = {
    obtenerConfiguracionPOS,
    actualizarConfiguracionPOS,
    obtenerDispositivosParaVenta,
    validarStock,
    calcularTotales,
    obtenerProximoNumeroFactura,
    buscarClienteRapido,
    obtenerResumenCaja
};