import { Subcategory, Category } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages } from '../config/cloudinary.js';
import { generateSlug } from '../utils/slugify.js';

// Obtener todas las subcategorías
export const getAllSubcategories = async (req, res) => {
  try {
    const { categoryId, activeOnly = true, active = true, featured = false } = req.query;

    const whereClause = {};
    
    // Usar el parámetro 'active' si se proporciona, sino usar 'activeOnly'
    const shouldFilterActive = active !== undefined ? active === 'true' : activeOnly === 'true';
    if (shouldFilterActive) whereClause.isActive = true;
    
    if (categoryId) whereClause.categoryId = categoryId;
    if (featured === 'true') whereClause.isFeatured = true;

    const subcategories = await Subcategory.findAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: subcategories,
      count: subcategories.length
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener subcategorías por categoría
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    // Primero encontrar la categoría
    const category = await Category.findOne({
      where: { slug: categorySlug, isActive: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const subcategories = await Subcategory.findAll({
      where: { 
        categoryId: category.id, 
        isActive: true 
      },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        category: category,
        subcategories: subcategories
      }
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener subcategoría por slug
export const getSubcategoryBySlug = async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    const subcategory = await Subcategory.findOne({
      where: { slug: subcategorySlug, isActive: true },
      include: [{
        model: Category,
        as: 'category',
        where: { slug: categorySlug, isActive: true }
      }]
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    // Incrementar contador de vistas
    await subcategory.increment('viewCount');

    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    console.error('Error obteniendo subcategoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva subcategoría
export const createSubcategory = async (req, res) => {
  try {
    const {
      name,
      description,
      content,
      categoryId,
      brand,
      model,
      sku,
      specifications,
      order = 0,
      isFeatured = false,
      isNew = false,
      slug: customSlug
    } = req.body;

    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido y debe tener al menos 2 caracteres'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'La categoría es requerida'
      });
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe'
      });
    }

    // Validar longitudes de campos
    if (content && content.length > 3000) {
      console.warn('Content field exceeds maximum length, truncating');
      content = content.substring(0, 3000);
    }
    
    if (description && description.length > 1000) {
      console.warn('Description field exceeds maximum length, truncating');
      description = description.substring(0, 1000);
    }

    // Crear la subcategoría
    const subcategoryData = {
      name: name.trim(),
      slug: customSlug?.trim() || generateSlug(name.trim()),
      description: description?.trim() || '',
      content: content?.trim() || '',
      categoryId,
      brand: brand?.trim() || '',
      model: model?.trim() || '',
      sku: sku?.trim() || '',
      specifications: specifications || {},
      order: parseInt(order) || 0,
      isFeatured: Boolean(isFeatured),
      isNew: Boolean(isNew)
    };

    const subcategory = await Subcategory.create(subcategoryData);

    // Incluir información de la categoría en la respuesta
    await subcategory.reload({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Subcategoría creada exitosamente',
      data: subcategory
    });
  } catch (error) {
    console.error('Error creando subcategoría:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una subcategoría con ese nombre en esta categoría'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      // Extract the specific validation error message
      const validationErrors = error.errors.map(err => `${err.path}: ${err.message}`);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar subcategoría
export const updateSubcategory = async (req, res) => {
  try {
    const { slug, id } = req.params;
    const updateData = req.body;

    let subcategory;
    
    // Buscar por ID o por slug dependiendo de qué parámetro se proporcionó
    if (id) {
      subcategory = await Subcategory.findByPk(id);
    } else if (slug) {
      subcategory = await Subcategory.findOne({
        where: { slug: slug }
      });
    }

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    // Si se está cambiando la categoría, verificar que existe
    if (updateData.categoryId && updateData.categoryId !== subcategory.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe'
        });
      }
    }

    // Si se está actualizando el nombre, generar nuevo slug
    if (updateData.name && updateData.name.trim() !== subcategory.name) {
      updateData.slug = generateSlug(updateData.name.trim());
    }

    await subcategory.update(updateData);

    // Recargar con relaciones
    await subcategory.reload({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    res.json({
      success: true,
      message: 'Subcategoría actualizada exitosamente',
      data: subcategory
    });
  } catch (error) {
    console.error('Error actualizando subcategoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen destacada para subcategoría
export const uploadSubcategoryImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { type = 'featured' } = req.body; // 'featured' o 'gallery'
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const subcategory = await Subcategory.findOne({
      where: { slug: slug },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['slug']
      }]
    });
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    // Subir imagen
    const folder = `subcategories/${subcategory.category.slug}/${subcategory.slug}`;
    const images = await uploadResponsiveImage(req.file.path, folder);

    let updateData = {};

    if (type === 'featured') {
      // Eliminar imagen anterior si existe
      if (subcategory.featuredImage) {
        try {
          await deleteResponsiveImages(subcategory.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen anterior:', deleteError);
        }
      }
      updateData.featuredImage = images;
    } else if (type === 'gallery') {
      // Agregar a la galería
      const currentImages = subcategory.images || [];
      updateData.images = [...currentImages, images];
    }

    // Actualizar subcategoría
    await subcategory.update(updateData);

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        subcategory: subcategory,
        newImages: images
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar subcategoría (soft delete por defecto, hard delete opcional)
export const deleteSubcategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { permanent = false } = req.query; // Nuevo parámetro para hard delete

    const subcategory = await Subcategory.findOne({
      where: { slug: slug }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    if (permanent === 'true') {
      // Hard delete - eliminar completamente
      // Primero eliminar imágenes de Cloudinary si existen
      if (subcategory.featuredImage) {
        try {
          await deleteResponsiveImages(subcategory.featuredImage);
        } catch (cloudinaryError) {
          console.error('Error eliminando imágenes de Cloudinary:', cloudinaryError);
          // Continuar con la eliminación aunque falle Cloudinary
        }
      }
      
      await subcategory.destroy();
      
      res.json({
        success: true,
        message: 'Subcategoría eliminada permanentemente'
      });
    } else {
      // Soft delete
      await subcategory.update({ isActive: false });

      res.json({
        success: true,
        message: 'Subcategoría eliminada exitosamente'
      });
    }
  } catch (error) {
    console.error('Error eliminando subcategoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener subcategorías destacadas
export const getFeaturedSubcategories = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const subcategories = await Subcategory.findAll({
      where: { 
        isActive: true, 
        isFeatured: true 
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['order', 'ASC'], ['updatedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener subcategorías nuevas
export const getNewSubcategories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const subcategories = await Subcategory.findAll({
      where: { 
        isActive: true, 
        isNew: true 
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías nuevas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
