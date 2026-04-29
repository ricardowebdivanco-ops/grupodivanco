// Script para convertir especificaciones string a objeto clave:valor
// Ejecutar con node backend/src/data/scripts/fixSpecifications.js

import { Product } from '../models/index.js';
import sequelize from '../config/sequelize.js';

// Utilidad para intentar convertir string a objeto
function parseSpecifications(specStr) {
  // Ejemplo: "Tipo De Hidromasaje, Spa, Color, Blanco, Medidas, 200x200cm"
  if (!specStr || typeof specStr !== 'string') return null;
  const parts = specStr.split(',').map(s => s.trim()).filter(Boolean);
  const obj = {};
  for (let i = 0; i < parts.length - 1; i += 2) {
    let key = parts[i];
    let value = parts[i + 1];
    if (key && value) obj[key] = value;
  }
  return Object.keys(obj).length ? obj : null;
}

async function fixSpecifications() {
  await sequelize.authenticate();
  const products = await Product.findAll({
    where: {},
    attributes: ['id', 'specifications'],
  });
  let updated = 0;
  for (const product of products) {
    if (typeof product.specifications === 'string') {
      const parsed = parseSpecifications(product.specifications);
      if (parsed) {
        await product.update({ specifications: parsed });
        updated++;
        console.log(`✔️ Producto ${product.id} actualizado`);
      }
    }
  }
  console.log(`\nTotal productos actualizados: ${updated}`);
  process.exit(0);
}

fixSpecifications().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
