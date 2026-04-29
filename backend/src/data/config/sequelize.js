import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

let sequelize;
if (env === 'production' && (process.env.DATABASE_URL || process.env.DB_DEPLOY)) {
  sequelize = new Sequelize(process.env.DATABASE_URL || process.env.DB_DEPLOY, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Necesario para Render PostgreSQL
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      // ✅ CAMBIO: Habilitar logging detallado en desarrollo
      logging: env === 'development' ? (sql, timing) => {
        
        
        // Solo mostrar advertencias para queries realmente críticas
        if (sql.toLowerCase().includes('delete')) {
          console.warn('⚠️  DELETE ejecutado:', sql);
        }
        if (sql.toLowerCase().includes('update') && sql.toLowerCase().includes('projects')) {
          console.warn('⚠️  UPDATE en Projects detectado:', sql);
        }
        // Puedes comentar la siguiente línea si no quieres ver todos los SQL
        // console.log('SQL:', sql);
      } : false,
    }
  );
}

export async function testConnection() {
  try {
    await sequelize.authenticate();
   
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

export async function syncModels(alter = true) {
  try {
    await sequelize.sync({ alter });
    
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
  }
}

export default sequelize;