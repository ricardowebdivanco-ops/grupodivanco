import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a la base de datos
const sequelize = new Sequelize(process.env.DB_DEPLOY, {
  dialect: 'postgres',
  logging: console.log
});

async function runMigration() {
  console.log('🚀 Iniciando migración: projectType ENUM → ARRAY\n');
  
  const transaction = await sequelize.transaction();
  
  try {
    console.log('1️⃣ Verificando tipo actual de projectType...');
    
    // Verificar si la columna es ENUM
    const [columnInfo] = await sequelize.query(`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Projects' 
      AND column_name = 'projectType';
    `, { transaction });
    
    console.log('   Tipo actual:', columnInfo[0]);
    
    if (columnInfo[0]?.data_type === 'ARRAY') {
      console.log('✅ La columna ya es ARRAY. No se requiere migración.');
      await transaction.rollback();
      return;
    }
    
    console.log('\n2️⃣ Creando columna temporal...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      ADD COLUMN "projectType_temp" TEXT[];
    `, { transaction });
    console.log('   ✅ Columna temporal creada');
    
    console.log('\n3️⃣ Copiando datos existentes...');
    await sequelize.query(`
      UPDATE "Projects" 
      SET "projectType_temp" = ARRAY["projectType"::text]
      WHERE "projectType" IS NOT NULL;
    `, { transaction });
    console.log('   ✅ Datos copiados');
    
    console.log('\n4️⃣ Eliminando columna original...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      DROP COLUMN "projectType" CASCADE;
    `, { transaction });
    console.log('   ✅ Columna original eliminada');
    
    console.log('\n5️⃣ Renombrando columna temporal...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      RENAME COLUMN "projectType_temp" TO "projectType";
    `, { transaction });
    console.log('   ✅ Columna renombrada');
    
    console.log('\n6️⃣ Configurando NOT NULL y valor por defecto...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      ALTER COLUMN "projectType" SET NOT NULL,
      ALTER COLUMN "projectType" SET DEFAULT ARRAY['Proyecto']::TEXT[];
    `, { transaction });
    console.log('   ✅ Constraints configurados');
    
    console.log('\n7️⃣ Eliminando tipo ENUM obsoleto...');
    try {
      await sequelize.query(`
        DROP TYPE IF EXISTS "enum_Projects_projectType" CASCADE;
      `, { transaction });
      console.log('   ✅ Tipo ENUM eliminado');
    } catch (error) {
      console.log('   ⚠️  No se pudo eliminar el ENUM (puede que no exista)');
    }
    
    console.log('\n8️⃣ Verificando resultado final...');
    const [finalColumnInfo] = await sequelize.query(`
      SELECT data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Projects' 
      AND column_name = 'projectType';
    `, { transaction });
    console.log('   Información final:', finalColumnInfo[0]);
    
    await transaction.commit();
    
    console.log('\n✅ ¡Migración completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - Tipo anterior: ENUM');
    console.log('   - Tipo nuevo: ARRAY (TEXT[])');
    console.log('   - Permite múltiples selecciones: ✅');
    console.log('   - Valor por defecto: ["Proyecto"]');
    
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Error durante la migración:');
    console.error('   Mensaje:', error.message);
    console.error('   Detalle:', error.original?.message || error.detail);
    console.error('\n💡 Stack trace completo:');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración
runMigration()
  .then(() => {
    console.log('✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
