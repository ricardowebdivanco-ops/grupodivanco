import { BlogPost } from './src/data/models/index.js';
import sequelize from './src/config/sequelize.js';

async function testPersistence() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.');

    const testSlug = `test-image-${Date.now()}`;
    const testImage = {
      desktop: { url: 'https://res.cloudinary.com/demo/image/upload/v1/desktop.jpg' },
      mobile: { url: 'https://res.cloudinary.com/demo/image/upload/v1/mobile.jpg' },
      thumbnail: { url: 'https://res.cloudinary.com/demo/image/upload/v1/thumb.jpg' },
      url: 'https://res.cloudinary.com/demo/image/upload/v1/desktop.jpg'
    };

    console.log('📝 Intentando crear post con featuredImage (JSON)...');
    console.log('📦 Datos de imagen:', JSON.stringify(testImage, null, 2));

    const post = await BlogPost.create({
      title: 'Test Image Persistence',
      slug: testSlug,
      content: [{ type: 'text', value: 'Contenido de prueba' }],
      featuredImage: testImage,
      status: 'draft'
    });

    console.log('✅ Post creado con ID:', post.id);

    // Leer inmediatamente de la DB para verificar
    const savedPost = await BlogPost.findByPk(post.id);
    console.log('🔍 Leyendo post desde DB...');
    console.log('🖼️ featuredImage guardado:', JSON.stringify(savedPost.featuredImage, null, 2));

    if (savedPost.featuredImage && savedPost.featuredImage.desktop) {
      console.log('🎉 ÉXITO: La imagen se guardó correctamente como JSON.');
    } else {
      console.error('❌ FALLO: featuredImage es null o inválido en la DB.');
    }

    // Limpieza
    await savedPost.destroy();
    console.log('🧹 Post de prueba eliminado.');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await sequelize.close();
  }
}

testPersistence();
