const database = require('../config/database');

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT CategoriaID, NombreCategoria, Descripcion, 
                   (SELECT COUNT(*) FROM Dispositivos WHERE CategoriaID = c.CategoriaID) as TotalDispositivos
            FROM Categorias c
            WHERE Activo = 1
            ORDER BY NombreCategoria
        `);

        res.json({
            categorias: resultado.recordset
        });
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo las categorías'
        });
    }
};

// Obtener todas las marcas
const obtenerMarcas = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT MarcaID, NombreMarca, Descripcion,
                   (SELECT COUNT(*) FROM Dispositivos WHERE MarcaID = m.MarcaID) as TotalDispositivos
            FROM Marcas m
            WHERE Activo = 1
            ORDER BY NombreMarca
        `);

        res.json({
            marcas: resultado.recordset
        });
    } catch (error) {
        console.error('Error obteniendo marcas:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo las marcas'
        });
    }
};

// Obtener todas las ubicaciones
const obtenerUbicaciones = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT UbicacionID, NombreUbicacion, Direccion, Piso, Edificio, Ciudad, Provincia,
                   (SELECT COUNT(*) FROM Dispositivos WHERE UbicacionID = u.UbicacionID) as TotalDispositivos
            FROM Ubicaciones u
            WHERE Activo = 1
            ORDER BY NombreUbicacion
        `);

        res.json({
            ubicaciones: resultado.recordset
        });
    } catch (error) {
        console.error('Error obteniendo ubicaciones:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo las ubicaciones'
        });
    }
};

// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const resultado = await database.query(`
            SELECT ProveedorID, NombreProveedor, NombreContacto, Email, Telefono, RUC, Ciudad,
                   (SELECT COUNT(*) FROM Dispositivos WHERE ProveedorID = p.ProveedorID) as TotalDispositivos
            FROM Proveedores p
            WHERE Activo = 1
            ORDER BY NombreProveedor
        `);

        res.json({
            proveedores: resultado.recordset
        });
    } catch (error) {
        console.error('Error obteniendo proveedores:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error obteniendo los proveedores'
        });
    }
};

// Crear nueva categoría
const crearCategoria = async (req, res) => {
    try {
        const { nombreCategoria, descripcion } = req.body;

        const resultado = await database.query(`
            INSERT INTO Categorias (NombreCategoria, Descripcion)
            OUTPUT INSERTED.CategoriaID, INSERTED.NombreCategoria
            VALUES (@param0, @param1)
        `, [nombreCategoria, descripcion]);

        res.status(201).json({
            mensaje: 'Categoría creada exitosamente',
            categoria: resultado.recordset[0]
        });
    } catch (error) {
        if (error.number === 2627) { // Violación de unique constraint
            return res.status(400).json({
                error: 'Categoría duplicada',
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        console.error('Error creando categoría:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando la categoría'
        });
    }
};

// Crear nueva marca
const crearMarca = async (req, res) => {
    try {
        const { nombreMarca, descripcion } = req.body;

        const resultado = await database.query(`
            INSERT INTO Marcas (NombreMarca, Descripcion)
            OUTPUT INSERTED.MarcaID, INSERTED.NombreMarca
            VALUES (@param0, @param1)
        `, [nombreMarca, descripcion]);

        res.status(201).json({
            mensaje: 'Marca creada exitosamente',
            marca: resultado.recordset[0]
        });
    } catch (error) {
        if (error.number === 2627) {
            return res.status(400).json({
                error: 'Marca duplicada',
                message: 'Ya existe una marca con ese nombre'
            });
        }
        
        console.error('Error creando marca:', error);
        res.status(500).json({
            error: 'Error interno',
            message: 'Error creando la marca'
        });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerMarcas,
    obtenerUbicaciones,
    obtenerProveedores,
    crearCategoria,
    crearMarca
};