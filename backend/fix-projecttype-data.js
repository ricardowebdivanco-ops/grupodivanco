// Script para arreglar los datos de projectType que quedaron mal formateados
import sequelize from './src/data/config/sequelize.js';

async function fixProjectTypeData() {
  try {
    console.log('🔄 Arreglando datos de projectType...');
    
    // Verificar estado actual
    const [before] = await sequelize.query(`
      SELECT id, title, "projectType" 
      FROM "Projects";
    `);
    
    console.log('\n📊 Estado ANTES:');
    before.forEach(row => {
      console.log(`  - ${row.title}: ${JSON.stringify(row.projectType)} (tipo: ${typeof row.projectType})`);
    });

    // Arreglar datos mal formateados
    console.log('\n🔧 Arreglando formato...');
    await sequelize.query(`
      UPDATE "Projects" 
      SET "projectType" = 
        CASE 
          -- Si el valor está como '{Diseño}', convertir a ['Diseño']
          WHEN "projectType"::text LIKE '{%}' 
          THEN ARRAY[REPLACE(REPLACE("projectType"::text, '{', ''), '}', '')]::TEXT[]
          -- Si ya está bien, dejarlo como está
          ELSE "projectType"
        END;
    `);

    // Verificar resultado
    const [after] = await sequelize.query(`
      SELECT id, title, "projectType" 
      FROM "Projects";
    `);
    
    console.log('\n📊 Estado DESPUÉS:');
    after.forEach(row => {
      console.log(`  - ${row.title}: ${JSON.stringify(row.projectType)}`);
    });

    console.log('\n✅ Datos arreglados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProjectTypeData();
