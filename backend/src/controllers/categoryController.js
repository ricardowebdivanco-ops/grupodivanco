import { Category, Subcategory } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages } from '../config/cloudinary.js';

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const { 
      includeSubcategories = false, 
      activeOnly = true,
      limit = 50,
      page = 1,
      active = true
    } = req.query;

    // Convertir strings a boolean
    const isActiveOnly = activeOnly === 'true' || active === 'true';
    const includeSubcat = includeSubcategories === 'true';

    const queryOptions = {
      where: isActiveOnly ? { isActive: true } : {},
      order: [['order', 'ASC'], ['name', 'ASC']],
    };

    // Agregar paginación si se especifica un limit válido
    if (limit && limit !== 'all') {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      queryOptions.limit = limitNum;
      queryOptions.offset = (pageNum - 1) * limitNum;
    }

    if (includeSubcat) {
      queryOptions.include = [{
        model: Subcategory,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
        order: [['order', 'ASC']]
      }];
    }

    const categories = await Category.findAll(queryOptions);

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categoría por slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeSubcategories = true } = req.query;

    const queryOptions = {
      where: { slug, isActive: true },
    };

    if (includeSubcategories === 'true') {
      queryOptions.include = [{
        model: Subcategory,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
        order: [['order', 'ASC']]
      }];
    }

    const category = await Category.findOne(queryOptions);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva categoría
export const createCategory = async (req, res) => {
  try {
    console.log('📦 [CategoryController] Datos recibidos para crear categoría:', req.body);
    
    const {
      name,
      description,
      content,
      order = 0,
      isShowInHome = false,
      slug
    } = req.body;

    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      console.error('❌ [CategoryController] Error validación: nombre requerido');
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido y debe tener al menos 2 caracteres'
      });
    }

    if (!slug || slug.trim().length < 2) {
      console.error('❌ [CategoryController] Error validación: slug requerido');
      return res.status(400).json({
        success: false,
        message: 'El slug es requerido y debe tener al menos 2 caracteres'
      });
    }
    
    // Validar longitudes de campos
    let descriptionValue = description?.trim() || '';
    let contentValue = content?.trim() || '';
    
    if (descriptionValue.length > 2000) {
      console.warn('Description field exceeds maximum length, truncating');
      descriptionValue = descriptionValue.substring(0, 2000);
    }
    
    if (contentValue.length > 5000) {
      console.warn('Content field exceeds maximum length, truncating');
      contentValue = contentValue.substring(0, 5000);
    }

    // Crear la categoría
    const categoryData = {
      name: name.trim(),
      description: descriptionValue,
      content: contentValue,
      order: parseInt(order) || 0,
      isShowInHome: Boolean(isShowInHome),
      slug: slug.trim()
    };

    console.log('📦 [CategoryController] Datos preparados para la base de datos:', categoryData);
    const category = await Category.create(categoryData);
    console.log('✅ [CategoryController] Categoría creada exitosamente:', category.id);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      id: category.id,
      data: category
    });
  } catch (error) {
    console.error('❌ Error creando categoría:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre o slug'
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
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    await category.update(updateData);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: category
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen destacada para categoría
export const uploadCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📸 [CategoryController] Solicitud para subir imagen, categoría ID:', id);
    
    if (!req.file) {
      console.error('❌ [CategoryController] Error: No se proporcionó ningún archivo');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    console.log('📸 [CategoryController] Archivo recibido:', req.file.path);
    const category = await Category.findByPk(id);
    
    if (!category) {
      console.error('❌ [CategoryController] Error: Categoría no encontrada con ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Eliminar imagen anterior si existe
    if (category.featuredImage) {
      console.log('📸 [CategoryController] Eliminando imagen anterior para categoría ID:', id);
      try {
        await deleteResponsiveImages(category.featuredImage);
      } catch (deleteError) {
        console.warn('⚠️ [CategoryController] Error eliminando imagen anterior:', deleteError);
      }
    }

    // Subir nueva imagen
    console.log('📸 [CategoryController] Subiendo nueva imagen para categoría:', category.slug);
    const images = await uploadResponsiveImage(req.file.path, `categories/${category.slug}`);
    console.log('✅ [CategoryController] Imagen subida exitosamente:', images);

    // Actualizar categoría con nueva imagen
    await category.update({ featuredImage: images });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        category: category,
        images: images
      }
    });
  } catch (error) {
    console.error('❌ [CategoryController] Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// Eliminar categoría (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si tiene subcategorías activas
    const subcategoriesCount = await Subcategory.count({
      where: { categoryId: id, isActive: true }
    });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene subcategorías activas'
      });
    }

    // Soft delete
    await category.update({ isActive: false });

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categorías para el home
export const getHomepageCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { 
        isActive: true, 
        isShowInHome: true 
      },
      order: [['order', 'ASC']],
      limit: 6 // Máximo 6 categorías en home
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías del home:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
