-- Base de datos para Sistema de Inventario de Dispositivos Tecnológicos
-- SQL Server - Versión en Español para Ecuador

-- Crear la base de datos
CREATE DATABASE SistemaInventarioTec;
GO

USE SistemaInventarioTec;
GO

-- Tabla de Categorías de Dispositivos
CREATE TABLE Categorias (
    CategoriaID INT IDENTITY(1,1) PRIMARY KEY,
    NombreCategoria NVARCHAR(50) NOT NULL UNIQUE,
    Descripcion NVARCHAR(255),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);

-- Tabla de Marcas
CREATE TABLE Marcas (
    MarcaID INT IDENTITY(1,1) PRIMARY KEY,
    NombreMarca NVARCHAR(50) NOT NULL UNIQUE,
    Descripcion NVARCHAR(255),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);

-- Tabla de Ubicaciones/Oficinas
CREATE TABLE Ubicaciones (
    UbicacionID INT IDENTITY(1,1) PRIMARY KEY,
    NombreUbicacion NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(255),
    Piso NVARCHAR(20),
    Edificio NVARCHAR(50),
    Ciudad NVARCHAR(50) DEFAULT 'Guayaquil',
    Provincia NVARCHAR(50) DEFAULT 'Guayas',
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);

-- Tabla de Proveedores
CREATE TABLE Proveedores (
    ProveedorID INT IDENTITY(1,1) PRIMARY KEY,
    NombreProveedor NVARCHAR(100) NOT NULL,
    NombreContacto NVARCHAR(100),
    Email NVARCHAR(100),
    Telefono NVARCHAR(20),
    Direccion NVARCHAR(255),
    RUC NVARCHAR(13), -- RUC para Ecuador
    Ciudad NVARCHAR(50),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);

-- Tabla de Usuarios del Sistema
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    ClaveHash NVARCHAR(255) NOT NULL,
    Nombres NVARCHAR(50) NOT NULL,
    Apellidos NVARCHAR(50) NOT NULL,
    Cedula NVARCHAR(10), -- Cédula ecuatoriana
    Rol NVARCHAR(20) CHECK (Rol IN ('Administrador', 'Gerente', 'Tecnico', 'Empleado')) DEFAULT 'Empleado',
    Departamento NVARCHAR(50),
    UbicacionID INT,
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 DEFAULT GETDATE(),
    UltimoAcceso DATETIME2,
    FOREIGN KEY (UbicacionID) REFERENCES Ubicaciones(UbicacionID)
);

-- Tabla principal de Dispositivos
CREATE TABLE Dispositivos (
    DispositivoID INT IDENTITY(1,1) PRIMARY KEY,
    CodigoDispositivo NVARCHAR(20) NOT NULL UNIQUE, -- Código interno (ej: LAP001, CEL023)
    NombreDispositivo NVARCHAR(100) NOT NULL,
    CategoriaID INT NOT NULL,
    MarcaID INT NOT NULL,
    Modelo NVARCHAR(100) NOT NULL,
    NumeroSerie NVARCHAR(100) UNIQUE,
    NumeroParte NVARCHAR(100),
    
    -- Especificaciones técnicas
    Procesador NVARCHAR(100),
    MemoriaRAM NVARCHAR(20),
    Almacenamiento NVARCHAR(50),
    SistemaOperativo NVARCHAR(50),
    VersionSO NVARCHAR(20),
    
    -- Información comercial
    ProveedorID INT,
    FechaCompra DATE,
    PrecioCompra DECIMAL(10,2),
    VencimientoGarantia DATE,
    NumeroFactura NVARCHAR(50),
    
    -- Estado y ubicación
    Estado NVARCHAR(20) CHECK (Estado IN ('Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido')) DEFAULT 'Disponible',
    Condicion NVARCHAR(20) CHECK (Condicion IN ('Excelente', 'Bueno', 'Regular', 'Malo')) DEFAULT 'Bueno',
    UbicacionID INT,
    
    -- Metadatos
    Observaciones NVARCHAR(MAX),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 DEFAULT GETDATE(),
    CreadoPor INT,
    
    FOREIGN KEY (CategoriaID) REFERENCES Categorias(CategoriaID),
    FOREIGN KEY (MarcaID) REFERENCES Marcas(MarcaID),
    FOREIGN KEY (ProveedorID) REFERENCES Proveedores(ProveedorID),
    FOREIGN KEY (UbicacionID) REFERENCES Ubicaciones(UbicacionID),
    FOREIGN KEY (CreadoPor) REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Asignaciones de Dispositivos
CREATE TABLE Asignaciones (
    AsignacionID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    UsuarioID INT NOT NULL, -- Usuario asignado
    AsignadoPor INT NOT NULL, -- Usuario que hizo la asignación
    FechaAsignacion DATETIME2 DEFAULT GETDATE(),
    FechaDevolucionEsperada DATE,
    FechaDevolucionReal DATETIME2,
    Estado NVARCHAR(20) CHECK (Estado IN ('Activo', 'Devuelto', 'Vencido')) DEFAULT 'Activo',
    Proposito NVARCHAR(255), -- Propósito de la asignación
    Observaciones NVARCHAR(MAX),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (AsignadoPor) REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Mantenimientos
CREATE TABLE Mantenimientos (
    MantenimientoID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    TipoMantenimiento NVARCHAR(20) CHECK (TipoMantenimiento IN ('Preventivo', 'Correctivo', 'Emergencia')) NOT NULL,
    Descripcion NVARCHAR(MAX) NOT NULL,
    FechaInicio DATETIME2 DEFAULT GETDATE(),
    FechaFin DATETIME2,
    Costo DECIMAL(10,2),
    TecnicoID INT,
    ProveedorExterno NVARCHAR(100), -- Si es mantenimiento externo
    Estado NVARCHAR(20) CHECK (Estado IN ('Programado', 'En Proceso', 'Completado', 'Cancelado')) DEFAULT 'Programado',
    Observaciones NVARCHAR(MAX),
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    FOREIGN KEY (TecnicoID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Historial de Movimientos
CREATE TABLE HistorialDispositivos (
    HistorialID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    Accion NVARCHAR(50) NOT NULL, -- 'Creado', 'Actualizado', 'Asignado', 'Devuelto', 'Reparado', etc.
    ValorAnterior NVARCHAR(MAX), -- JSON con valores anteriores
    ValorNuevo NVARCHAR(MAX), -- JSON con valores nuevos
    RealizadoPor INT NOT NULL,
    FechaAccion DATETIME2 DEFAULT GETDATE(),
    Comentarios NVARCHAR(MAX),
    
    FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    FOREIGN KEY (RealizadoPor) REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Archivos adjuntos (facturas, manuales, fotos, etc.)
CREATE TABLE ArchivosDispositivos (
    ArchivoID INT IDENTITY(1,1) PRIMARY KEY,
    DispositivoID INT NOT NULL,
    NombreArchivo NVARCHAR(255) NOT NULL,
    TipoArchivo NVARCHAR(10), -- 'pdf', 'jpg', 'png', 'doc', etc.
    RutaArchivo NVARCHAR(500) NOT NULL,
    TamanoArchivo BIGINT,
    TipoAdjunto NVARCHAR(20) CHECK (TipoAdjunto IN ('Factura', 'Manual', 'Foto', 'Garantia', 'Otro')) DEFAULT 'Otro',
    SubidoPor INT NOT NULL,
    FechaSubida DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (DispositivoID) REFERENCES Dispositivos(DispositivoID),
    FOREIGN KEY (SubidoPor) REFERENCES Usuarios(UsuarioID)
);

-- Índices para mejorar rendimiento
CREATE INDEX IX_Dispositivos_Estado ON Dispositivos(Estado);
CREATE INDEX IX_Dispositivos_Categoria ON Dispositivos(CategoriaID);
CREATE INDEX IX_Dispositivos_Marca ON Dispositivos(MarcaID);
CREATE INDEX IX_Dispositivos_Ubicacion ON Dispositivos(UbicacionID);
CREATE INDEX IX_Asignaciones_Usuario ON Asignaciones(UsuarioID);
CREATE INDEX IX_Asignaciones_Estado ON Asignaciones(Estado);
CREATE INDEX IX_HistorialDispositivos_Dispositivo ON HistorialDispositivos(DispositivoID);

-- Triggers para actualizar FechaActualizacion automáticamente
CREATE TRIGGER TR_Usuarios_FechaActualizacion ON Usuarios
    AFTER UPDATE
AS
BEGIN
    UPDATE Usuarios 
    SET FechaActualizacion = GETDATE()
    FROM Usuarios u
    INNER JOIN inserted i ON u.UsuarioID = i.UsuarioID;
END;
GO

CREATE TRIGGER TR_Dispositivos_FechaActualizacion ON Dispositivos
    AFTER UPDATE
AS
BEGIN
    UPDATE Dispositivos 
    SET FechaActualizacion = GETDATE()
    FROM Dispositivos d
    INNER JOIN inserted i ON d.DispositivoID = i.DispositivoID;
END;
GO

-- Trigger para registrar cambios en el historial
CREATE TRIGGER TR_Dispositivos_Historial ON Dispositivos
    AFTER UPDATE
AS
BEGIN
    INSERT INTO HistorialDispositivos (DispositivoID, Accion, ValorAnterior, ValorNuevo, RealizadoPor)
    SELECT 
        i.DispositivoID,
        'Actualizado',
        (SELECT * FROM deleted d WHERE d.DispositivoID = i.DispositivoID FOR JSON AUTO),
        (SELECT * FROM inserted ins WHERE ins.DispositivoID = i.DispositivoID FOR JSON AUTO),
        i.CreadoPor -- Aquí deberías usar el ID del usuario actual
    FROM inserted i;
END;
GO

-- DATOS INICIALES
-- Insertar categorías básicas
INSERT INTO Categorias (NombreCategoria, Descripcion) VALUES 
('Laptop', 'Computadoras portátiles'),
('Escritorio', 'Computadoras de escritorio'),
('Celular', 'Teléfonos celulares inteligentes'),
('Tablet', 'Tabletas digitales'),
('Monitor', 'Monitores y pantallas'),
('Impresora', 'Impresoras y multifuncionales'),
('Proyector', 'Proyectores y equipos de presentación'),
('Red', 'Equipos de red y comunicación'),
('Accesorios', 'Accesorios diversos');

-- Insertar marcas comunes
INSERT INTO Marcas (NombreMarca, Descripcion) VALUES 
('Dell', 'Dell Technologies'),
('HP', 'Hewlett-Packard'),
('Lenovo', 'Lenovo Group'),
('Apple', 'Apple Inc.'),
('Samsung', 'Samsung Electronics'),
('Microsoft', 'Microsoft Corporation'),
('Asus', 'ASUSTeK Computer'),
('Acer', 'Acer Inc.'),
('Canon', 'Canon Inc.'),
('Epson', 'Seiko Epson Corporation'),
('Cisco', 'Cisco Systems'),
('Huawei', 'Huawei Technologies'),
('Xiaomi', 'Xiaomi Corporation');

-- Insertar ubicaciones de ejemplo para Ecuador
INSERT INTO Ubicaciones (NombreUbicacion, Direccion, Piso, Edificio, Ciudad, Provincia) VALUES 
('Oficina Principal', 'Av. 9 de Octubre 1234', 'Piso 5', 'Torre Empresarial', 'Guayaquil', 'Guayas'),
('Sucursal Norte', 'Av. Francisco de Orellana', 'Piso 2', 'Centro Comercial', 'Guayaquil', 'Guayas'),
('Sucursal Quito', 'Av. Amazonas 2567', 'Piso 8', 'World Trade Center', 'Quito', 'Pichincha'),
('Bodega Central', 'Vía Daule Km 8', 'Planta Baja', 'Bodega Industrial', 'Guayaquil', 'Guayas'),
('Trabajo Remoto', 'Ubicación Remota', '', '', 'Variable', 'Variable'),
('Servicio Técnico', 'Taller de Reparaciones', '', '', 'Guayaquil', 'Guayas');

-- Insertar proveedores locales ejemplo
INSERT INTO Proveedores (NombreProveedor, NombreContacto, Email, Telefono, RUC, Ciudad) VALUES 
('TecnoImport Guayaquil', 'Carlos Mendoza', 'ventas@tecnoimport.com.ec', '04-2345678', '0992123456001', 'Guayaquil'),
('Computec Ecuador', 'María Rodríguez', 'info@computec.ec', '02-3456789', '1792345678001', 'Quito'),
('Suministros IT Ltda.', 'Juan Pérez', 'contacto@suministrosit.com', '04-5678901', '0991234567001', 'Guayaquil');

-- Insertar usuario administrador inicial
INSERT INTO Usuarios (NombreUsuario, Email, ClaveHash, Nombres, Apellidos, Cedula, Rol, Departamento, UbicacionID) VALUES 
('admin', 'admin@empresa.com.ec', '$2b$10$ejemplo_hash_password', 'Administrador', 'del Sistema', '0987654321', 'Administrador', 'Sistemas', 1);

UPDATE Usuarios SET ClaveHash = '$2b$12$nAprsDJ.Ug5RS6cRdubwU.Bs4BdyZLTNDMAvJRu.F05VLWnTyBF2W' WHERE NombreUsuario = 'admin';


DELETE FROM Usuarios WHERE NombreUsuario = 'admin';
-- VISTAS ÚTILES PARA CONSULTAS

-- Vista de dispositivos con información completa
CREATE VIEW VW_DispositivosCompleto AS
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
    u.NombreUbicacion,
    d.FechaCompra,
    d.VencimientoGarantia,
    CASE 
        WHEN d.VencimientoGarantia < GETDATE() THEN 'Vencida'
        WHEN d.VencimientoGarantia < DATEADD(month, 3, GETDATE()) THEN 'Por Vencer'
        ELSE 'Vigente'
    END as EstadoGarantia,
    d.FechaCreacion,
    CONCAT(usr.Nombres, ' ', usr.Apellidos) as CreadoPorUsuario
FROM Dispositivos d
LEFT JOIN Categorias c ON d.CategoriaID = c.CategoriaID
LEFT JOIN Marcas m ON d.MarcaID = m.MarcaID
LEFT JOIN Ubicaciones u ON d.UbicacionID = u.UbicacionID
LEFT JOIN Usuarios usr ON d.CreadoPor = usr.UsuarioID;
GO

-- Vista de asignaciones activas
CREATE VIEW VW_AsignacionesActivas AS
SELECT 
    a.AsignacionID,
    d.CodigoDispositivo,
    d.NombreDispositivo,
    CONCAT(u.Nombres, ' ', u.Apellidos) as AsignadoAUsuario,
    u.Departamento,
    a.FechaAsignacion,
    a.FechaDevolucionEsperada,
    CASE 
        WHEN a.FechaDevolucionEsperada < GETDATE() THEN 'Vencido'
        WHEN a.FechaDevolucionEsperada < DATEADD(day, 7, GETDATE()) THEN 'Por Vencer'
        ELSE 'A Tiempo'
    END as EstadoDevolucion,
    CONCAT(asignado_por.Nombres, ' ', asignado_por.Apellidos) as AsignadoPorUsuario
FROM Asignaciones a
INNER JOIN Dispositivos d ON a.DispositivoID = d.DispositivoID
INNER JOIN Usuarios u ON a.UsuarioID = u.UsuarioID
INNER JOIN Usuarios asignado_por ON a.AsignadoPor = asignado_por.UsuarioID
WHERE a.Estado = 'Activo';
GO

-- Procedimientos almacenados útiles

-- SP para asignar un dispositivo
CREATE PROCEDURE SP_AsignarDispositivo
    @DispositivoID INT,
    @UsuarioID INT,
    @AsignadoPor INT,
    @FechaDevolucionEsperada DATE = NULL,
    @Proposito NVARCHAR(255) = NULL,
    @Observaciones NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar que el dispositivo esté disponible
        IF NOT EXISTS (SELECT 1 FROM Dispositivos WHERE DispositivoID = @DispositivoID AND Estado = 'Disponible')
        BEGIN
            THROW 50001, 'El dispositivo no está disponible para asignación', 1;
        END
        
        -- Crear la asignación
        INSERT INTO Asignaciones (DispositivoID, UsuarioID, AsignadoPor, FechaDevolucionEsperada, Proposito, Observaciones)
        VALUES (@DispositivoID, @UsuarioID, @AsignadoPor, @FechaDevolucionEsperada, @Proposito, @Observaciones);
        
        -- Actualizar estado del dispositivo
        UPDATE Dispositivos 
        SET Estado = 'Asignado', FechaActualizacion = GETDATE()
        WHERE DispositivoID = @DispositivoID;
        
        -- Registrar en historial
        INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
        VALUES (@DispositivoID, 'Asignado', @AsignadoPor, 'Dispositivo asignado al usuario ID: ' + CAST(@UsuarioID AS NVARCHAR(10)));
        
        COMMIT TRANSACTION;
        
        SELECT 'EXITO' as Resultado, 'Dispositivo asignado exitosamente' as Mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- SP para devolver un dispositivo
CREATE PROCEDURE SP_DevolverDispositivo
    @AsignacionID INT,
    @DevueltoPor INT,
    @Observaciones NVARCHAR(MAX) = NULL,
    @CondicionDispositivo NVARCHAR(20) = 'Bueno'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @DispositivoID INT;
        
        -- Obtener el DispositivoID y verificar que la asignación esté activa
        SELECT @DispositivoID = DispositivoID 
        FROM Asignaciones 
        WHERE AsignacionID = @AsignacionID AND Estado = 'Activo';
        
        IF @DispositivoID IS NULL
        BEGIN
            THROW 50002, 'Asignación no encontrada o ya finalizada', 1;
        END
        
        -- Actualizar la asignación
        UPDATE Asignaciones 
        SET FechaDevolucionReal = GETDATE(), 
            Estado = 'Devuelto',
            Observaciones = ISNULL(Observaciones, '') + CHAR(13) + CHAR(10) + 'Observaciones de devolución: ' + ISNULL(@Observaciones, '')
        WHERE AsignacionID = @AsignacionID;
        
        -- Actualizar el dispositivo
        UPDATE Dispositivos 
        SET Estado = 'Disponible', 
            Condicion = @CondicionDispositivo,
            FechaActualizacion = GETDATE()
        WHERE DispositivoID = @DispositivoID;
        
        -- Registrar en historial
        INSERT INTO HistorialDispositivos (DispositivoID, Accion, RealizadoPor, Comentarios)
        VALUES (@DispositivoID, 'Devuelto', @DevueltoPor, 'Dispositivo devuelto. ID Asignación: ' + CAST(@AsignacionID AS NVARCHAR(10)));
        
        COMMIT TRANSACTION;
        
        SELECT 'EXITO' as Resultado, 'Dispositivo devuelto exitosamente' as Mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Función para generar el siguiente código de dispositivo
CREATE FUNCTION FN_GenerarCodigoDispositivo(@CategoriaID INT)
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @Prefijo NVARCHAR(3);
    DECLARE @SiguienteNumero INT;
    DECLARE @CodigoDispositivo NVARCHAR(20);
    
    -- Obtener prefijo basado en categoría
    SELECT @Prefijo = CASE NombreCategoria
        WHEN 'Laptop' THEN 'LAP'
        WHEN 'Escritorio' THEN 'ESC'
        WHEN 'Celular' THEN 'CEL'
        WHEN 'Tablet' THEN 'TAB'
        WHEN 'Monitor' THEN 'MON'
        WHEN 'Impresora' THEN 'IMP'
        WHEN 'Proyector' THEN 'PRY'
        WHEN 'Red' THEN 'RED'
        ELSE 'DIS'
    END
    FROM Categorias WHERE CategoriaID = @CategoriaID;
    
    -- Obtener el siguiente número
    SELECT @SiguienteNumero = ISNULL(MAX(CAST(SUBSTRING(CodigoDispositivo, 4, 10) AS INT)), 0) + 1
    FROM Dispositivos 
    WHERE LEFT(CodigoDispositivo, 3) = @Prefijo;
    
    -- Generar código con formato LAP001, ESC002, etc.
    SET @CodigoDispositivo = @Prefijo + RIGHT('000' + CAST(@SiguienteNumero AS NVARCHAR(10)), 3);
    
    RETURN @CodigoDispositivo;
END;
GO

-- Vista de resumen para dashboard
CREATE VIEW VW_ResumenInventario AS
SELECT 
    (SELECT COUNT(*) FROM Dispositivos WHERE Estado = 'Disponible') as DisponiblesTotal,
    (SELECT COUNT(*) FROM Dispositivos WHERE Estado = 'Asignado') as AsignadosTotal,
    (SELECT COUNT(*) FROM Dispositivos WHERE Estado = 'En Reparacion') as EnReparacionTotal,
    (SELECT COUNT(*) FROM Asignaciones WHERE Estado = 'Activo' AND FechaDevolucionEsperada < GETDATE()) as VencidosTotal,
    (SELECT COUNT(*) FROM Dispositivos WHERE VencimientoGarantia < DATEADD(month, 3, GETDATE()) AND VencimientoGarantia > GETDATE()) as GarantiaPorVencerTotal,
    (SELECT COUNT(*) FROM Dispositivos WHERE VencimientoGarantia < GETDATE()) as GarantiaVencidaTotal;
GO