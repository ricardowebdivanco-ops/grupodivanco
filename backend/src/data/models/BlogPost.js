import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class BlogPost extends Model {}

BlogPost.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  content: {
    type: DataTypes.JSON, 
    allowNull: false,
    
  },
  excerpt: {
    type: DataTypes.TEXT(500),
    validate: {
      len: [0, 500]
    }
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },
  // Imágenes del post
  featuredImage: {
    type: DataTypes.JSON,
  },
  images: {
    type: DataTypes.JSON,
  },
  videos: {
    type: DataTypes.JSON,
  },
  // SEO Meta Tags
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  metaDescription: {
    type: DataTypes.TEXT(500),
    allowNull: true,
  },
  
 
  // Relación opcional con proyecto
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Projects',
      key: 'id',
    },
  },
  // Tags para categorización
  tags: {
    type: DataTypes.JSON,
  },
  // Campo para búsqueda
  searchableText: {
    type: DataTypes.TEXT,
  },
  // Estados
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'BlogPost',
  hooks: {
    beforeSave: (post, options) => {
      const tagsText = post.tags ? post.tags.join(' ') : '';
      
      // Extraer texto de los bloques para hacer el contenido searchable
      let contentText = '';
      if (post.content && Array.isArray(post.content)) {
        contentText = post.content
          .filter(block => block.type === 'text' || block.type === 'header' || block.type === 'quote')
          .map(block => block.value || '')
          .join(' ')
          .replace(/<[^>]*>/g, ''); // Remover cualquier HTML que pueda haber
      } else if (typeof post.content === 'string') {
        // Compatibilidad con formato anterior (por si acaso)
        contentText = post.content.replace(/<[^>]*>/g, '');
      }
      
      post.searchableText = `${post.title} ${post.excerpt || ''} ${contentText} ${tagsText}`.toLowerCase();
    }
  },
  indexes: [
    {
      fields: ['slug']
    },
   
    {
      fields: ['projectId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['publishedAt']
    },
    {
      fields: ['searchableText']  // Índice simple
    }
  ]
});

export default BlogPost;