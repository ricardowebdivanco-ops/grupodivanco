import { Category, Subcategory, Project, BlogPost, User, MediaFile, Product } from '../data/models/index.js';
import { Op } from 'sequelize';
import sequelize from '../data/config/sequelize.js';

// Búsqueda global
export const globalSearch = async (req, res) => {
  try {
    const { 
      q: query, 
      type = 'all', 
      limit = 20,
      page = 1,
      category,
      subcategory,
      projectType,
      dateRange
    } = req.query;

    // Permitir búsqueda con wildcard o filtros
    const isWildcard = query === '*';
    
    if (!query || (query.trim().length < 2 && !isWildcard)) {
      return res.status(400).json({
        success: false,
        message: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = isWildcard ? '' : query.trim();
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const itemLimit = parseInt(limit);

    const results = {
      categories: [],
      subcategories: [],
      projects: [],
      blogPosts: [],
      products: [],
      total: 0
    };

    // Búsqueda en categorías (solo cuando tipo es 'all' o 'categories', NO cuando es 'products')
    if (type === 'all' || type === 'categories') {
      const whereClause = { isActive: true };
      
      if (!isWildcard && searchTerm) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      if (category) {
        whereClause.slug = category;
      }

      const categories = await Category.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'slug', 'description', 'featuredImage'],
        limit: type === 'categories' ? itemLimit : 5,
        offset: type === 'categories' ? offset : 0,
        order: [['name', 'ASC']]
      });

      results.categories = categories.map(category => ({
        ...category.toJSON(),
        type: 'category',
        url: `/productos/categoria/${category.slug}`
      }));
    }

    // Búsqueda en subcategorías (solo cuando tipo es 'all' o 'subcategories', NO cuando es 'products')
    if (type === 'all' || type === 'subcategories') {
      const whereClause = { isActive: true };
      
      if (!isWildcard && searchTerm) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      if (subcategory) {
        whereClause.slug = subcategory;
      }
      
      const includeCategory = {
        model: Category,
        as: 'category',
        attributes: ['name', 'slug'],
        where: { isActive: true }
      };
      
      if (category) {
        includeCategory.where.slug = category;
      }

      const subcategories = await Subcategory.findAll({
        where: whereClause,
        include: [includeCategory],
        attributes: ['id', 'name', 'slug', 'description', 'featuredImage'],
        limit: type === 'subcategories' ? itemLimit : 5,
        offset: type === 'subcategories' ? offset : 0,
        order: [['name', 'ASC']]
      });

      results.subcategories = subcategories.map(subcategory => ({
        ...subcategory.toJSON(),
        type: 'subcategory',
        url: `/productos/categoria/${subcategory.category.slug}/${subcategory.slug}`
      }));
    }

    // Búsqueda en proyectos
    if (type === 'all' || type === 'projects') {
      const whereClause = { isActive: true };
      
      if (!isWildcard && searchTerm) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { location: { [Op.iLike]: `%${searchTerm}%` } },
          { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      // Filtro por tipo de proyecto
      if (projectType) {
        // projectType es un array, usamos @> para verificar si contiene el elemento
        whereClause.projectType = sequelize.literal(`"Project"."projectType" @> ARRAY['${projectType}']::text[]`);
      }

      const projects = await Project.findAll({
        where: whereClause,
        attributes: ['id', 'title', 'slug', 'description', 'location', 'year', 'projectType'],
        include: [{
          model: MediaFile,
          as: 'media',
          where: { isActive: true },
          attributes: ['id', 'urls', 'type', 'isMain'],
          required: false,
          limit: 1
        }],
        limit: type === 'projects' ? itemLimit : 5,
        offset: type === 'projects' ? offset : 0,
        order: [['year', 'DESC'], ['title', 'ASC']]
      });

      results.projects = projects.map(project => {
        const projectData = project.toJSON();
        const mainImage = project.media && project.media.length > 0 
          ? project.media.find(m => m.isMain) || project.media[0]
          : null;
        
        return {
          ...projectData,
          type: 'project',
          url: `/proyectos/${project.slug}`,
          featuredImage: mainImage && mainImage.urls ? (mainImage.urls.desktop || mainImage.urls[0] || null) : null
        };
      });
    }

    // Búsqueda en blog posts
    if (type === 'all' || type === 'blog') {
      const whereClause = { status: 'published' };
      
      if (!isWildcard && searchTerm) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          sequelize.where(
            sequelize.cast(sequelize.col('content'), 'text'),
            { [Op.iLike]: `%${searchTerm}%` }
          ),
          { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
          { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      // Filtro por rango de fechas
      if (dateRange) {
        const now = new Date();
        let startDate;
        
        switch(dateRange) {
          case '1m':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case '3m':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case '1y':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        
        if (startDate) {
          whereClause.publishedAt = { [Op.gte]: startDate };
        }
      }

      const blogPosts = await BlogPost.findAll({
        where: whereClause,
        attributes: ['id', 'title', 'slug', 'excerpt', 'publishedAt', 'featuredImage', 'author'],
        limit: type === 'blog' ? itemLimit : 5,
        offset: type === 'blog' ? offset : 0,
        order: [['publishedAt', 'DESC']]
      });

      results.blogPosts = blogPosts.map(post => ({
        ...post.toJSON(),
        type: 'post',
        url: `/noticias/${post.slug}`
      }));
    }

    // Búsqueda en productos
    if (type === 'all' || type === 'products') {
      const whereClause = { isActive: true };
      
      if (!isWildcard && searchTerm) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { shortDescription: { [Op.iLike]: `%${searchTerm}%` } },
          { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      const includeOptions = [];
      
      // Incluir categoría si se solicita
      if (category || subcategory) {
        const categoryInclude = {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
          where: { isActive: true }
        };
        
        if (category) {
          categoryInclude.where.slug = category;
        }
        
        includeOptions.push(categoryInclude);
      }
      
      // Incluir subcategoría si se solicita
      if (subcategory) {
        includeOptions.push({
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'slug'],
          where: { 
            isActive: true,
            slug: subcategory
          }
        });
      }

      const products = await Product.findAll({
        where: whereClause,
        include: includeOptions.length > 0 ? includeOptions : [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
            required: false
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug'],
            required: false
          }
        ],
        attributes: ['id', 'name', 'slug', 'description', 'shortDescription', 'price', 'images', 'stockStatus'],
        limit: type === 'products' ? itemLimit : 5,
        offset: type === 'products' ? offset : 0,
        order: [['createdAt', 'DESC'], ['name', 'ASC']]
      });

      results.products = products.map(product => {
        const productData = product.toJSON();
        const featuredImage = productData.images && productData.images.length > 0 
          ? productData.images[0] 
          : null;
        
        return {
          ...productData,
          type: 'product',
          url: `/productos/${product.slug}`,
          featuredImage: featuredImage
        };
      });
    }

    // Calcular total
    results.total = results.categories.length + 
                   results.subcategories.length + 
                   results.projects.length + 
                   results.blogPosts.length +
                   results.products.length;

    // Si es búsqueda específica por tipo, devolver solo ese tipo con paginación
    if (type !== 'all') {
      const specificResults = results[type === 'categories' ? 'categories' :
                                     type === 'subcategories' ? 'subcategories' :
                                     type === 'projects' ? 'projects' : 
                                     type === 'products' ? 'products' : 'blogPosts'];
      
      return res.json({
        success: true,
        data: specificResults,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(results.total / itemLimit),
          total_items: results.total,
          items_per_page: itemLimit
        },
        query: searchTerm,
        type
      });
    }

    res.json({
      success: true,
      data: results,
      query: searchTerm,
      total: results.total
    });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Sugerencias de búsqueda
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = query.trim();
    const itemLimit = Math.min(parseInt(limit), 20);

    const suggestions = [];

    // Sugerencias de categorías
    const categories = await Category.findAll({
      where: {
        isActive: true,
        name: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['name', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['name', 'ASC']]
    });

    suggestions.push(...categories.map(cat => ({
      text: cat.name,
      type: 'category',
      url: `/showroom/${cat.slug}`
    })));

    // Sugerencias de subcategorías
    const subcategories = await Subcategory.findAll({
      where: {
        isActive: true,
        name: { [Op.iLike]: `%${searchTerm}%` }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['slug'],
        where: { isActive: true }
      }],
      attributes: ['name', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['name', 'ASC']]
    });

    suggestions.push(...subcategories.map(sub => ({
      text: sub.name,
      type: 'subcategory',
      url: `/showroom/${sub.category.slug}/${sub.slug}`
    })));

    // Sugerencias de proyectos
    const projects = await Project.findAll({
      where: {
        isActive: true,
        title: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['title', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['title', 'ASC']]
    });

    suggestions.push(...projects.map(proj => ({
      text: proj.title,
      type: 'project',
      url: `/proyectos/${proj.slug}`
    })));

    // Sugerencias de blog posts
    const blogPosts = await BlogPost.findAll({
      where: {
        status: 'published',
        title: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['title', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['title', 'ASC']]
    });

    suggestions.push(...blogPosts.map(post => ({
      text: post.title,
      type: 'blog',
      url: `/blog/${post.slug}`
    })));

    // Limitar y ordenar resultados
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.text === item.text)
      )
      .slice(0, itemLimit);

    res.json({
      success: true,
      data: uniqueSuggestions
    });
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Búsqueda por filtros avanzados
export const advancedSearch = async (req, res) => {
  try {
    const {
      q: query,
      categories = [],
      projectTypes = [],
      years = [],
      tags = [],
      dateFrom,
      dateTo,
      limit = 20,
      page = 1,
      sortBy = 'relevance'
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = query.trim();
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const itemLimit = parseInt(limit);

    const results = {
      projects: [],
      blogPosts: [],
      total: 0
    };

    // Búsqueda avanzada en proyectos
    const projectWhereClause = {
      isActive: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { location: { [Op.iLike]: `%${searchTerm}%` } },
        { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };

    // Filtros adicionales para proyectos
    if (projectTypes.length > 0) {
      projectWhereClause.projectType = { [Op.in]: projectTypes };
    }

    if (years.length > 0) {
      projectWhereClause.year = { [Op.in]: years.map(y => parseInt(y)) };
    }

    let projectOrder = [['title', 'ASC']];
    if (sortBy === 'date') {
      projectOrder = [['year', 'DESC'], ['createdAt', 'DESC']];
    } else if (sortBy === 'name') {
      projectOrder = [['title', 'ASC']];
    }

    const projects = await Project.findAll({
      where: projectWhereClause,
      attributes: ['id', 'title', 'slug', 'description', 'location', 'year', 'projectType'],
      include: [{
        model: MediaFile,
        as: 'media',
        where: { isActive: true },
  attributes: ['id', 'urls', 'type', 'isMain'],
        required: false,
        limit: 1
      }],
      limit: itemLimit,
      offset: offset,
      order: projectOrder
    });

    results.projects = projects.map(project => {
      const projectData = project.toJSON();
      const mainImage = project.media && project.media.length > 0 
        ? project.media.find(m => m.isMain) || project.media[0]
        : null;
      
      return {
        ...projectData,
        type: 'project',
        url: `/proyectos/${project.slug}`,
  featuredImage: mainImage && mainImage.urls ? (mainImage.urls.desktop || mainImage.urls[0] || null) : null
      };
    });

    // Búsqueda avanzada en blog posts
    const blogWhereClause = {
      status: 'published',
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        sequelize.where(
          sequelize.cast(sequelize.col('content'), 'text'),
          { [Op.iLike]: `%${searchTerm}%` }
        ),
        { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
        { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };

    // Filtros adicionales para blog
    if (tags.length > 0) {
      blogWhereClause.tags = { [Op.overlap]: tags };
    }

    if (dateFrom || dateTo) {
      blogWhereClause.publishedAt = {};
      if (dateFrom) {
        blogWhereClause.publishedAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        blogWhereClause.publishedAt[Op.lte] = new Date(dateTo);
      }
    }

    let blogOrder = [['publishedAt', 'DESC']];
    if (sortBy === 'name') {
      blogOrder = [['title', 'ASC']];
    }

    const blogPosts = await BlogPost.findAll({
      where: blogWhereClause,
      attributes: ['id', 'title', 'slug', 'excerpt', 'publishedAt', 'featuredImage', 'tags', 'author'],
      limit: itemLimit,
      offset: offset,
      order: blogOrder
    });

    results.blogPosts = blogPosts.map(post => ({
      ...post.toJSON(),
      type: 'post',
      url: `/blog/${post.slug}`
    }));

    results.total = results.projects.length + results.blogPosts.length;

    res.json({
      success: true,
      data: results,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(results.total / itemLimit),
        total_items: results.total,
        items_per_page: itemLimit
      },
      query: searchTerm,
      filters: {
        categories,
        projectTypes,
        years,
        tags,
        dateFrom,
        dateTo,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
