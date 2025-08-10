const bcrypt = require('bcryptjs');

async function generarHash() {
    // Cambia aquí la contraseña que quieras
    const password = 'admin123';
    
    try {
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        
        console.log('🔐 Generador de Hash de Contraseña');
        console.log('=====================================');
        console.log(`Contraseña: ${password}`);
        console.log(`Hash: ${hash}`);
        console.log('');
        console.log('📋 SQL para insertar en la BD:');
        console.log(`UPDATE Usuarios SET ClaveHash = '${hash}' WHERE NombreUsuario = 'admin';`);
        console.log('');
        console.log('O para crear nuevo usuario:');
        console.log(`INSERT INTO Usuarios (NombreUsuario, Email, ClaveHash, Nombres, Apellidos, Cedula, Rol, Departamento, UbicacionID, Activo)`);
        console.log(`VALUES ('admin', 'admin@empresa.com.ec', '${hash}', 'Administrador', 'del Sistema', '0987654321', 'Administrador', 'Sistemas', 1, 1);`);
        
    } catch (error) {
        console.error('Error generando hash:', error);
    }
}

// Ejecutar
generarHash();