/**
 * Script para actualizar todos los productos de USD a COP
 * Ejecutar con: node fix-currency.js
 */

import sequelize from './src/data/config/sequelize.js';
import Product from './src/data/models/Product.js';

async function fixCurrency() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');

    console.log('\n🔍 Buscando productos con currency USD...');
    const productsUSD = await Product.findAll({
      where: {
        currency: 'USD'
      }
    });

    console.log(`📊 Encontrados ${productsUSD.length} productos con USD`);

    if (productsUSD.length === 0) {
      console.log('✅ No hay productos para actualizar');
      process.exit(0);
    }

    console.log('\n🔄 Actualizando productos a COP...');
    const updateResult = await Product.update(
      { currency: 'COP' },
      {
        where: {
          currency: 'USD'
        }
      }
    );

    console.log(`✅ Actualizados ${updateResult[0]} productos exitosamente`);

    // Verificar cambios
    console.log('\n🔍 Verificando cambios...');
    const productsAfter = await Product.findAll({
      where: {
        currency: 'USD'
      }
    });

    if (productsAfter.length === 0) {
      console.log('✅ Todos los productos ahora tienen COP como moneda');
    } else {
      console.log(`⚠️ Aún quedan ${productsAfter.length} productos con USD`);
    }

    // Mostrar algunos productos actualizados
    console.log('\n📋 Muestra de productos actualizados:');
    const sampleProducts = await Product.findAll({
      where: {
        currency: 'COP'
      },
      limit: 5,
      attributes: ['id', 'name', 'price', 'currency']
    });

    sampleProducts.forEach(p => {
      console.log(`  - ${p.name}: ${p.price} ${p.currency}`);
    });

    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
fixCurrency();
