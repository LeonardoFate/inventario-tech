-- ============================================================
-- EXTENSIÓN POS PARA SISTEMA DE INVENTARIO EXISTENTE
-- Integración con las tablas existentes del inventario
-- ============================================================

-- NOTA: Este script extiende la base de datos SistemaInventarioTec existente
-- Ejecutar después de tener el sistema de inventario base instalado

USE SistemaInventarioTec;
GO

-- 1. Tabla de Clientes (nueva para POS)
CREATE TABLE Clientes (
    ClienteID INT IDENTITY(1,1) PRIMARY KEY,
    TipoDocumento VARCHAR(10) NOT NULL DEFAULT 'Cedula', -- Cedula, RUC, Pasaporte
    NumeroDocumento VARCHAR(20) NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100),
    RazonSocial VARCHAR(200), -- Para empresas
    Email VARCHAR(100),
    Telefono VARCHAR(15),
    Direccion VARCHAR(500),
    Ciudad VARCHAR(100),
    Provincia VARCHAR(100),
    FechaNacimiento DATE,
    Genero VARCHAR(10), -- Masculino, Femenino, Otro
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME,
    CreadoPor INT,
    CONSTRAINT FK_Clientes_CreadoPor FOREIGN KEY (CreadoPor) REFERENCES Usuarios(UsuarioID),
    CONSTRAINT UQ_Clientes_Documento UNIQUE (TipoDocumento, NumeroDocumento)
);

-- 2. Tabla de Ventas/Facturas
CREATE TABLE Ventas (
    VentaID INT IDENTITY(1,1) PRIMARY KEY,
    NumeroFactura VARCHAR(50) NOT NULL,
    ClienteID INT NOT NULL,
    VendedorID INT NOT NULL,
    FechaVenta DATETIME NOT NULL DEFAULT GETDATE(),
    Subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    IVA DECIMAL(15,2) NOT NULL DEFAULT 0,
    Descuento DECIMAL(15,2) NOT NULL DEFAULT 0,
    Total DECIMAL(15,2) NOT NULL DEFAULT 0,
    FormaPago VARCHAR(50) NOT NULL, -- Efectivo, Tarjeta, Transferencia, Credito
    EstadoPago VARCHAR(20) NOT NULL DEFAULT 'Pagado', -- Pagado, Pendiente, Parcial
    EstadoVenta VARCHAR(20) NOT NULL DEFAULT 'Completada', -- Completada, Cancelada, Devuelta
    Observaciones TEXT,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME,
    CONSTRAINT FK_Ventas_Cliente FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID),
    CONSTRAINT FK_Ventas_Vendedor FOREIGN KEY (VendedorID) REFERENCES Usuarios(UsuarioID),
    CONSTRAINT UQ_Ventas_NumeroFactura UNIQUE (NumeroFactura)
);

-- 3. Tabla de Detalle de Ventas
CREATE TABLE DetalleVenta (
    DetalleVentaID INT IDENTITY(1,1) PRIMARY KEY,
    VentaID INT NOT NULL,
    DispositivoID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1,
    PrecioUnitario DECIMAL(15,2) NOT NULL,
    Descuento DECIMAL(15,2) NOT NULL DEFAULT 0,
    Subtotal DECIMAL(15,2) NOT NULL,
    IVA DECIMAL(15,2) NOT NULL DEFAULT 0,
    Total DECIMAL(15,2) NOT NULL,
    Observaciones VARCHAR(500),
    CONSTRAINT FK_DetalleVenta_Venta FOREIGN KEY (VentaID) REFERENCES Ventas(VentaID) ON DELETE CASCADE,
    CONSTRAINT FK_DetalleVenta_Dispositivo FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID)
);

-- 4. Tabla de Pagos (para ventas a crédito)
CREATE TABLE PagosVenta (
    PagoID INT IDENTITY(1,1) PRIMARY KEY,
    VentaID INT NOT NULL,
    FechaPago DATETIME NOT NULL DEFAULT GETDATE(),
    Monto DECIMAL(15,2) NOT NULL,
    FormaPago VARCHAR(50) NOT NULL,
    NumeroTransaccion VARCHAR(100),
    Observaciones VARCHAR(500),
    RealizadoPor INT NOT NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PagosVenta_Venta FOREIGN KEY (VentaID) REFERENCES Ventas(VentaID),
    CONSTRAINT FK_PagosVenta_Usuario FOREIGN KEY (RealizadoPor) REFERENCES Usuarios(UsuarioID)
);

-- 5. Tabla de Configuración POS
CREATE TABLE ConfiguracionPOS (
    ConfigID INT IDENTITY(1,1) PRIMARY KEY,
    NombreEmpresa VARCHAR(200) NOT NULL,
    RUCEmpresa VARCHAR(13) NOT NULL,
    DireccionEmpresa VARCHAR(500),
    TelefonoEmpresa VARCHAR(20),
    EmailEmpresa VARCHAR(100),
    LogoEmpresa VARCHAR(500), -- Ruta del logo
    PorcentajeIVA DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    MonedaDefecto VARCHAR(10) NOT NULL DEFAULT 'USD',
    NumeroFacturaInicial INT NOT NULL DEFAULT 1,
    PrefijoFactura VARCHAR(10) NOT NULL DEFAULT 'FACT-',
    MensajePieFactura TEXT,
    TerminosCondiciones TEXT,
    ImprimirAutomatico BIT NOT NULL DEFAULT 0,
    RequiereClienteObligatorio BIT NOT NULL DEFAULT 0,
    PermiteVentaCredito BIT NOT NULL DEFAULT 1,
    DiasVencimientoCredito INT NOT NULL DEFAULT 30,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME,
    ActualizadoPor INT,
    CONSTRAINT FK_ConfigPOS_Usuario FOREIGN KEY (ActualizadoPor) REFERENCES Usuarios(UsuarioID)
);

-- 6. Tabla de Precios de Dispositivos (integrada con Dispositivos existente)
CREATE TABLE PreciosDispositivos (
    PrecioID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    TipoPrecio VARCHAR(20) NOT NULL DEFAULT 'Venta', -- Venta, Mayoreo, Descuento, Promocion
    Precio DECIMAL(15,2) NOT NULL,
    PorcentajeGanancia DECIMAL(5,2),
    FechaVigenciaDesde DATETIME NOT NULL DEFAULT GETDATE(),
    FechaVigenciaHasta DATETIME,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CreadoPor INT,
    CONSTRAINT FK_PreciosDispositivos_Dispositivo FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    CONSTRAINT FK_PreciosDispositivos_Usuario FOREIGN KEY (CreadoPor) REFERENCES Usuarios(UsuarioID)
);

-- 7. Tabla de Arqueo de Caja
CREATE TABLE ArqueoCaja (
    ArqueoID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    FechaApertura DATETIME NOT NULL DEFAULT GETDATE(),
    FechaCierre DATETIME,
    MontoApertura DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoVentas DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoEfectivo DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoTarjeta DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoTransferencia DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoTotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    MontoCierre DECIMAL(15,2),
    Diferencia DECIMAL(15,2),
    Estado VARCHAR(20) NOT NULL DEFAULT 'Abierto', -- Abierto, Cerrado
    Observaciones TEXT,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ArqueoCaja_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- 8. Tabla de Promociones y Descuentos
CREATE TABLE Promociones (
    PromocionID INT IDENTITY(1,1) PRIMARY KEY,
    NombrePromocion VARCHAR(200) NOT NULL,
    TipoPromocion VARCHAR(20) NOT NULL, -- Porcentaje, MontoFijo, 2x1, Combo
    ValorDescuento DECIMAL(15,2) NOT NULL,
    FechaInicio DATETIME NOT NULL,
    FechaFin DATETIME NOT NULL,
    CategoriaID INT, -- Si aplica a una categoría específica
    DispositivoID INT, -- Si aplica a un dispositivo específico
    MontoMinimoCompra DECIMAL(15,2) DEFAULT 0,
    LimiteUsos INT, -- Número máximo de usos
    UsosActuales INT DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CreadoPor INT,
    CONSTRAINT FK_Promociones_Categoria FOREIGN KEY (CategoriaID) REFERENCES Categorias(CategoriaID),
    CONSTRAINT FK_Promociones_Dispositivo FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    CONSTRAINT FK_Promociones_Usuario FOREIGN KEY (CreadoPor) REFERENCES Usuarios(UsuarioID)
);

-- 9. Tabla de Reservas (para dispositivos apartados)
CREATE TABLE Reservas (
    ReservaID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    ClienteID INT NOT NULL,
    FechaReserva DATETIME NOT NULL DEFAULT GETDATE(),
    FechaVencimiento DATETIME NOT NULL,
    MontoSena DECIMAL(15,2) DEFAULT 0,
    EstadoReserva VARCHAR(20) NOT NULL DEFAULT 'Activa', -- Activa, Completada, Cancelada, Vencida
    Observaciones TEXT,
    RealizadoPor INT NOT NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Reservas_Dispositivo FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    CONSTRAINT FK_Reservas_Cliente FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID),
    CONSTRAINT FK_Reservas_Usuario FOREIGN KEY (RealizadoPor) REFERENCES Usuarios(UsuarioID)
);

-- 10. Tabla de Devoluciones
CREATE TABLE Devoluciones (
    DevolucionID INT IDENTITY(1,1) PRIMARY KEY,
    VentaID INT NOT NULL,
    DispositivoID INT NOT NULL,
    TipoDevolucion VARCHAR(20) NOT NULL, -- Total, Parcial, Cambio
    MotivoDevolucion VARCHAR(100) NOT NULL,
    MontoDevolucion DECIMAL(15,2) NOT NULL,
    FechaDevolucion DATETIME NOT NULL DEFAULT GETDATE(),
    AutorizadoPor INT NOT NULL,
    EstadoDispositivo VARCHAR(20) NOT NULL, -- Nuevo, Usado, Defectuoso
    Observaciones TEXT,
    CONSTRAINT FK_Devoluciones_Venta FOREIGN KEY (VentaID) REFERENCES Ventas(VentaID),
    CONSTRAINT FK_Devoluciones_Dispositivo FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    CONSTRAINT FK_Devoluciones_Usuario FOREIGN KEY (AutorizadoPor) REFERENCES Usuarios(UsuarioID)
);

-- Índices para mejorar rendimiento
CREATE INDEX IX_Ventas_Fecha ON Ventas(FechaVenta);
CREATE INDEX IX_Ventas_Cliente ON Ventas(ClienteID);
CREATE INDEX IX_Ventas_Vendedor ON Ventas(VendedorID);
CREATE INDEX IX_Ventas_NumeroFactura ON Ventas(NumeroFactura);
CREATE INDEX IX_DetalleVenta_Dispositivo ON DetalleVenta(DispositivoID);
CREATE INDEX IX_Clientes_Documento ON Clientes(NumeroDocumento);
CREATE INDEX IX_PreciosDispositivos_Dispositivo ON PreciosDispositivos(DispositivoID);

-- Triggers actualizados para integración con inventario

-- Trigger para actualizar totales de venta (mantener el existente)
CREATE TRIGGER TR_ActualizarTotalesVenta
ON DetalleVenta
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Actualizar totales para ventas afectadas
    UPDATE v SET
        Subtotal = ISNULL(d.Subtotal, 0),
        IVA = ISNULL(d.IVA, 0),
        Total = ISNULL(d.Total, 0)
    FROM Ventas v
    INNER JOIN (
        SELECT 
            VentaID,
            SUM(Subtotal) as Subtotal,
            SUM(IVA) as IVA,
            SUM(Total) as Total
        FROM DetalleVenta
        GROUP BY VentaID
    ) d ON v.VentaID = d.VentaID
    WHERE v.VentaID IN (
        SELECT DISTINCT VentaID FROM inserted
        UNION
        SELECT DISTINCT VentaID FROM deleted
    );
END;
GO

-- Trigger para cambiar estado de dispositivos vendidos (actualizado)
CREATE TRIGGER TR_CambiarEstadoDispositivoVendido
ON DetalleVenta
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cambiar estado de dispositivos a "Vendido" y actualizar stock
    UPDATE Dispositivos 
    SET Estado = CASE 
                    WHEN StockActual <= 1 THEN 'Vendido'
                    ELSE 'En Venta'
                END,
        StockActual = GREATEST(StockActual - i.Cantidad, 0),
        FechaActualizacion = GETDATE()
    FROM Dispositivos d
    INNER JOIN inserted i ON d.DispositivoID = i.DispositivoID;
    
    -- Registrar en historial del inventario existente
    INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
    SELECT 
        i.DispositivoID, 
        'Vendido', 
        (SELECT VendedorID FROM Ventas WHERE VentaID = i.VentaID),
        'Dispositivo vendido en factura ' + 
        (SELECT NumeroFactura FROM Ventas WHERE VentaID = i.VentaID) +
        '. Cantidad: ' + CAST(i.Cantidad AS VARCHAR(10))
    FROM inserted i;
END;
GO

-- Trigger para devoluciones - restaurar estado de dispositivo
CREATE TRIGGER TR_RestaurarEstadoDevolucion
ON Devoluciones
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Restaurar estado según el estado del dispositivo devuelto
    UPDATE Dispositivos 
    SET Estado = CASE 
                    WHEN i.EstadoDispositivo = 'Defectuoso' THEN 'En Reparacion'
                    WHEN i.EstadoDispositivo = 'Usado' THEN 'Disponible'
                    ELSE 'Disponible'
                END,
        Condicion = CASE 
                       WHEN i.EstadoDispositivo = 'Defectuoso' THEN 'Malo'
                       WHEN i.EstadoDispositivo = 'Usado' THEN 'Bueno'
                       ELSE 'Excelente'
                   END,
        StockActual = StockActual + 1,
        FechaActualizacion = GETDATE()
    FROM Dispositivos d
    INNER JOIN inserted i ON d.DispositivoID = i.DispositivoID;
    
    -- Registrar en historial
    INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
    SELECT 
        i.DispositivoID, 
        'Devuelto', 
        i.AutorizadoPor,
        'Devolución procesada. Motivo: ' + i.MotivoDevolucion + 
        '. Estado: ' + i.EstadoDispositivo
    FROM inserted i;
END;
GO

-- Función para generar número de factura (integrada con inventario)
CREATE FUNCTION FN_GenerarNumeroFactura()
RETURNS VARCHAR(50)
AS
BEGIN
    DECLARE @Prefijo VARCHAR(10);
    DECLARE @Siguiente INT;
    DECLARE @NumeroFactura VARCHAR(50);
    
    SELECT @Prefijo = PrefijoFactura FROM ConfiguracionPOS;
    
    IF @Prefijo IS NULL
        SET @Prefijo = 'FACT-';
    
    SELECT @Siguiente = ISNULL(MAX(CAST(SUBSTRING(NumeroFactura, LEN(@Prefijo) + 1, 10) AS INT)), 0) + 1
    FROM Ventas 
    WHERE NumeroFactura LIKE @Prefijo + '%';
    
    SET @NumeroFactura = @Prefijo + RIGHT('0000000' + CAST(@Siguiente AS VARCHAR(10)), 7);
    
    RETURN @NumeroFactura;
END;
GO

-- Procedimiento para procesar venta completa
CREATE PROCEDURE SP_ProcesarVenta
    @ClienteID INT,
    @VendedorID INT,
    @FormaPago VARCHAR(50),
    @Items NVARCHAR(MAX), -- JSON con items de venta
    @DescuentoGlobal DECIMAL(5,2) = 0,
    @Observaciones NVARCHAR(MAX) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @VentaID INT;
        DECLARE @NumeroFactura VARCHAR(50);
        DECLARE @PorcentajeIVA DECIMAL(5,2);
        
        -- Generar número de factura
        SET @NumeroFactura = dbo.FN_GenerarNumeroFactura();
        
        -- Obtener IVA de configuración
        SELECT @PorcentajeIVA = PorcentajeIVA FROM ConfiguracionPOS;
        IF @PorcentajeIVA IS NULL SET @PorcentajeIVA = 12.00;
        
        -- Crear venta principal
        INSERT INTO Ventas (NumeroFactura, ClienteID, VendedorID, FormaPago, Observaciones)
        VALUES (@NumeroFactura, @ClienteID, @VendedorID, @FormaPago, @Observaciones);
        
        SET @VentaID = SCOPE_IDENTITY();
        
        -- Procesar items (esto se haría desde el backend con el JSON)
        -- Los totales se calculan automáticamente por el trigger
        
        COMMIT TRANSACTION;
        
        SELECT @VentaID as VentaID, @NumeroFactura as NumeroFactura;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Vistas para reportes POS integradas con inventario

-- Vista de ventas con información completa
CREATE VIEW VW_VentasCompletas AS
SELECT 
    v.VentaID,
    v.NumeroFactura,
    v.FechaVenta,
    v.Total,
    v.FormaPago,
    v.EstadoVenta,
    CONCAT(c.Nombres, ' ', ISNULL(c.Apellidos, '')) as NombreCliente,
    c.NumeroDocumento,
    c.TipoDocumento,
    CONCAT(u.Nombres, ' ', u.Apellidos) as NombreVendedor,
    u.Departamento as DepartamentoVendedor,
    ub.NombreUbicacion as UbicacionVenta,
    (SELECT COUNT(*) FROM DetalleVenta WHERE VentaID = v.VentaID) as TotalArticulos,
    (SELECT SUM(Cantidad) FROM DetalleVenta WHERE VentaID = v.VentaID) as TotalUnidades
FROM Ventas v
INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
INNER JOIN Usuarios u ON v.VendedorID = u.UsuarioID
LEFT JOIN Ubicaciones ub ON u.UbicacionID = ub.UbicacionID;
GO

-- Vista de productos más vendidos
CREATE VIEW VW_ProductosMasVendidos AS
SELECT 
    d.DispositivoID,
    d.CodigoDispositivo,
    d.NombreDispositivo,
    cat.NombreCategoria,
    m.NombreMarca,
    d.Modelo,
    COUNT(dv.DetalleVentaID) as VecesVendido,
    SUM(dv.Cantidad) as CantidadTotalVendida,
    SUM(dv.Total) as TotalVentas,
    AVG(dv.PrecioUnitario) as PrecioPromedio,
    MAX(v.FechaVenta) as UltimaVenta
FROM Dispositivos d
INNER JOIN DetalleVenta dv ON d.DispositivoID = dv.DispositivoID
INNER JOIN Ventas v ON dv.VentaID = v.VentaID
INNER JOIN Categorias cat ON d.CategoriaID = cat.CategoriaID
INNER JOIN Marcas m ON d.MarcaID = m.MarcaID
WHERE v.EstadoVenta = 'Completada'
GROUP BY d.DispositivoID, d.CodigoDispositivo, d.NombreDispositivo, 
         cat.NombreCategoria, m.NombreMarca, d.Modelo;
GO

-- Vista de inventario disponible para ventas
CREATE VIEW VW_InventarioParaVentas AS
SELECT 
    d.DispositivoID,
    d.CodigoDispositivo,
    d.NombreDispositivo,
    cat.NombreCategoria,
    m.NombreMarca,
    d.Modelo,
    d.Estado,
    d.Condicion,
    d.StockActual,
    d.StockMinimo,
    d.PrecioCompra,
    d.PrecioVenta,
    p.Precio as PrecioVentaActual,
    p.PorcentajeGanancia,
    d.PermiteVenta,
    CASE 
        WHEN d.StockActual <= d.StockMinimo THEN 'Stock Bajo'
        WHEN d.StockActual = 0 THEN 'Sin Stock'
        ELSE 'Stock OK'
    END as EstadoStock
FROM Dispositivos d
INNER JOIN Categorias cat ON d.CategoriaID = cat.CategoriaID
INNER JOIN Marcas m ON d.MarcaID = m.MarcaID
LEFT JOIN PreciosDispositivos p ON d.DispositivoID = p.DispositivoID 
    AND p.TipoPrecio = 'Venta' AND p.Activo = 1
    AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta >= GETDATE())
WHERE d.PermiteVenta = 1 
    AND d.Estado IN ('Disponible', 'En Venta');
GO

-- Insertar datos iniciales para POS

-- Configuración inicial del POS
INSERT INTO ConfiguracionPOS (
    NombreEmpresa, RUCEmpresa, DireccionEmpresa, TelefonoEmpresa, EmailEmpresa,
    PorcentajeIVA, MonedaDefecto, NumeroFacturaInicial, PrefijoFactura,
    MensajePieFactura, RequiereClienteObligatorio, PermiteVentaCredito
) VALUES (
    'TecnoInventario S.A.', '0992123456001', 'Av. 9 de Octubre 1234, Guayaquil',
    '04-2345678', 'ventas@tecnoinventario.com.ec', 12.00, 'USD', 1, 'FACT-',
    'Gracias por su compra. Garantía según términos y condiciones.',
    0, 1
);

-- Cliente genérico para ventas al público
INSERT INTO Clientes (
    TipoDocumento, NumeroDocumento, Nombres, Apellidos, Email, 
    Ciudad, Provincia, CreadoPor
) VALUES (
    'Cedula', '9999999999', 'Consumidor', 'Final', 'publico@general.com',
    'Guayaquil', 'Guayas', 1
);

-- Actualizar dispositivos existentes para habilitar ventas
UPDATE Dispositivos 
SET PermiteVenta = 1, 
    StockActual = 1, 
    StockMinimo = 1,
    PrecioVenta = CASE 
        WHEN PrecioCompra IS NOT NULL THEN PrecioCompra * 1.3 -- 30% de ganancia por defecto
        ELSE 100.00
    END
WHERE Estado = 'Disponible';

-- Crear precios iniciales para dispositivos existentes
INSERT INTO PreciosDispositivos (DispositivoID, TipoPrecio, Precio, PorcentajeGanancia, CreadoPor)
SELECT 
    DispositivoID,
    'Venta',
    CASE 
        WHEN PrecioCompra IS NOT NULL THEN PrecioCompra * 1.3
        ELSE 100.00
    END,
    30.00,
    1
FROM Dispositivos 
WHERE PrecioCompra IS NOT NULL AND PermiteVenta = 1;

-- Agregar nuevos estados a la tabla Dispositivos existente
-- Primero eliminamos la restricción existente
ALTER TABLE Dispositivos DROP CONSTRAINT IF EXISTS CK_Dispositivos_Estado;
GO

-- Agregamos la nueva restricción con los estados adicionales para ventas
ALTER TABLE Dispositivos 
ADD CONSTRAINT CK_Dispositivos_Estado 
CHECK (Estado IN ('Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido', 'Vendido', 'Reservado', 'En Venta'));
GO

-- Agregar campos necesarios para ventas en Dispositivos
ALTER TABLE Dispositivos 
ADD PrecioVenta DECIMAL(15,2) NULL,
    StockMinimo INT DEFAULT 1,
    StockActual INT DEFAULT 1,
    PermiteVenta BIT DEFAULT 1,
    CategoriaVenta NVARCHAR(20) DEFAULT 'Producto'; -- Producto, Servicio, Digital
GO