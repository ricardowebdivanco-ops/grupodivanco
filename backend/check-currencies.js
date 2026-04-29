/**
 * Script para verificar las monedas de todos los productos
 */

import sequelize from './src/data/config/sequelize.js';
import Product from './src/data/models/Product.js';

async function checkCurrencies() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente\n');

    // Contar productos por moneda
    const currencies = await sequelize.query(
      `SELECT currency, COUNT(*) as count FROM "Products" GROUP BY currency`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 Distribución de monedas:');
    currencies.forEach(c => {
      console.log(`  ${c.currency || 'NULL'}: ${c.count} productos`);
    });

    // Mostrar todos los productos con su moneda
    console.log('\n📋 Lista completa de productos:');
    const allProducts = await Product.findAll({
      attributes: ['id', 'name', 'price', 'currency'],
      order: [['id', 'ASC']]
    });

    if (allProducts.length === 0) {
      console.log('  No hay productos en la base de datos');
    } else {
      allProducts.forEach(p => {
        console.log(`  [${p.id}] ${p.name}`);
        console.log(`       Precio: ${p.price || 'N/A'} | Moneda: ${p.currency || 'NULL'}`);
      });
    }

    console.log(`\n✅ Total: ${allProducts.length} productos`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrencies();
