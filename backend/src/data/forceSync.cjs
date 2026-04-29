const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configurar conexión a base de datos
const sequelize = process.env.DB_DEPLOY 
  ? new Sequelize(process.env.DB_DEPLOY, {
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'divanco_dev',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log
      }
    );

async function forceSync() {
  try {
    console.log('🔄 FORCE SYNC: Recreando base de datos completamente...');
    console.log('⚠️ ADVERTENCIA: Esto eliminará todos los datos existentes');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Usar force: true para recrear todas las tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada con force: true');
    
    console.log('🧹 No se cargarán datos de ejemplo');
    console.log('👤 No se crearán usuarios predeterminados');
    
    await sequelize.close();
    console.log('✅ Recreación completada - todas las tablas están vacías');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceSync();
