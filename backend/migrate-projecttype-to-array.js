// Script para migrar projectType de ENUM simple a ARRAY(ENUM)
import sequelize from './src/data/config/sequelize.js';

async function migrateProjectType() {
  try {
    console.log('🔄 Iniciando migración de projectType...');
    
    // 1. Agregar nueva columna temporal
    console.log('📝 Paso 1: Creando columna temporal...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      ADD COLUMN IF NOT EXISTS "projectType_temp" TEXT[];
    `);
    console.log('✅ Columna temporal creada');

    // 2. Copiar datos del ENUM simple al array
    console.log('📝 Paso 2: Copiando datos...');
    await sequelize.query(`
      UPDATE "Projects" 
      SET "projectType_temp" = ARRAY["projectType"::TEXT]
      WHERE "projectType" IS NOT NULL;
    `);
    console.log('✅ Datos copiados a columna temporal');

    // 3. Eliminar la columna original
    console.log('📝 Paso 3: Eliminando columna original...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      DROP COLUMN IF EXISTS "projectType";
    `);
    console.log('✅ Columna original eliminada');

    // 4. Eliminar el tipo ENUM si existe
    console.log('📝 Paso 4: Eliminando tipo ENUM antiguo...');
    await sequelize.query(`
      DROP TYPE IF EXISTS "enum_Projects_projectType" CASCADE;
    `);
    console.log('✅ Tipo ENUM eliminado');

    // 5. Renombrar columna temporal
    console.log('📝 Paso 5: Renombrando columna temporal...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      RENAME COLUMN "projectType_temp" TO "projectType";
    `);
    console.log('✅ Columna renombrada');

    // 6. Establecer NOT NULL y default
    console.log('📝 Paso 6: Aplicando constraints...');
    await sequelize.query(`
      ALTER TABLE "Projects" 
      ALTER COLUMN "projectType" SET NOT NULL,
      ALTER COLUMN "projectType" SET DEFAULT ARRAY['Proyecto']::TEXT[];
    `);
    console.log('✅ Constraints aplicados');

    // 7. Verificar resultados
    console.log('📝 Paso 7: Verificando resultados...');
    const [results] = await sequelize.query(`
      SELECT id, title, "projectType" 
      FROM "Projects" 
      LIMIT 10;
    `);
    
    console.log('\n📊 Muestra de datos migrados:');
    if (results.length === 0) {
      console.log('  (No hay proyectos en la base de datos)');
    } else {
      results.forEach(row => {
        console.log(`  - ${row.title}: ${JSON.stringify(row.projectType)}`);
      });
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('🚀 Ahora puedes reiniciar el servidor con: npm start');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    console.error('\n🔍 Detalles del error:', error.message);
    process.exit(1);
  }
}

migrateProjectType();
