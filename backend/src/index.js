
import sequelize from './data/config/sequelize.js';  // ✅ Agregada extensión .js
import { syncAllModels } from './data/models/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3001;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production' || !!process.env.DB_DEPLOY;

// IMPORTANTE: Cambiar a false después del primer despliegue
// para preservar los datos en futuras actualizaciones
const FORCE_RESET = false;

// Función para inicializar la aplicación
async function initializeApp() {
  try {
    
    
    // Sincronizar modelos en orden correcto
    console.log(`⚠️ Entorno detectado: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    
    if (FORCE_RESET) {
      console.log('⚠️ MODO RESET: Borrando todas las tablas (FORCE: true)');
      await syncAllModels(true); // force: true - borra todo
    } else {
      console.log('🔄 MODO NORMAL: Actualizando estructura sin borrar datos (ALTER: true)');
      await syncAllModels(false); // force: false, usará alter: true en desarrollo
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 Entorno: ${env}`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error.message);
    process.exit(1);
  }
}

// Inicializar la aplicación
initializeApp();