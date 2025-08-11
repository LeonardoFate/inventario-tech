// src/utils/initPOS.js - Inicializador del Sistema POS
const database = require('../config/database');

class InitializadorPOS {
    constructor() {
        this.configurado = false;
    }

    async inicializar() {
        try {
            console.log('🚀 Inicializando sistema POS...');
            
            // 1. Verificar y agregar columnas POS a Dispositivos
            await this.verificarColumnasDispositivos();
            
            // 2. Crear cliente genérico si no existe
            await this.crearClienteGenerico();
            
            // 3. Crear configuración inicial del POS
            await this.crearConfiguracionPOS();
            
            // 4. Actualizar dispositivos existentes para ventas
            await this.actualizarDispositivosParaVentas();
            
            // 5. Crear precios iniciales
            await this.crearPreciosIniciales();
            
            // 6. Verificar triggers y funciones
            await this.verificarTriggers();
            
            this.configurado = true;
            console.log('✅ Sistema POS inicializado correctamente');
            
            return { success: true, message: 'Sistema POS configurado exitosamente' };
            
        } catch (error) {
            console.error('❌ Error inicializando sistema POS:', error);
            return { success: false, error: error.message };
        }
    }

    async verificarColumnasDispositivos() {
        try {
            console.log('🔍 Verificando columnas POS en tabla Dispositivos...');
            
            // Verificar si las columnas ya existen
            const columnasExistentes = await database.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Dispositivos' 
                AND COLUMN_NAME IN ('PrecioVenta', 'StockMinimo', 'StockActual', 'PermiteVenta', 'CategoriaVenta')
            `);

            const columnas = columnasExistentes.recordset.map(row => row.COLUMN_NAME);
            const columnasRequeridas = ['PrecioVenta', 'StockMinimo', 'StockActual', 'PermiteVenta', 'CategoriaVenta'];
            const columnasFaltantes = columnasRequeridas.filter(col => !columnas.includes(col));

            if (columnasFaltantes.length > 0) {
                console.log(`➕ Agregando columnas faltantes: ${columnasFaltantes.join(', ')}`);
                
                // Agregar columnas faltantes
                for (const columna of columnasFaltantes) {
                    await this.agregarColumnaDispositivo(columna);
                }

                // Actualizar restricción de estados
                await this.actualizarRestriccionEstados();
            } else {
                console.log('✅ Todas las columnas POS ya existen');
            }

        } catch (error) {
            console.error('Error verificando columnas:', error);
            throw error;
        }
    }

    async agregarColumnaDispositivo(nombreColumna) {
        const definicionesColumnas = {
            'PrecioVenta': 'ALTER TABLE Dispositivos ADD PrecioVenta DECIMAL(15,2) NULL',
            'StockMinimo': 'ALTER TABLE Dispositivos ADD StockMinimo INT DEFAULT 1',
            'StockActual': 'ALTER TABLE Dispositivos ADD StockActual INT DEFAULT 1',
            'PermiteVenta': 'ALTER TABLE Dispositivos ADD PermiteVenta BIT DEFAULT 1',
            'CategoriaVenta': 'ALTER TABLE Dispositivos ADD CategoriaVenta NVARCHAR(20) DEFAULT \'Producto\''
        };

        if (definicionesColumnas[nombreColumna]) {
            await database.query(definicionesColumnas[nombreColumna]);
            console.log(`✅ Columna ${nombreColumna} agregada exitosamente`);
        }
    }

    async actualizarRestriccionEstados() {
        try {
            // Eliminar restricción existente si existe
            await database.query(`
                IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Dispositivos_Estado')
                BEGIN
                    ALTER TABLE Dispositivos DROP CONSTRAINT CK_Dispositivos_Estado;
                END
            `);

            // Crear nueva restricción con estados POS
            await database.query(`
                ALTER TABLE Dispositivos 
                ADD CONSTRAINT CK_Dispositivos_Estado 
                CHECK (Estado IN ('Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido', 'Vendido', 'Reservado', 'En Venta'))
            `);

            console.log('✅ Restricción de estados actualizada');
        } catch (error) {
            console.warn('⚠️  Error actualizando restricción de estados:', error.message);
        }
    }

    async crearClienteGenerico() {
        try {
            console.log('👤 Verificando cliente genérico...');
            
            // Verificar si ya existe
            const clienteExistente = await database.query(`
                SELECT ClienteID FROM Clientes 
                WHERE TipoDocumento = 'Cedula' AND NumeroDocumento = '9999999999'
            `);

            if (clienteExistente.recordset.length === 0) {
                console.log('➕ Creando cliente genérico...');
                
                await database.query(`
                    INSERT INTO Clientes (
                        TipoDocumento, NumeroDocumento, Nombres, Apellidos, Email, 
                        Ciudad, Provincia, CreadoPor
                    ) VALUES (
                        'Cedula', '9999999999', 'Consumidor', 'Final', 'publico@general.com',
                        'Guayaquil', 'Guayas', 1
                    )
                `);
                
                console.log('✅ Cliente genérico creado');
            } else {
                console.log('✅ Cliente genérico ya existe');
            }

        } catch (error) {
            console.error('Error creando cliente genérico:', error);
            throw error;
        }
    }

    async crearConfiguracionPOS() {
        try {
            console.log('⚙️  Verificando configuración POS...');
            
            const configExistente = await database.query(`
                SELECT ConfigID FROM ConfiguracionPOS
            `);

            if (configExistente.recordset.length === 0) {
                console.log('➕ Creando configuración inicial del POS...');
                
                await database.query(`
                    INSERT INTO ConfiguracionPOS (
                        NombreEmpresa, RUCEmpresa, DireccionEmpresa, TelefonoEmpresa, EmailEmpresa,
                        PorcentajeIVA, MonedaDefecto, NumeroFacturaInicial, PrefijoFactura,
                        MensajePieFactura, RequiereClienteObligatorio, PermiteVentaCredito
                    ) VALUES (
                        'TecnoInventario S.A.', '0992123456001', 'Av. 9 de Octubre 1234, Guayaquil',
                        '04-2345678', 'ventas@tecnoinventario.com.ec', 12.00, 'USD', 1, 'FACT-',
                        'Gracias por su compra. Garantía según términos y condiciones.',
                        0, 1
                    )
                `);
                
                console.log('✅ Configuración POS creada');
            } else {
                console.log('✅ Configuración POS ya existe');
            }

        } catch (error) {
            console.error('Error creando configuración POS:', error);
            throw error;
        }
    }

    async actualizarDispositivosParaVentas() {
        try {
            console.log('📦 Actualizando dispositivos para ventas...');
            
            // Verificar si hay dispositivos sin configurar para ventas
            const dispositivosSinConfigurar = await database.query(`
                SELECT COUNT(*) as total 
                FROM Dispositivos 
                WHERE PermiteVenta IS NULL OR StockActual IS NULL
            `);

            if (dispositivosSinConfigurar.recordset[0].total > 0) {
                console.log(`➕ Configurando ${dispositivosSinConfigurar.recordset[0].total} dispositivos para ventas...`);
                
                // Actualizar dispositivos existentes
                const resultado = await database.query(`
                    UPDATE Dispositivos 
                    SET StockActual = ISNULL(StockActual, 1), 
                        StockMinimo = ISNULL(StockMinimo, 1),
                        PermiteVenta = ISNULL(PermiteVenta, 1),
                        CategoriaVenta = ISNULL(CategoriaVenta, 'Producto'),
                        PrecioVenta = CASE 
                            WHEN PrecioVenta IS NULL AND PrecioCompra IS NOT NULL THEN PrecioCompra * 1.3
                            WHEN PrecioVenta IS NULL THEN 100.00
                            ELSE PrecioVenta
                        END
                    WHERE PermiteVenta IS NULL OR StockActual IS NULL OR PrecioVenta IS NULL
                `);
                
                console.log(`✅ ${resultado.rowsAffected[0]} dispositivos actualizados para ventas`);
            } else {
                console.log('✅ Todos los dispositivos ya están configurados para ventas');
            }

        } catch (error) {
            console.error('Error actualizando dispositivos:', error);
            throw error;
        }
    }

    async crearPreciosIniciales() {
        try {
            console.log('💰 Verificando precios de venta...');
            
            // Verificar dispositivos sin precios configurados
            const dispositivosSinPrecios = await database.query(`
                SELECT d.DispositivoID, d.PrecioCompra, d.PrecioVenta
                FROM Dispositivos d
                LEFT JOIN PreciosDispositivos p ON d.DispositivoID = p.DispositivoID 
                    AND p.TipoPrecio = 'Venta' AND p.Activo = 1
                WHERE d.PermiteVenta = 1 
                    AND p.PrecioID IS NULL 
                    AND d.PrecioVenta IS NOT NULL
            `);

            if (dispositivosSinPrecios.recordset.length > 0) {
                console.log(`➕ Creando precios de venta para ${dispositivosSinPrecios.recordset.length} dispositivos...`);
                
                for (const dispositivo of dispositivosSinPrecios.recordset) {
                    const ganancia = dispositivo.PrecioCompra 
                        ? ((dispositivo.PrecioVenta - dispositivo.PrecioCompra) / dispositivo.PrecioCompra * 100)
                        : 30;

                    await database.query(`
                        INSERT INTO PreciosDispositivos (DispositivoID, TipoPrecio, Precio, PorcentajeGanancia, CreadoPor)
                        VALUES (@param0, 'Venta', @param1, @param2, 1)
                    `, [dispositivo.DispositivoID, dispositivo.PrecioVenta, ganancia]);
                }
                
                console.log('✅ Precios de venta iniciales creados');
            } else {
                console.log('✅ Precios de venta ya configurados');
            }

        } catch (error) {
            console.error('Error creando precios iniciales:', error);
            throw error;
        }
    }

    async verificarTriggers() {
        try {
            console.log('🔧 Verificando triggers y funciones...');
            
            // Verificar si existe la función para generar número de factura
            const funcionFactura = await database.query(`
                SELECT OBJECT_ID('dbo.FN_GenerarNumeroFactura') as existe
            `);

            if (!funcionFactura.recordset[0].existe) {
                console.log('➕ Creando función para generar números de factura...');
                
                await database.query(`
                    CREATE FUNCTION FN_GenerarNumeroFactura()
                    RETURNS VARCHAR(50)
                    AS
                    BEGIN
                        DECLARE @Prefijo VARCHAR(10);
                        DECLARE @Siguiente INT;
                        DECLARE @NumeroFactura VARCHAR(50);
                        
                        SELECT @Prefijo = ISNULL(PrefijoFactura, 'FACT-') FROM ConfiguracionPOS;
                        
                        SELECT @Siguiente = ISNULL(MAX(CAST(SUBSTRING(NumeroFactura, LEN(@Prefijo) + 1, 10) AS INT)), 0) + 1
                        FROM Ventas 
                        WHERE NumeroFactura LIKE @Prefijo + '%';
                        
                        SET @NumeroFactura = @Prefijo + RIGHT('0000000' + CAST(@Siguiente AS VARCHAR(10)), 7);
                        
                        RETURN @NumeroFactura;
                    END
                `);
                
                console.log('✅ Función FN_GenerarNumeroFactura creada');
            } else {
                console.log('✅ Función FN_GenerarNumeroFactura ya existe');
            }

            // Verificar si existe la función para validar stock
            const funcionStock = await database.query(`
                SELECT OBJECT_ID('dbo.SP_ValidarStockVenta') as existe
            `);

            if (!funcionStock.recordset[0].existe) {
                console.log('➕ Creando procedimiento para validar stock...');
                
                await database.query(`
                    CREATE PROCEDURE SP_ValidarStockVenta
                        @DispositivoID INT,
                        @CantidadSolicitada INT
                    AS
                    BEGIN
                        SET NOCOUNT ON;
                        
                        DECLARE @StockActual INT;
                        DECLARE @NombreDispositivo NVARCHAR(100);
                        DECLARE @Estado NVARCHAR(20);
                        
                        SELECT @StockActual = StockActual, 
                               @NombreDispositivo = NombreDispositivo,
                               @Estado = Estado
                        FROM Dispositivos 
                        WHERE DispositivoID = @DispositivoID;
                        
                        IF @StockActual IS NULL
                        BEGIN
                            SELECT 0 as EsValido, 'Dispositivo no encontrado' as Mensaje;
                            RETURN;
                        END
                        
                        IF @Estado NOT IN ('Disponible', 'En Venta')
                        BEGIN
                            SELECT 0 as EsValido, 'Dispositivo no disponible para venta. Estado: ' + @Estado as Mensaje;
                            RETURN;
                        END
                        
                        IF @StockActual < @CantidadSolicitada
                        BEGIN
                            SELECT 0 as EsValido, 
                                   'Stock insuficiente. Disponible: ' + CAST(@StockActual AS VARCHAR(10)) + 
                                   ', Solicitado: ' + CAST(@CantidadSolicitada AS VARCHAR(10)) as Mensaje;
                            RETURN;
                        END
                        
                        SELECT 1 as EsValido, 'Stock disponible' as Mensaje, @StockActual as StockDisponible;
                    END
                `);
                
                console.log('✅ Procedimiento SP_ValidarStockVenta creado');
            } else {
                console.log('✅ Procedimiento SP_ValidarStockVenta ya existe');
            }

        } catch (error) {
            console.warn('⚠️  Error verificando triggers:', error.message);
            // No lanzar error aquí, los triggers no son críticos para el funcionamiento básico
        }
    }

    async verificarEstado() {
        try {
            const estado = {
                columnasPOS: false,
                clienteGenerico: false,
                configuracionPOS: false,
                dispositivosConfigurados: false,
                preciosConfigurados: false
            };

            // Verificar columnas POS
            const columnas = await database.query(`
                SELECT COUNT(*) as total 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Dispositivos' 
                AND COLUMN_NAME IN ('PrecioVenta', 'StockMinimo', 'StockActual', 'PermiteVenta', 'CategoriaVenta')
            `);
            estado.columnasPOS = columnas.recordset[0].total === 5;

            // Verificar cliente genérico
            const cliente = await database.query(`
                SELECT COUNT(*) as total FROM Clientes 
                WHERE TipoDocumento = 'Cedula' AND NumeroDocumento = '9999999999'
            `);
            estado.clienteGenerico = cliente.recordset[0].total > 0;

            // Verificar configuración POS
            const config = await database.query(`
                SELECT COUNT(*) as total FROM ConfiguracionPOS
            `);
            estado.configuracionPOS = config.recordset[0].total > 0;

            // Verificar dispositivos configurados
            const dispositivos = await database.query(`
                SELECT COUNT(*) as total FROM Dispositivos 
                WHERE PermiteVenta IS NOT NULL AND StockActual IS NOT NULL
            `);
            const totalDispositivos = await database.query(`
                SELECT COUNT(*) as total FROM Dispositivos
            `);
            estado.dispositivosConfigurados = dispositivos.recordset[0].total === totalDispositivos.recordset[0].total;

            estado.configurado = Object.values(estado).every(valor => valor === true);

            return estado;

        } catch (error) {
            console.error('Error verificando estado:', error);
            return { configurado: false, error: error.message };
        }
    }
}

// Instancia singleton
const inicializadorPOS = new InitializadorPOS();

module.exports = inicializadorPOS;