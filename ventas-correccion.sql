-- ============================================================
-- CORRECCIÓN: Agregar columnas faltantes a la tabla Dispositivos
-- Ejecutar ANTES de crear los triggers del POS
-- ============================================================

USE SistemaInventarioTec;
GO

-- Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Dispositivos') AND name = 'PrecioVenta')
BEGIN
    ALTER TABLE Dispositivos ADD PrecioVenta DECIMAL(15,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Dispositivos') AND name = 'StockMinimo')
BEGIN
    ALTER TABLE Dispositivos ADD StockMinimo INT DEFAULT 1;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Dispositivos') AND name = 'StockActual')
BEGIN
    ALTER TABLE Dispositivos ADD StockActual INT DEFAULT 1;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Dispositivos') AND name = 'PermiteVenta')
BEGIN
    ALTER TABLE Dispositivos ADD PermiteVenta BIT DEFAULT 1;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Dispositivos') AND name = 'CategoriaVenta')
BEGIN
    ALTER TABLE Dispositivos ADD CategoriaVenta NVARCHAR(20) DEFAULT 'Producto';
END
GO

-- Actualizar la restricción de estados si no incluye los nuevos estados
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Dispositivos_Estado')
BEGIN
    ALTER TABLE Dispositivos DROP CONSTRAINT CK_Dispositivos_Estado;
END

ALTER TABLE Dispositivos 
ADD CONSTRAINT CK_Dispositivos_Estado 
CHECK (Estado IN ('Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido', 'Vendido', 'Reservado', 'En Venta'));
GO

-- Inicializar valores para dispositivos existentes
UPDATE Dispositivos 
SET StockActual = 1,
    StockMinimo = 1,
    PermiteVenta = CASE 
        WHEN Estado IN ('Disponible', 'En Venta') THEN 1 
        ELSE 0 
    END,
    PrecioVenta = CASE 
        WHEN PrecioCompra IS NOT NULL AND PrecioCompra > 0 THEN PrecioCompra * 1.3
        ELSE NULL
    END,
    CategoriaVenta = 'Producto'
WHERE StockActual IS NULL;

GO

-- Verificar que SQL Server soporte GREATEST, si no, usar una alternativa
-- SQL Server 2022+ tiene GREATEST, versiones anteriores necesitan CASE
-- Aquí usamos la versión compatible:

-- Eliminar trigger existente si existe
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_CambiarEstadoDispositivoVendido')
BEGIN
    DROP TRIGGER TR_CambiarEstadoDispositivoVendido;
END
GO

-- Crear trigger corregido compatible con todas las versiones de SQL Server
CREATE TRIGGER TR_CambiarEstadoDispositivoVendido
ON DetalleVenta
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cambiar estado de dispositivos a "Vendido" y actualizar stock
    UPDATE Dispositivos 
    SET Estado = CASE 
                    WHEN (StockActual - i.Cantidad) <= 0 THEN 'Vendido'
                    ELSE 'En Venta'
                END,
        StockActual = CASE 
                        WHEN (StockActual - i.Cantidad) < 0 THEN 0
                        ELSE (StockActual - i.Cantidad)
                      END,
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

-- Trigger para devoluciones (también corregido)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_RestaurarEstadoDevolucion')
BEGIN
    DROP TRIGGER TR_RestaurarEstadoDevolucion;
END
GO

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
                    WHEN i.EstadoDispositivo = 'Usado' THEN 'En Venta'
                    ELSE 'En Venta'
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

-- Función auxiliar para obtener el siguiente ID de cliente genérico
-- (para uso en el backend cuando no se especifique cliente)
CREATE FUNCTION FN_ObtenerClienteGenerico()
RETURNS INT
AS
BEGIN
    DECLARE @ClienteID INT;
    
    SELECT @ClienteID = ClienteID 
    FROM Clientes 
    WHERE NumeroDocumento = '9999999999' 
    AND TipoDocumento = 'Cedula';
    
    -- Si no existe, devolver NULL para que el sistema lo cree
    RETURN @ClienteID;
END;
GO

-- Procedimiento para validar stock antes de venta
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
    
    -- Validaciones
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
    
    -- Si llegamos aquí, la validación es exitosa
    SELECT 1 as EsValido, 'Stock disponible' as Mensaje, @StockActual as StockDisponible;
END;
GO

-- Vista para obtener dispositivos disponibles para venta
CREATE OR ALTER VIEW VW_DispositivosParaVenta AS
SELECT 
    d.DispositivoID,
    d.CodigoDispositivo,
    d.NombreDispositivo,
    c.NombreCategoria,
    m.NombreMarca,
    d.Modelo,
    d.NumeroSerie,
    d.Estado,
    d.Condicion,
    d.StockActual,
    d.StockMinimo,
    d.PrecioCompra,
    d.PrecioVenta,
    ISNULL(p.Precio, d.PrecioVenta) as PrecioVentaActual,
    p.PorcentajeGanancia,
    d.PermiteVenta,
    u.NombreUbicacion,
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
LEFT JOIN Ubicaciones u ON d.UbicacionID = u.UbicacionID
LEFT JOIN PreciosDispositivos p ON d.DispositivoID = p.DispositivoID 
    AND p.TipoPrecio = 'Venta' 
    AND p.Activo = 1
    AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta >= GETDATE())
WHERE d.PermiteVenta = 1 
    AND d.Estado IN ('Disponible', 'En Venta')
    AND d.StockActual > 0;
GO

PRINT 'Columnas agregadas exitosamente. Ahora puedes ejecutar el resto del script POS.';
PRINT 'Dispositivos actualizados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));