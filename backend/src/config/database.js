const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true // Para desarrollo local
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            if (this.pool) {
                return this.pool;
            }
            
            this.pool = await sql.connect(config);
            console.log('✅ Conectado a SQL Server');
            return this.pool;
        } catch (error) {
            console.error('❌ Error conectando a la base de datos:', error);
            throw error;
        }
    }

    async query(queryString, params = []) {
        try {
            const pool = await this.connect();
            const request = pool.request();
            
            // Agregar parámetros si los hay
            params.forEach((param, index) => {
                request.input(`param${index}`, param);
            });
            
            const result = await request.query(queryString);
            return result;
        } catch (error) {
            console.error('Error en consulta SQL:', error);
            throw error;
        }
    }

    async execute(procedureName, params = {}) {
        try {
            const pool = await this.connect();
            const request = pool.request();
            
            // Agregar parámetros
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });
            
            const result = await request.execute(procedureName);
            return result;
        } catch (error) {
            console.error('Error ejecutando procedimiento:', error);
            throw error;
        }
    }

    async close() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = null;
                console.log('🔌 Conexión a base de datos cerrada');
            }
        } catch (error) {
            console.error('Error cerrando conexión:', error);
        }
    }
}

// Singleton para la base de datos
const database = new Database();

// Cerrar conexión al terminar la aplicación
process.on('SIGINT', async () => {
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await database.close();
    process.exit(0);
});

module.exports = database;