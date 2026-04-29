import sequelize from '../config/sequelize.js';

// Importar todos los modelos
import User from './User.js';
import Category from './Category.js';
import Subcategory from './Subcategory.js';
import Product from './Product.js'; // ← Nuevo import
import Project from './Project.js';
import BlogPost from './BlogPost.js';
import Subscriber from './Subscriber.js';
import MediaFile from './MediaFile.js';
import SiteSetting from './SiteSetting.js';

// Importar y ejecutar asociaciones
import { defineAssociations } from './associations.js';

// Definir las asociaciones
defineAssociations();

// Exportar todo
export {
  sequelize,
  User,
  Category,
  Subcategory,
  Product, // ← Nueva exportación
  Project,
  BlogPost,
  Subscriber,
  MediaFile,
  SiteSetting
};

// Función para sincronizar todos los modelos
export async function syncAllModels(force = false) {
  const env = process.env.NODE_ENV || 'development';
  const useAlter = env === 'development' && !force;
  
  try {
    console.log('🔧 Sincronizando modelos con la base de datos...');

    // Función para limpiar ENUMs problemáticos
    async function cleanupEnumTypes() {
      if (useAlter) {
        try {
          console.log('🧹 Limpiando tipos ENUM problemáticos...');

          const enumExistsQuery = `
            SELECT 1 FROM pg_type WHERE typname = 'enum_Projects_tags';
          `;

          const [enumExists] = await sequelize.query(enumExistsQuery);

          if (enumExists && enumExists.length > 0) {
            console.log('🗑️  Eliminando tipo ENUM anterior: enum_Projects_tags');

            await sequelize.query('ALTER TABLE "Projects" DROP COLUMN IF EXISTS "tags" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Projects_tags" CASCADE;');

            console.log('✅ Tipo ENUM eliminado exitosamente');
          }

        } catch (cleanupError) {
          console.log('ℹ️  No se pudo limpiar ENUMs (es normal si no existen):', cleanupError.message);
        }
      }
    }

    await cleanupEnumTypes();

    if (force) {
      console.log('⚠️  MODO FORCE: Recreando todas las tablas (SE PERDERÁN LOS DATOS)');

      console.log('🗑️  Eliminando tablas existentes...');

      // ← Actualizar lista con Products
      const tablesToDrop = ['BlogPosts', 'Products', 'Subcategories', 'Projects', 'Subscribers', 'Categories', 'Users', 'MediaFiles'];

      for (const tableName of tablesToDrop) {
        try {
          await sequelize.queryInterface.dropTable(tableName, { cascade: true });
          console.log(`✅ Tabla ${tableName} eliminada`);
        } catch (dropError) {
          console.log(`ℹ️  Tabla ${tableName} no existía`);
        }
      }
    } else if (useAlter) {
      console.log('🔄 MODO DESARROLLO: Usando ALTER para preservar datos existentes');
    } else {
      console.log('🔄 MODO PRODUCCIÓN: Sincronización segura sin ALTER');
    }

    console.log('🔄 Creando/actualizando tablas en orden...');

    const syncOptions = {
      force: force,
      alter: useAlter
    };

    // 1. Tablas independientes primero
    await User.sync(syncOptions);
    console.log('✅ Tabla Users sincronizada');

    await Category.sync(syncOptions);
    console.log('✅ Tabla Categories sincronizada');

    await Subscriber.sync(syncOptions);
    console.log('✅ Tabla Subscribers sincronizada');

    await Project.sync(syncOptions);
    console.log('✅ Tabla Projects sincronizada');

    // 2. Tablas con dependencias (orden importante)
    await Subcategory.sync(syncOptions);
    console.log('✅ Tabla Subcategories sincronizada');

    // ← Sincronizar Products después de Subcategories
    await Product.sync(syncOptions);
    console.log('✅ Tabla Products sincronizada');

    await BlogPost.sync(syncOptions);
    console.log('✅ Tabla BlogPosts sincronizada');

    await MediaFile.sync(syncOptions);
    console.log('✅ Tabla MediaFiles sincronizada');

    console.log('✅ Todos los modelos sincronizados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
    throw error;
  }
}

export default {
  sequelize,
  User,
  Category,
  Subcategory,
  Product, 
  Project,
  BlogPost,
  Subscriber,
  syncAllModels, 
  MediaFile
};