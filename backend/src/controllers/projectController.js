import { Project, BlogPost, User, MediaFile } from '../data/models/index.js';
import { uploadResponsiveImage, uploadOptimizedVideo, deleteResponsiveImages, uploadDocument } from '../config/cloudinary.js';
import { Op } from 'sequelize';
import sequelize from '../data/config/sequelize.js';

// Obtener todos los proyectos
export const getAllProjects = async (req, res) => {
  try {
    const { 
      year, 
      projectType, 
      etapa,
      featured = false,
      publicOnly = true,
      tags,
      limit = 12,
      page = 1
    } = req.query;

    const whereClause = { isActive: true };  // ✅ Siempre filtrar por activos por defecto
    
    if (publicOnly === 'true') whereClause.isPublic = true;
    if (year) whereClause.year = year;
    if (projectType) {
      // ✅ Manejar projectType como array (después de la migración)
      const projectTypesArray = typeof projectType === 'string' 
        ? projectType.split(',').map(t => t.trim())
        : Array.isArray(projectType) 
        ? projectType 
        : [projectType];
      
      whereClause.projectType = {
        [Op.overlap]: projectTypesArray
      };
    }
    if (etapa) whereClause.etapa = etapa;
    if (featured === 'true') whereClause.isFeatured = true;
    if (tags) {
      // Buscar proyectos que contengan cualquiera de los tags
      const tagsArray = tags.split(',');
      whereClause.tags = {
        [Op.overlap]: tagsArray
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 🔍 DEBUG: Agregar logs para debuggear proyectos
    console.log('📊 getAllProjects DEBUG:', {
      whereClause,
      limit: parseInt(limit),
      offset
    });

 const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [{
        model: MediaFile,
        as: 'media',
        where: { isActive: true },
        required: false,
        order: [['isMain', 'DESC'], ['order', 'ASC']]
      }],
      order: [
        ['isFeatured', 'DESC'],
        ['year', 'DESC'], 
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    // 🔍 DEBUG: Log los proyectos encontrados
    console.log('🎯 Projects found:', {
      count,
      projectsLength: projects.length,
      firstProject: projects[0] ? {
        id: projects[0].id,
        title: projects[0].title,
        hasMedia: !!projects[0].media,
        mediaLength: projects[0].media?.length || 0,
        media: projects[0].media
      } : 'No projects'
    });

    res.json({
      success: true,
      data: projects,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const {
      // Filtros de búsqueda
      title,           // Búsqueda por título
      tags,           // Array de tags o string separado por comas
      location,       // Búsqueda por ubicación
      search,         // Búsqueda general en texto
      
      // Filtros adicionales
      year,
      projectType,
      etapa,
      client,
      architect,
      
      // Configuración de resultados
      featured = false,
      publicOnly = true,
      limit = 12,
      page = 1,
      sortBy = 'updatedAt',  // title, year, viewCount, updatedAt
      sortOrder = 'DESC'     // ASC, DESC
    } = req.query;

    const whereClause = { isActive: true };
    
    // ✅ Filtro base: solo públicos
    if (publicOnly === 'true') {
      whereClause.isPublic = true;
    }

    // ✅ Filtro: Solo destacados
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // ✅ Búsqueda por título (ILIKE para PostgreSQL)
    if (title) {
      whereClause.title = {
        [Op.iLike]: `%${title}%`
      };
    }

    // ✅ Búsqueda por ubicación
    if (location) {
      whereClause.location = {
        [Op.iLike]: `%${location}%`
      };
    }

    // ✅ Filtro por tags (overlap para arrays)
    if (tags) {
      let tagsArray;
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      } else {
        tagsArray = tags;
      }
      
      whereClause.tags = {
        [Op.overlap]: tagsArray
      };
    }

    // ✅ Búsqueda general en texto searchable
    if (search) {
      whereClause.searchableText = {
        [Op.iLike]: `%${search.toLowerCase()}%`
      };
    }

    // ✅ Filtros específicos
    if (year) whereClause.year = year;
    if (projectType) {
      // ✅ Manejar projectType como array (después de la migración)
      const projectTypesArray = typeof projectType === 'string' 
        ? projectType.split(',').map(t => t.trim())
        : Array.isArray(projectType) 
        ? projectType 
        : [projectType];
      
      whereClause.projectType = {
        [Op.overlap]: projectTypesArray
      };
    }
    if (etapa) whereClause.etapa = etapa;
    if (client) {
      whereClause.client = {
        [Op.iLike]: `%${client}%`
      };
    }
    if (architect) {
      whereClause.architect = {
        [Op.iLike]: `%${architect}%`
      };
    }

    // ✅ Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Ordenamiento dinámico
    const validSortFields = ['title', 'year', 'viewCount', 'updatedAt', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'updatedAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [{
        model: MediaFile,
        as: 'media',
        where: { isActive: true },
        required: false,
        order: [['isMain', 'DESC'], ['order', 'ASC']]
      }],
      order: [
        ['isFeatured', 'DESC'], // Destacados primero siempre
        [orderField, orderDirection]
      ],
      limit: parseInt(limit),
      offset: offset,
      distinct: true // Para que count sea correcto con includes
    });

    // ✅ Estadísticas de filtros aplicados
    const appliedFilters = {
      title: title || null,
      tags: tags || null,
      location: location || null,
      search: search || null,
      year: year || null,
      projectType: projectType || null,
      etapa: etapa || null,
      client: client || null,
      architect: architect || null
    };

    res.json({
      success: true,
      data: projects,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      },
      filters: {
        applied: appliedFilters,
        active_filters_count: Object.values(appliedFilters).filter(v => v !== null).length
      },
      sorting: {
        sort_by: orderField,
        sort_order: orderDirection
      }
    });

  } catch (error) {
    console.error('Error buscando proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA: Obtener opciones disponibles para filtros
export const getFilterOptions = async (req, res) => {
  try {
    // Obtener años únicos
    const years = await Project.findAll({
      attributes: ['year'],
      where: { isActive: true, isPublic: true },
      group: ['year'],
      order: [['year', 'DESC']]
    });

    // Obtener ubicaciones únicas
    const locations = await Project.findAll({
      attributes: ['location'],
      where: { 
        isActive: true, 
        isPublic: true,
        location: { [Op.ne]: null }
      },
      group: ['location'],
      order: [['location', 'ASC']]
    });

    // Obtener todos los tags únicos
    const projectsWithTags = await Project.findAll({
      attributes: ['tags'],
      where: { 
        isActive: true, 
        isPublic: true,
        tags: { [Op.ne]: [] }
      }
    });

    // Extraer tags únicos
    const allTags = new Set();
    projectsWithTags.forEach(project => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => allTags.add(tag));
      }
    });

    // Obtener tipos de proyecto únicos
    const projectTypes = await Project.findAll({
      attributes: ['projectType'],
      where: { isActive: true, isPublic: true },
      group: ['projectType'],
      order: [['projectType', 'ASC']]
    });

    // Obtener estados únicos
    const etapas = await Project.findAll({
      attributes: ['etapa'],
      where: { isActive: true, isPublic: true },
      group: ['etapa'],
      order: [['etapa', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        years: years.map(y => y.year),
        locations: locations.map(l => l.location).filter(Boolean),
        tags: Array.from(allTags).sort(),
        project_types: projectTypes.map(p => p.projectType),
        etapas: etapas.map(e => e.etapa),
        sort_options: [
          { value: 'updatedAt', label: 'Más Recientes' },
          { value: 'title', label: 'Título A-Z' },
          { value: 'year', label: 'Año' },
          { value: 'viewCount', label: 'Más Vistos' }
        ]
      }
    });

  } catch (error) {
    console.error('Error obteniendo opciones de filtro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA: Búsqueda con sugerencias
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: {
          titles: [],
          locations: [],
          tags: [],
          clients: [],
          architects: []
        }
      });
    }

    const searchTerm = query.toLowerCase();
    const suggestions = {};

    // Sugerencias de títulos
    if (type === 'all' || type === 'title') {
      const titles = await Project.findAll({
        attributes: ['title'],
        where: {
          isActive: true,
          isPublic: true,
          title: { [Op.iLike]: `%${searchTerm}%` }
        },
        limit: 5,
        order: [['title', 'ASC']]
      });
      suggestions.titles = titles.map(p => p.title);
    }

    // Sugerencias de ubicaciones
    if (type === 'all' || type === 'location') {
      const locations = await Project.findAll({
        attributes: ['location'],
        where: {
          isActive: true,
          isPublic: true,
          location: { 
            [Op.and]: [
              { [Op.ne]: null },
              { [Op.iLike]: `%${searchTerm}%` }
            ]
          }
        },
        group: ['location'],
        limit: 5,
        order: [['location', 'ASC']]
      });
      suggestions.locations = locations.map(p => p.location);
    }

    // Sugerencias de tags
    if (type === 'all' || type === 'tags') {
      const projectsWithTags = await Project.findAll({
        attributes: ['tags'],
        where: { 
          isActive: true, 
          isPublic: true,
          tags: { [Op.ne]: [] }
        }
      });

      const matchingTags = new Set();
      projectsWithTags.forEach(project => {
        if (project.tags && Array.isArray(project.tags)) {
          project.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
              matchingTags.add(tag);
            }
          });
        }
      });
      suggestions.tags = Array.from(matchingTags).slice(0, 5).sort();
    }

    // Sugerencias de clientes
    if (type === 'all' || type === 'client') {
      const clients = await Project.findAll({
        attributes: ['client'],
        where: {
          isActive: true,
          isPublic: true,
          client: { 
            [Op.and]: [
              { [Op.ne]: null },
              { [Op.iLike]: `%${searchTerm}%` }
            ]
          }
        },
        group: ['client'],
        limit: 5,
        order: [['client', 'ASC']]
      });
      suggestions.clients = clients.map(p => p.client);
    }

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proyectos por año
export const getProjectsByYear = async (req, res) => {
  try {
    const { year } = req.params;

    const projects = await Project.findAll({
      where: { 
        year: parseInt(year),
        isPublic: true,
        isActive: true
      },
      include: [{
        model: MediaFile,
        as: 'media',
        where: { isActive: true },
        required: false,
        order: [['isMain', 'DESC'], ['order', 'ASC']]
      }],
      order: [['isFeatured', 'DESC'], ['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        projects: projects,
        count: projects.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo proyectos por año:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener años disponibles
export const getAvailableYears = async (req, res) => {
  try {
    const years = await Project.findAll({
      where: {
        isPublic: true,
        isActive: true
      },
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']]
    });

    const yearsList = years.map(project => project.year);

    res.json({
      success: true,
      data: yearsList
    });
  } catch (error) {
    console.error('Error obteniendo años:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proyecto por slug
export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({
      where: { slug, isPublic: true, isActive: true },
      include: [
        {
          model: MediaFile,
          as: 'media',
          where: { isActive: true },
          required: false,
          order: [['isMain', 'DESC'], ['order', 'ASC']]
        },
        {
          model: BlogPost,
          as: 'blogPosts',
          where: { status: 'published' },
          required: false,
          
          order: [['publishedAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Incrementar contador de vistas
    await project.increment('viewCount');

    // Organizar media por tipos
    const mediaByType = {
      renders: project.media?.filter(m => m.type === 'render') || [],
      planos: project.media?.filter(m => m.type === 'plano') || [],
      videos: project.media?.filter(m => m.type === 'video') || [],
      obra_proceso: project.media?.filter(m => m.type === 'obra_proceso') || [],
      obra_finalizada: project.media?.filter(m => m.type === 'obra_finalizada') || [],
      otros: project.media?.filter(m => m.type === 'otro') || []
    };

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        mediaByType
      }
    });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};



// ✅ FUNCIÓN DE TEST ESPECÍFICA PARA DEBUGGING
export const testProjectCreation = async (req, res) => {
  try {
    console.log('🧪 === INICIANDO TEST DE CREACIÓN DE PROYECTO ===');
    
    // Test 1: Verificar conexión a DB
    console.log('📊 Test 1: Verificando conexión a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a DB exitosa');
    
    // Test 2: Verificar modelo Project
    console.log('📊 Test 2: Verificando modelo Project...');
    const ProjectModel = sequelize.models.Project;
    console.log('✅ Modelo Project cargado:', !!ProjectModel);
    
    // Test 3: Crear proyecto de prueba paso a paso
    console.log('📊 Test 3: Creando proyecto de prueba...');
    
    const testData = {
      title: 'Proyecto Test ' + Date.now(),
      description: 'Descripción de prueba para debugging',
      year: 2024,
      projectType: 'Proyecto',
      etapa: 'render',
      isActive: true,
      isPublic: true,
      tags: ['moderno', 'residencial']
    };
    
    console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2));
    
    // Test 3a: Crear usando Project.create()
    console.log('🔄 Usando Project.create()...');
    const project = await Project.create(testData);
    console.log('✅ Project.create() exitoso');
    console.log('📝 Proyecto creado:', {
      id: project.id,
      title: project.title,
      slug: project.slug,
      isActive: project.isActive
    });
    
    // Test 4: Verificar que se guardó en DB
    console.log('📊 Test 4: Verificando en base de datos...');
    const foundProject = await Project.findByPk(project.id);
    console.log('✅ Proyecto encontrado en DB:', !!foundProject);
    
    if (foundProject) {
      console.log('📝 Datos en DB:', {
        id: foundProject.id,
        title: foundProject.title,
        slug: foundProject.slug,
        year: foundProject.year,
        projectType: foundProject.projectType,
        isActive: foundProject.isActive,
        createdAt: foundProject.createdAt
      });
    }
    
    // Test 5: Query directa SQL para verificar
    console.log('📊 Test 5: Query SQL directa...');
    const [results] = await sequelize.query(
      `SELECT id, title, slug, year, "projectType", "isActive", "createdAt" 
       FROM "Projects" 
       WHERE id = :projectId`,
      {
        replacements: { projectId: project.id },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('📝 Resultado SQL directo:', results);
    
    // Test 6: Contar proyectos totales
    console.log('📊 Test 6: Contando proyectos totales...');
    const totalCount = await Project.count();
    console.log('📊 Total de proyectos en DB:', totalCount);
    
    // Test 7: Listar últimos proyectos
    console.log('📊 Test 7: Últimos 5 proyectos...');
    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'slug', 'createdAt', 'isActive']
    });
    
    console.log('📋 Proyectos recientes:');
    recentProjects.forEach(p => {
      console.log(`   - [${p.id}] ${p.title} (${p.slug}) - Activo: ${p.isActive} - Creado: ${p.createdAt}`);
    });
    
    // Cleanup - eliminar proyecto de prueba
    console.log('🧹 Limpieza: eliminando proyecto de prueba...');
    await project.destroy();
    console.log('✅ Proyecto de prueba eliminado');
    
    // Respuesta final
    res.json({
      success: true,
      message: 'Test de creación completado exitosamente',
      results: {
        connectionOk: true,
        modelLoaded: true,
        projectCreated: true,
        foundInDb: !!foundProject,
        sqlQueryResult: !!results,
        totalProjectsInDb: totalCount,
        recentProjectsCount: recentProjects.length
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR en test de creación:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Test de creación falló',
      error: error.message,
      errorType: error.name,
      errorDetails: {
        code: error.code,
        original: error.original?.message,
        sql: error.sql
      }
    });
  }
};

// ✅ FUNCIÓN PARA DEBUGGING DEL CREATEPROJECT ACTUAL
export const debugCreateProject = async (req, res) => {
  console.log('\n🚨 === DEBUG CREATE PROJECT INICIADO ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log("📝 [createProject] req.body:", req.body);
  try {
    // Log 1: Request completo
    console.log('📨 REQUEST DEBUG:');
    console.log('   - Method:', req.method);
    console.log('   - URL:', req.url);
    console.log('   - Headers:', JSON.stringify(req.headers, null, 2));
    console.log('   - Body:', JSON.stringify(req.body, null, 2));
    console.log('   - Body type:', typeof req.body);
    console.log('   - Body keys:', Object.keys(req.body || {}));
    
    // Log 2: Verificar conexión DB antes de proceder
    console.log('\n📊 DATABASE DEBUG:');
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión DB activa');
    } catch (dbError) {
      console.error('❌ Error conexión DB:', dbError.message);
      throw dbError;
    }
    
    // Log 3: Procesar data exactamente como en createProject
    const {
      title,
      description,
      shortDescription,
      content,
      year,
      location,
      client,
      architect,
      projectType,
      etapa = 'render',
      area,
      tags = [],
      isFeatured = false,
      isPublic = true,
      order = 0,
      startDate,
      endDate
    } = req.body;
    
    console.log('\n📋 EXTRACTED DATA:');
    console.log(`   - title: "${title}" (${typeof title}) - valid: ${!!title && title.trim().length >= 5}`);
    console.log(`   - year: ${year} (${typeof year}) - valid: ${!!year && year >= 2000}`);
    console.log(`   - projectType: "${projectType}" (${typeof projectType})`);
    console.log(`   - tags: ${JSON.stringify(tags)} (${typeof tags}) - isArray: ${Array.isArray(tags)}`);
    
    // Log 4: Validaciones paso a paso
    console.log('\n✅ VALIDATION CHECKS:');
    
    if (!title || title.trim().length < 5) {
      console.log('❌ Title validation failed');
      return res.status(400).json({
        success: false,
        message: 'Título inválido',
        debug: { title, titleTrimmed: title?.trim(), length: title?.trim().length }
      });
    }
    console.log('✅ Title validation passed');
    
    if (!year || year < 2000) {
      console.log('❌ Year validation failed');
      return res.status(400).json({
        success: false,
        message: 'Año inválido',
        debug: { year, yearType: typeof year }
      });
    }
    console.log('✅ Year validation passed');
    
    // Validar projectType (puede ser array o string)
    const validProjectTypes = ['Diseño', 'Proyecto', 'Dirección de Obra'];
    
    if (!projectType || (Array.isArray(projectType) && projectType.length === 0)) {
      console.log('❌ ERROR: Tipo de proyecto vacío');
      return res.status(400).json({
        success: false,
        message: 'El tipo de proyecto es requerido'
      });
    }
    
    // Si es array, validar que todos los elementos sean válidos
    const projectTypesToValidate = Array.isArray(projectType) ? projectType : [projectType];
    const invalidTypes = projectTypesToValidate.filter(type => !validProjectTypes.includes(type));
    
    if (invalidTypes.length > 0) {
      console.log('❌ ERROR: Tipos de proyecto inválidos:', invalidTypes);
      return res.status(400).json({
        success: false,
        message: `Tipos de proyecto inválidos: ${invalidTypes.join(', ')}. Los tipos válidos son: ${validProjectTypes.join(', ')}`
      });
    }
    
    console.log('✅ ProjectType validation passed:', projectTypesToValidate);
    
    // Log 5: Preparar data final
    const generateSlug = (title, year) => {
      return `${title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${year}`;
    };
    
    const projectData = {
      title: title.trim(),
      description: description?.trim(),
      shortDescription: shortDescription?.trim(),
      content: content?.trim(),
      year: parseInt(year),
      location: location?.trim(),
      client: client?.trim(),
      architect: architect?.trim(),
      projectType,
      etapa,
      area: area?.trim(),
      tags: Array.isArray(tags) ? tags : [],
      slug: generateSlug(title.trim(), parseInt(year)),
      isFeatured: Boolean(isFeatured),
      isPublic: Boolean(isPublic),
      isActive: true,
      order: parseInt(order) || 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };
    
    console.log('\n📝 FINAL PROJECT DATA:');
    console.log(JSON.stringify(projectData, null, 2));
    
    // Log 6: Intentar crear con seguimiento detallado
    console.log('\n🔄 ATTEMPTING DATABASE CREATE...');
    
    const startTime = Date.now();
    const project = await Project.create(projectData);
    const endTime = Date.now();
    
    console.log('✅ CREATE SUCCESSFUL!');
    console.log(`   - Duration: ${endTime - startTime}ms`);
    console.log(`   - Created ID: ${project.id}`);
    console.log(`   - Created slug: ${project.slug}`);
    
    // Log 7: Verificación inmediata
    console.log('\n🔍 IMMEDIATE VERIFICATION...');
    const verification = await Project.findByPk(project.id);
    console.log('✅ Verification result:', {
      found: !!verification,
      id: verification?.id,
      title: verification?.title,
      isActive: verification?.isActive,
      createdAt: verification?.createdAt
    });
    
    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'DEBUG: Proyecto creado exitosamente',
      data: project,
      debug: {
        processingTime: endTime - startTime,
        verified: !!verification
      }
    });
    
  } catch (error) {
    console.error('\n❌ ERROR en debugCreateProject:');
    console.error('   - Name:', error.name);
    console.error('   - Message:', error.message);
    console.error('   - Code:', error.code);
    
    if (error.original) {
      console.error('   - Original error:', error.original);
    }
    
    if (error.errors) {
      console.error('   - Validation errors:');
      error.errors.forEach(err => {
        console.error(`     * ${err.path}: ${err.message} (value: ${err.value})`);
      });
    }
    
    // Determinar mensaje de error más descriptivo
    let errorMessage = 'Error al crear el proyecto';
    
    if (error.original?.message?.includes('enum_Projects_projectType')) {
      errorMessage = 'Error de base de datos: La columna projectType necesita migración. Ejecuta: npm run migrate';
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors?.map(e => e.message).join(', ') || 'Error de validación';
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Ya existe un proyecto con ese slug o título';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      errorType: error.name,
      debug: {
        code: error.code,
        original: error.original?.message,
        validationErrors: error.errors?.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      }
    });
  } finally {
    console.log('\n🏁 === DEBUG CREATE PROJECT FINALIZADO ===\n');
  }
};



// Crear nuevo proyecto
export const createProject = async (req, res) => {
  try {
    // ✅ LOG 1: Ver qué datos llegan
    console.log('=== CREATE PROJECT DEBUG ===');
    console.log('1. Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('2. Headers:', req.headers['content-type']);

    const {
      title,
      description,
      shortDescription,
      content,
      year,
      location,
      client,
      architect,
      projectType,
      etapa = 'render',
      area,
      tags = [],
      kuulaUrl,
      isFeatured = false,
      showInSlider = false,
      isPublic = true,
      order = 0,
      startDate,
      endDate
    } = req.body;

    // ✅ LOG 2: Ver valores después de destructuring
    console.log('3. Valores destructurados:');
    console.log('   - title:', title, '(tipo:', typeof title, ')');
    console.log('   - year:', year, '(tipo:', typeof year, ')');
    console.log('   - projectType:', projectType, '(tipo:', typeof projectType, ')');
    console.log('   - tags:', tags, '(tipo:', typeof tags, ', es array:', Array.isArray(tags), ')');

    // Validaciones básicas
    if (!title || title.trim().length < 5) {
      console.log('❌ ERROR: Título inválido');
      console.log('   - title existe:', !!title);
      console.log('   - title después de trim:', title?.trim());
      console.log('   - longitud:', title?.trim().length);
      
      return res.status(400).json({
        success: false,
        message: 'El título es requerido y debe tener al menos 5 caracteres'
      });
    }

    if (!year || year < 2000) {
      console.log('❌ ERROR: Año inválido');
      console.log('   - year existe:', !!year);
      console.log('   - year valor:', year);
      console.log('   - year < 2000:', year < 2000);
      
      return res.status(400).json({
        success: false,
        message: 'El año es requerido y debe ser válido'
      });
    }

    // ✅ LOG 3: Verificar projectType válido
    const validProjectTypes = ["Diseño", "Proyecto", "Dirección de Obra"];
    console.log('4. Validación projectType:');
    console.log('   - projectType recibido:', projectType);
    console.log('   - tipos válidos:', validProjectTypes);
    
    if (!projectType || (Array.isArray(projectType) && projectType.length === 0)) {
      console.log('❌ ERROR: Tipo de proyecto vacío');
      return res.status(400).json({
        success: false,
        message: 'El tipo de proyecto es requerido'
      });
    }
    
    // Si es array, validar que todos los elementos sean válidos
    const projectTypesToValidate = Array.isArray(projectType) ? projectType : [projectType];
    const invalidTypes = projectTypesToValidate.filter(type => !validProjectTypes.includes(type));
    
    if (invalidTypes.length > 0) {
      console.log('❌ ERROR: Tipos de proyecto inválidos:', invalidTypes);
      return res.status(400).json({
        success: false,
        message: `Tipos de proyecto inválidos: ${invalidTypes.join(', ')}. Los tipos válidos son: ${validProjectTypes.join(', ')}`
      });
    }
    
    console.log('✅ ProjectType validation passed:', projectTypesToValidate);

    // ✅ FUNCIÓN generateSlug CORREGIDA
    const generateSlug = (title, year) => {
      return `${title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${year}`;
    };

    // ✅ LOG 4: Datos que se van a crear
    const projectData = {
      title: title.trim(),
      description: description?.trim(),
      shortDescription: shortDescription?.trim(),
      content: content?.trim(),
      year: parseInt(year),
      location: location?.trim(),
      client: client?.trim(),
      architect: architect?.trim(),
      projectType,
      etapa,
      area: area?.trim(),
      tags: Array.isArray(tags) ? tags : [],
      kuulaUrl: kuulaUrl?.trim() || null, 
      slug: generateSlug(title.trim(), parseInt(year)), // ✅ GENERAR SLUG AQUÍ
      isFeatured: Boolean(isFeatured),
      showInSlider: Boolean(showInSlider),
      isPublic: Boolean(isPublic),
      isActive: true, // ✅ AGREGAR EXPLÍCITAMENTE
      order: parseInt(order),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };

    console.log('5. Datos finales para crear:');
    console.log(JSON.stringify(projectData, null, 2));
    console.log('   - Slug generado:', projectData.slug); 
    
    // ✅ LOG 5: Intentar crear proyecto
    console.log('6. Intentando crear proyecto...');
    const project = await Project.create(projectData);
    
    console.log('✅ SUCCESS: Proyecto creado exitosamente');
    console.log('   - ID:', project.id);
    console.log('   - Slug generado:', project.slug);
    
    // ✅ LOG EXTRA: Verificar que se guardó en DB
    console.log('7. Verificando en base de datos...');
    const projectInDB = await Project.findByPk(project.id);
    console.log('   - Proyecto encontrado en DB:', !!projectInDB);
    console.log('   - isActive en DB:', projectInDB?.isActive);
    console.log('   - isPublic en DB:', projectInDB?.isPublic);

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: project
    });

  } catch (error) {
    console.log('❌ CATCH ERROR en createProject:');
    console.log('   - Error name:', error.name);
    console.log('   - Error message:', error.message);
    console.log('   - Error stack:', error.stack);
    
    // ✅ LOG 6: Errores específicos de Sequelize
    if (error.name === 'SequelizeValidationError') {
      console.log('   - Errores de validación:');
      error.errors?.forEach(err => {
        console.log(`     * ${err.path}: ${err.message} (valor: ${err.value})`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors?.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('   - Error de constraint único');
      console.log('   - Fields:', error.fields);
      
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proyecto con ese título o slug'
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.log('   - Error de base de datos');
      console.log('   - Original error:', error.original?.message);
      
      let errorMessage = 'Error de base de datos';
      
      if (error.original?.message?.includes('enum_Projects_projectType')) {
        errorMessage = 'La columna projectType necesita actualización. Ejecuta las migraciones: npm run migrate';
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.original?.message || error.message : undefined
      });
    }

    console.error('Error creando proyecto:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ NUEVA FUNCIÓN: Obtener proyectos para slider
export const getSliderProjects = async (req, res) => {
  try {
    console.log('🎠 Obteniendo proyectos para slider...');
    const { limit = 5 } = req.query;

    // Determinar qué atributos seleccionar (omitir shortDescription si no existe)
    let attributes;
    try {
      // Verificar si la columna shortDescription existe
      await sequelize.query('SELECT shortDescription FROM "Projects" LIMIT 1');
      attributes = undefined; // Si no da error, incluir todos los atributos
      console.log('✅ Campo shortDescription existe en BD');
    } catch (err) {
      // Si da error, excluir shortDescription
      console.log('⚠️ Campo shortDescription NO existe en BD - omitiendo');
      attributes = { 
        exclude: ['shortDescription']
      };
    }

    // Versión más robusta para evitar problemas con la condición required: true
    // Primero obtenemos proyectos que deberían estar en el slider
    const projects = await Project.findAll({
      attributes,
      where: { 
        isActive: true,
        isPublic: true, 
        showInSlider: true 
      },
      include: [{
        model: MediaFile,
        as: 'media',
        where: { 
          isActive: true,
        },
        required: false, // Permitimos proyectos sin imágenes para ser más flexibles
      }],
      order: [['order', 'ASC'], ['updatedAt', 'DESC']],
      limit: parseInt(limit) * 2 // Obtenemos más por si algunos son filtrados
    });

    // ✅ Procesar para que cada proyecto tenga solo UNA imagen del slider
    // Versión extremadamente defensiva para entornos de producción
    const processedProjects = projects
      .filter(project => {
        // Solo incluir proyectos que tengan medios válidos
        return project && project.media && Array.isArray(project.media) && project.media.length > 0;
      })
      .map(project => {
        try {
          // Intentar usar toJSON() pero manejar caso donde no es función
          let projectData;
          try {
            projectData = typeof project.toJSON === 'function' ? project.toJSON() : project;
          } catch (e) {
            console.error('Error al convertir proyecto a JSON:', e);
            projectData = JSON.parse(JSON.stringify(project));
          }
          
          // Verificación defensiva de estructura
          if (!projectData || typeof projectData !== 'object') {
            console.error('Formato de proyecto inválido:', projectData);
            return null;
          }
          
          // Buscar imagen del slider específica con manejo defensivo
          let sliderImage = null;
          
          if (projectData.media && Array.isArray(projectData.media) && projectData.media.length > 0) {
            // Filtrar cualquier elemento null o undefined primero
            const validMedia = projectData.media.filter(m => m);
            
            if (validMedia.length > 0) {
              // Buscar en orden de prioridad
              sliderImage = validMedia.find(img => img && img.isSliderImage === true) || 
                           validMedia.find(img => img && img.isMain === true) ||
                           validMedia[0];
            }
          }
          
          // Si no hay imagen válida, usar un objeto con propiedades mínimas
          if (!sliderImage) {
            sliderImage = { id: null, urls: {}, isSliderImage: false, isMain: false };
          }
          
          return {
            ...projectData,
            sliderImage, // Imagen específica para el slider
            media: sliderImage ? [sliderImage] : [] // Solo la imagen del slider
          };
        } catch (err) {
          console.error('Error procesando proyecto para slider:', err, project.id);
          return null;
        }
      })
      .filter(Boolean); // Eliminar los nulos que pudieron quedar por errores

    console.log(`✅ Encontrados ${processedProjects.length} proyectos para slider`);

    res.json({
      success: true,
      data: processedProjects,
      meta: {
        total: processedProjects.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo proyectos del slider:', error);
    console.error('Stack:', error.stack); // Agregar stack para mejor depuración
    
    // Devolver mensaje de error más detallado en desarrollo
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message;
      
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV !== 'production' ? error.toString() : undefined
    });
  }
};


export const updateProject = async (req, res) => {
  try {
    console.log('=== UPDATE PROJECT DEBUG ===');
    const { id } = req.params;
    console.log('1. Project ID:', id);
    console.log('2. Update data received:', JSON.stringify(req.body, null, 2));

    const {
      title,
      description,
      shortDescription,
      content,
      year,
      location,
      client,
      architect,
      projectType,
      etapa,
      area,
      tags,
      kuulaUrl,           // ✅ NUEVO CAMPO
      isFeatured,
      showInSlider,       // ✅ NUEVO CAMPO
      isPublic,
      isActive,
      order,
      startDate,
      endDate
    } = req.body;

    // Verificar que el proyecto existe
    const project = await Project.findByPk(id);
    if (!project) {
      console.log('❌ Proyecto no encontrado:', id);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    console.log('3. Proyecto encontrado:', project.title);

    // ✅ Preparar datos de actualización con validación
    const updateData = {};

    // Solo actualizar campos que vienen en el body
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription?.trim();
    if (content !== undefined) updateData.content = content?.trim();
    if (year !== undefined) updateData.year = parseInt(year);
    if (location !== undefined) updateData.location = location?.trim();
    if (client !== undefined) updateData.client = client?.trim();
    if (architect !== undefined) updateData.architect = architect?.trim();
    if (projectType !== undefined) updateData.projectType = projectType;
    if (etapa !== undefined) updateData.etapa = etapa;
    if (area !== undefined) updateData.area = area?.trim();
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    
    // ✅ NUEVOS CAMPOS
    if (kuulaUrl !== undefined) updateData.kuulaUrl = kuulaUrl?.trim() || null;
    if (showInSlider !== undefined) updateData.showInSlider = Boolean(showInSlider);
    
    // Campos booleanos
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    
    // Campos numéricos
    if (order !== undefined) updateData.order = parseInt(order);
    
    // Fechas
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    console.log('4. Data to update:', JSON.stringify(updateData, null, 2));

    // ✅ Regenerar slug si título o año cambian
    if (updateData.title || updateData.year) {
      const newTitle = updateData.title || project.title;
      const newYear = updateData.year || project.year;
      
      // Solo regenerar si realmente cambió
      const currentSlugBase = `${newTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${newYear}`;
      const currentProjectSlugBase = `${project.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${project.year}`;
      
      if (currentSlugBase !== currentProjectSlugBase) {
        console.log('5. Regenerando slug...');
        // El hook beforeSave se encargará de generar el nuevo slug
        updateData.slug = ''; // Esto forzará la regeneración en el hook
      }
    }

    // Actualizar el proyecto
    await project.update(updateData);

    console.log('✅ SUCCESS: Proyecto actualizado exitosamente');

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: project
    });

  } catch (error) {
    console.error('❌ Error actualizando proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Subir imagen para proyecto
export const uploadProjectMedia = async (req, res) => {
  try {
    // ✅ CORS headers explícitos al inicio
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');

    console.log('🚀 Iniciando subida de media...');
    console.log('📁 Archivo recibido:', req.file);
    console.log('📋 Datos del body:', req.body);
    console.log('🔍 Headers:', req.headers);

    const { id } = req.params;
    const { type, description, isMain = false, order = 0 } = req.body;

    // ✅ Validaciones mejoradas
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo',
        debug: {
          body: req.body,
          file: req.file,
          headers: req.headers
        }
      });
    }

    if (!type) {
      console.log('❌ Falta el tipo de archivo');
      return res.status(400).json({
        success: false,
        message: 'El tipo de archivo es requerido',
        debug: { body: req.body }
      });
    }

    // Verificar que el proyecto existe
    const project = await Project.findByPk(id);
    if (!project) {
      console.log('❌ Proyecto no encontrado:', id);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    console.log('📊 Subiendo a Cloudinary...');
    
    let uploadResult;
    const filePath = req.file.path;
    
    // ✅ Manejo mejorado por tipo de archivo
    try {
      if (req.file.mimetype.startsWith('image/')) {
        uploadResult = await uploadResponsiveImage(filePath, `divanco/projects/${id}`);
        
        // Crear registro en MediaFile
        const mediaFile = await MediaFile.create({
          projectId: id,
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          type: type,
          description: description || '',
          cloudinaryData: uploadResult,
          urls: {
            desktop: uploadResult.desktop.url,
            mobile: uploadResult.mobile.url,
            thumbnail: uploadResult.thumbnail.url
          },
          isMain: isMain === 'true' || isMain === true,
          order: parseInt(order) || 0,
          isActive: true
        });

        console.log('✅ Imagen subida exitosamente');
        return res.status(200).json({
          success: true,
          message: 'Imagen subida correctamente',
          data: mediaFile
        });

      } else if (req.file.mimetype.startsWith('video/')) {
        uploadResult = await uploadOptimizedVideo(filePath, `divanco/projects/${id}`);
        
        const mediaFile = await MediaFile.create({
          projectId: id,
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          type: type,
          description: description || '',
          cloudinaryData: uploadResult,
          urls: { main: uploadResult.url },
          isMain: isMain === 'true' || isMain === true,
          order: parseInt(order) || 0,
          isActive: true
        });

        console.log('✅ Video subido exitosamente');
        return res.status(200).json({
          success: true,
          message: 'Video subido correctamente',
          data: mediaFile
        });

      } else if (req.file.mimetype === 'application/pdf') {
        uploadResult = await uploadDocument(filePath, `divanco/projects/${id}`);
        
        const mediaFile = await MediaFile.create({
          projectId: id,
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          type: type,
          description: description || '',
          cloudinaryData: uploadResult,
          urls: { main: uploadResult.url },
          isMain: false,
          order: parseInt(order) || 0,
          isActive: true
        });

        console.log('✅ PDF subido exitosamente');
        return res.status(200).json({
          success: true,
          message: 'Documento subido correctamente',
          data: mediaFile
        });
      }

    } catch (cloudinaryError) {
      console.error('❌ Error en Cloudinary:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivo a Cloudinary',
        error: cloudinaryError.message
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      debug: {
        body: req.body,
        file: req.file
      }
    });
  }
};

// Eliminar proyecto (soft delete)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // Query param para borrado permanente

    const project = await Project.findByPk(id, {
      include: [{
        model: MediaFile,
        as: 'media'
      }]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Si permanent=true, borrar completamente
    if (permanent === 'true') {
      // Eliminar archivos de media asociados (opcional - Cloudinary los maneja)
      if (project.media && project.media.length > 0) {
        await MediaFile.destroy({
          where: { projectId: id }
        });
      }

      // Borrado permanente del proyecto
      await project.destroy();

      return res.json({
        success: true,
        message: 'Proyecto eliminado permanentemente'
      });
    }

    // Soft delete por defecto
    await project.update({ isActive: false });

    res.json({
      success: true,
      message: 'Proyecto desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proyectos destacados
export const getFeaturedProjects = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const projects = await Project.findAll({
      where: { 
        isActive: true,
        isPublic: true, 
        isFeatured: true 
      },
      include: [{
        model: MediaFile,
        as: 'media',
        where: { isActive: true },
        required: false,
        order: [['isMain', 'DESC'], ['order', 'ASC']]
      }],
      order: [['order', 'ASC'], ['updatedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error obteniendo proyectos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proyectos recientes
export const getRecentProjects = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const projects = await Project.findAll({
      where: { 
        isActive: true,
        isPublic: true
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error obteniendo proyectos recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA FUNCIÓN: Toggle imagen del slider
export const toggleSliderImage = async (req, res) => {
  try {
    const { projectId, mediaId } = req.params;
    
    console.log(`🎠 Toggle slider image - Project: ${projectId}, Media: ${mediaId}`);

    // Verificar que el proyecto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar que la imagen pertenece al proyecto
    const mediaFile = await MediaFile.findOne({
      where: { id: mediaId, projectId: projectId }
    });
    
    if (!mediaFile) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada en este proyecto'
      });
    }

    // Desactivar todas las imágenes del slider para este proyecto
    await MediaFile.update(
      { isSliderImage: false },
      { where: { projectId: projectId } }
    );

    // Activar la imagen seleccionada como imagen del slider
    await mediaFile.update({ isSliderImage: true });

    console.log(`✅ Imagen ${mediaId} marcada como imagen del slider para proyecto ${projectId}`);

    res.json({
      success: true,
      message: 'Imagen del slider actualizada exitosamente',
      data: {
        projectId,
        mediaId,
        isSliderImage: true
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando imagen del slider:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ...existing code...

// ✅ NUEVA FUNCIÓN: Obtener proyecto por ID (para admin)
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Obteniendo proyecto por ID: ${id}`);

    const project = await Project.findOne({
      where: { 
        id: id,
        isActive: true  // Opcional: quitar si quieres ver proyectos inactivos en admin
      },
      include: [
        {
          model: MediaFile,
          as: 'media',
          where: { isActive: true },
          required: false,
          order: [['isMain', 'DESC'], ['order', 'ASC']]
        },
        {
          model: BlogPost,
          as: 'blogPosts',
          required: false,
          order: [['publishedAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Organizar media por tipos (igual que en getProjectBySlug)
    const mediaByType = {
      renders: project.media?.filter(m => m.type === 'render') || [],
      planos: project.media?.filter(m => m.type === 'plano') || [],
      videos: project.media?.filter(m => m.type === 'video') || [],
      obra_proceso: project.media?.filter(m => m.type === 'obra_proceso') || [],
      obra_finalizada: project.media?.filter(m => m.type === 'obra_finalizada') || [],
      otros: project.media?.filter(m => m.type === 'otro') || []
    };

    console.log(`✅ Proyecto encontrado: ${project.title}`);

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        mediaByType
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo proyecto por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ ELIMINAR ARCHIVO DE MEDIA
export const deleteProjectMedia = async (req, res) => {
  try {
    const { projectId, mediaId } = req.params;

    // Verificar que el proyecto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Buscar el archivo de media
    const mediaFile = await MediaFile.findOne({
      where: {
        id: mediaId,
        projectId: projectId
      }
    });

    if (!mediaFile) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de media no encontrado'
      });
    }

    // Eliminar el archivo (soft delete)
    await mediaFile.update({ isActive: false });

    // O eliminación permanente si lo prefieres:
    // await mediaFile.destroy();

    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando archivo de media:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
