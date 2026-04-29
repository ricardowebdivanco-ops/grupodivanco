import Category from './Category.js';
import Subcategory from './Subcategory.js';
import Product from './Product.js'; // ← Nuevo import
import Project from './Project.js';
import BlogPost from './BlogPost.js';
import MediaFile from './MediaFile.js';

// Definir todas las relaciones aquí
export function defineAssociations() {
  // Relaciones Showroom
  Category.hasMany(Subcategory, { 
    foreignKey: 'categoryId', 
    as: 'subcategories',
    onDelete: 'CASCADE'
  });
  
  Subcategory.belongsTo(Category, { 
    foreignKey: 'categoryId', 
    as: 'category' 
  });

  // ← Nueva relación: Subcategoría → Productos
  Subcategory.hasMany(Product, {
    foreignKey: 'subcategoryId',
    as: 'products',
    onDelete: 'CASCADE'
  });

  Product.belongsTo(Subcategory, {
    foreignKey: 'subcategoryId',
    as: 'subcategory'
  });

  // Relación Blog con Proyectos (opcional)
  Project.hasMany(BlogPost, { 
    foreignKey: 'projectId', 
    as: 'blogPosts',
    onDelete: 'SET NULL'
  });
  
  BlogPost.belongsTo(Project, { 
    foreignKey: 'projectId', 
    as: 'project' 
  });

  // Relaciones para MediaFiles
  Project.hasMany(MediaFile, {
    foreignKey: 'projectId',
    as: 'media',
    onDelete: 'CASCADE'
  });

  MediaFile.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'project'
  });
}