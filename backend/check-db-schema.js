import { BlogPost } from './src/data/models/index.js';
import sequelize from './src/data/config/sequelize.js';

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos exitosa');

    const tableInfo = await sequelize.getQueryInterface().describeTable('BlogPosts');
    console.log('📊 Estructura de la tabla BlogPosts:');
    console.log(JSON.stringify(tableInfo, null, 2));

    if (tableInfo.featuredImage) {
      console.log('✅ Columna featuredImage existe. Tipo:', tableInfo.featuredImage.type);
    } else {
      console.error('❌ Columna featuredImage NO existe en la tabla BlogPosts');
    }

  } catch (error) {
    console.error('❌ Error verificando esquema:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
