// server.js - Servidor principal con inicialización POS
require('dotenv').config();
const app = require('./src/app');
const database = require('./src/config/database');
const inicializadorPOS = require('./src/utils/initPOS');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // 1. Conectar a la base de datos
        console.log('📊 Conectando a la base de datos...');
        await database.connect();
        console.log('✅ Conexión a base de datos establecida');

        // 2. Verificar estado del sistema POS
        console.log('🔍 Verificando estado del sistema POS...');
        const estadoPOS = await inicializadorPOS.verificarEstado();
        
        if (!estadoPOS.configurado) {
            console.log('⚙️  Sistema POS no configurado, iniciando configuración automática...');
            
            // 3. Inicializar sistema POS
            const resultadoInit = await inicializadorPOS.inicializar();
            
            if (resultadoInit.success) {
                console.log('✅ Sistema POS configurado exitosamente');
            } else {
                console.warn('⚠️  Error configurando sistema POS:', resultadoInit.error);
                console.log('📋 El sistema continuará funcionando, pero algunas funciones POS pueden no estar disponibles');
            }
        } else {
            console.log('✅ Sistema POS ya está configurado');
        }

        // 4. Iniciar servidor HTTP
        const server = app.listen(PORT, () => {
            console.log('\n🎉 ===== SERVIDOR INICIADO EXITOSAMENTE =====');
            console.log(`🌐 Servidor ejecutándose en: http://localhost:${PORT}`);
            console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
            console.log(`🧪 Endpoint de prueba: http://localhost:${PORT}/api/test`);
            console.log(`❤️  Estado del sistema: http://localhost:${PORT}/api/health`);
            console.log('\n📋 Módulos disponibles:');
            console.log('   • Sistema de Inventario ✅');
            console.log('   • Sistema POS ✅');
            console.log('   • Gestión de Clientes ✅');
            console.log('   • Facturación y Ventas ✅');
            console.log('   • Autenticación y Usuarios ✅');
            console.log('\n🔧 Variables de entorno requeridas:');
            console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'No configurado'}`);
            console.log(`   • DB_SERVER: ${process.env.DB_SERVER ? '✅' : '❌'}`);
            console.log(`   • DB_DATABASE: ${process.env.DB_DATABASE ? '✅' : '❌'}`);
            console.log(`   • JWT_SECRET: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
            console.log('\n============================================\n');
        });

        // 5. Configurar manejo de cierre graceful
        const cerrarServidor = async (signal) => {
            console.log(`\n📡 Señal ${signal} recibida, cerrando servidor...`);
            
            server.close(async () => {
                console.log('🔌 Servidor HTTP cerrado');
                
                try {
                    await database.close();
                    console.log('💾 Conexión a base de datos cerrada');
                } catch (error) {
                    console.error('❌ Error cerrando base de datos:', error);
                }
                
                console.log('👋 Servidor cerrado exitosamente');
                process.exit(0);
            });

            // Forzar cierre después de 10 segundos
            setTimeout(() => {
                console.error('⚠️  Forzando cierre del servidor...');
                process.exit(1);
            }, 10000);
        };

        // Manejar señales de cierre
        process.on('SIGTERM', () => cerrarServidor('SIGTERM'));
        process.on('SIGINT', () => cerrarServidor('SIGINT'));

        // Manejar errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('💥 Error no capturado:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Promesa rechazada no manejada:', reason);
            console.error('En:', promise);
            process.exit(1);
        });

        return server;

    } catch (error) {
        console.error('❌ Error crítico iniciando servidor:', error);
        
        // Mostrar información de ayuda
        console.log('\n🆘 AYUDA PARA SOLUCIONAR PROBLEMAS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (error.message.includes('connect') || error.message.includes('database')) {
            console.log('📊 PROBLEMA DE BASE DE DATOS:');
            console.log('   1. Verificar que SQL Server esté ejecutándose');
            console.log('   2. Comprobar variables de entorno:');
            console.log('      • DB_SERVER');
            console.log('      • DB_DATABASE');
            console.log('      • DB_USER');
            console.log('      • DB_PASSWORD');
            console.log('   3. Verificar conectividad de red al servidor');
        }
        
        if (error.message.includes('port') || error.code === 'EADDRINUSE') {
            console.log('🌐 PROBLEMA DE PUERTO:');
            console.log(`   • El puerto ${PORT} ya está en uso`);
            console.log('   • Cambiar variable PORT en .env');
            console.log('   • O cerrar la aplicación que use el puerto');
        }
        
        console.log('\n📝 Archivo .env de ejemplo:');
        console.log('   NODE_ENV=development');
        console.log('   PORT=3000');
        console.log('   DB_SERVER=localhost');
        console.log('   DB_DATABASE=SistemaInventarioTec');
        console.log('   DB_USER=tu_usuario');
        console.log('   DB_PASSWORD=tu_password');
        console.log('   JWT_SECRET=tu_clave_secreta_muy_larga');
        console.log('   JWT_EXPIRES_IN=24h');
        console.log('   MAX_FILE_SIZE=5242880');
        console.log('   FRONTEND_URL=http://localhost:4200');
        
        process.exit(1);
    }
}

// Verificar variables de entorno críticas
function verificarVariablesEntorno() {
    const variablesRequeridas = [
        'DB_SERVER',
        'DB_DATABASE', 
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET'
    ];

    const variablesFaltantes = variablesRequeridas.filter(variable => !process.env[variable]);

    if (variablesFaltantes.length > 0) {
        console.error('❌ Variables de entorno faltantes:');
        variablesFaltantes.forEach(variable => {
            console.error(`   • ${variable}`);
        });
        console.error('\n📝 Crear archivo .env con las variables requeridas');
        process.exit(1);
    }
}

// Verificar variables antes de iniciar
verificarVariablesEntorno();

// Iniciar servidor
iniciarServidor().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});

// Exportar para testing
module.exports = { iniciarServidor };