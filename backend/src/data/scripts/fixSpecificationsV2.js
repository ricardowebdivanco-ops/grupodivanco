// Script para migrar especificaciones agrupadas por comas a objeto clave:valor
// Ejecuta este script con: node src/data/scripts/fixSpecificationsV2.js

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://divancoadmin:Dv1nc0_2024$Azur3@divanco-db-server.postgres.database.azure.com:5432/divancodb?sslmode=require',
});

async function migrateSpecifications() {
  // Selecciona productos con specifications que tienen una sola clave y valor, y contienen comas
  const res = await pool.query('SELECT id, specifications FROM "Products" WHERE specifications IS NOT NULL');
  let updated = 0;

  for (const row of res.rows) {
    const spec = row.specifications;
    if (spec && typeof spec === 'object' && Object.keys(spec).length === 1) {
      const key = Object.keys(spec)[0];
      const value = spec[key];
      // Detecta si hay comas en la clave y el valor
      if (key.includes(',') && value.includes(',')) {
        // Separa claves y valores por coma y crea objeto
        const keys = key.split(',').map(k => k.trim());
        const values = value.split(',').map(v => v.trim());
        // Empareja claves y valores
        const newSpec = {};
        for (let i = 0; i < keys.length; i++) {
          newSpec[keys[i]] = values[i] || '';
        }
        // Actualiza en la base de datos
        await pool.query('UPDATE "Products" SET specifications = $1 WHERE id = $2', [newSpec, row.id]);
        updated++;
        console.log(`Producto ${row.id} actualizado:`, newSpec);
      }
    }
  }
  console.log(`Total productos actualizados: ${updated}`);
  await pool.end();
}

// Ejecutar la función principal
migrateSpecifications().catch(err => {
  console.error('Error en la migración:', err);
  pool.end();
});
