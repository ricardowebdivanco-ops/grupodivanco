import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT(2000),
    validate: {
      len: [0, 2000]
    }
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },
  // Relación con subcategoría
  subcategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Subcategories',
      key: 'id',
    },
  },
  // Información del producto
  brand: {
    type: DataTypes.STRING(100),
  },
  model: {
    type: DataTypes.STRING(100),
  },
  sku: {
    type: DataTypes.STRING(50),
  },
  // Especificaciones técnicas
  specifications: {
    type: DataTypes.JSON,
    // { dimensions: "60x60cm", thickness: "9mm", finish: "mate", colors: ["blanco", "gris"] }
  },
  // Imagen principal destacada
  featuredImage: {
    type: DataTypes.JSON,
    // { url: "...", alt: "...", urls: { desktop: "...", mobile: "..." } }
  },
  // Galería de imágenes (miniaturas que pueden convertirse en principal)
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    // [{ url: "...", alt: "...", urls: { desktop: "...", mobile: "..." }, isMain: false }]
  },
  // Documentos técnicos, catálogos, etc.
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Configuración de contacto por WhatsApp
  whatsappMessage: {
    type: DataTypes.TEXT(500),
    // Mensaje personalizado para consultas de este producto
  },
  // Precio (opcional, para mostrar sin funcionalidad de compra)
  price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'COP',
  },
  // Stock disponible
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // SEO y organización
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  searchableText: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isOnSale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Metadatos adicionales
  metaTitle: {
    type: DataTypes.STRING(200),
  },
  metaDescription: {
    type: DataTypes.STRING(300),
  },
}, {
  sequelize,
  modelName: 'Product',
  hooks: {
    beforeSave: (product, options) => {
      // Auto-generar slug si no existe
      if (!product.slug && product.name) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Generar searchableText para búsquedas
      const specsText = product.specifications ? 
        Object.values(product.specifications).join(' ') : '';
      
      product.searchableText = `${product.name} ${product.description || ''} ${product.brand || ''} ${product.model || ''} ${specsText}`.toLowerCase();
      
      // Generar mensaje de WhatsApp por defecto
      if (!product.whatsappMessage) {
        product.whatsappMessage = `Hola! Me interesa el producto "${product.name}". ¿Podrían brindarme más información?`;
      }
    }
  },
  indexes: [
    {
      fields: ['subcategoryId']
    },
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['searchableText']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['isNew']
    }
  ]
});

export default Product;