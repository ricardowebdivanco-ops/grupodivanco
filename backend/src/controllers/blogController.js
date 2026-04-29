import { BlogPost, User, Project, Subscriber } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages, uploadVideo, deleteVideo } from '../config/cloudinary.js';
import { sendBlogNotification } from '../utils/mailer.js';
import { Op } from 'sequelize';

// Obtener todos los posts del blog
export const getAllBlogPosts = async (req, res) => {
  try {
    const { 
      status,
      project,
      tags,
      featured = false,
      limit = 10,
      page = 1
    } = req.query;

    const whereClause = {};
    
    // Solo aplicar filtro de status si no es 'all' (para admin)
    if (status && status !== 'all') whereClause.status = status;
    if (project) whereClause.projectId = project;
    if (featured === 'true') whereClause.isFeatured = true;
    if (tags) {
      const tagsArray = tags.split(',');
      whereClause.tags = {
        [Op.overlap]: tagsArray
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: posts } = await BlogPost.findAndCountAll({
      where: whereClause,
      include: [
        
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug', 'year'],
          required: false
        }
      ],
      order: [
        ['isFeatured', 'DESC'],
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo posts del blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener post por slug
// Obtener un post del blog por slug (público)
export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.query; // permite filtrar opcionalmente

    const whereClause = { slug };
    if (status && status !== 'all') whereClause.status = status;

    const post = await BlogPost.findOne({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug', 'year'],
          required: false
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Incrementar contador de vistas solo si está publicado
    if (post.status === 'published') {
      await post.increment('viewCount');
    }

    // Obtener posts relacionados solo si está publicado
    let relatedPosts = [];
    if (post.status === 'published') {
      relatedPosts = await BlogPost.findAll({
        where: {
          id: { [Op.ne]: post.id },
          status: 'published',
          
        },
        limit: 3,
        order: [['publishedAt', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });
  } catch (error) {
    console.error('Error obteniendo post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un post del blog por ID (para edición - requiere autenticación)
export const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [BACKEND] Buscando post por ID:', id);

    const post = await BlogPost.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug', 'year'],
          required: false
        }
      ]
    });

    if (!post) {
      console.warn('❌ [BACKEND] Post no encontrado para ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    console.log('✅ [BACKEND] Post encontrado:', post.title);
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('❌ [BACKEND] Error obteniendo post por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      author,
      content,
      slug,
      excerpt,
      projectId,
      tags = [],
      status = 'draft',
      isFeatured = false,
      publishedAt,
      metaTitle,
      metaDescription,
      featuredImage,
      images,
      videos
    } = req.body;

    console.log('🔍 [BACKEND] createBlogPost - datos recibidos:', {
      title: title?.substring(0, 50),
      author,
      contentLength: Array.isArray(content) ? content.length : 'no array',
      slug,
      excerpt: excerpt?.substring(0, 50),
      projectId,
      tags,
      status,
      isFeatured,
      metaTitle: metaTitle?.substring(0, 30),
      metaDescription: metaDescription?.substring(0, 50),
      hasFeaturedImage: !!featuredImage,
      featuredImageType: typeof featuredImage,
      featuredImageValue: featuredImage ? JSON.stringify(featuredImage).substring(0, 200) : 'null',
      imagesCount: Array.isArray(images) ? images.length : 0,
      videosCount: Array.isArray(videos) ? videos.length : 0
    });

    // Validaciones básicas
    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido y debe tener al menos 5 caracteres'
      });
    }

    // Validación para array de bloques
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido es requerido y debe tener al menos un bloque.'
      });
    }
    
    // Al menos un bloque de texto con más de 10 caracteres
    const hasValidTextBlock = content.some(
      block => block.type === 'text' && typeof block.value === 'string' && block.value.trim().length >= 10
    );
    if (!hasValidTextBlock) {
      return res.status(400).json({
        success: false,
        message: 'El contenido debe incluir al menos un bloque de texto con 10 caracteres o más.'
      });
    }

    // Generar slug si no se proporciona
    let finalSlug = slug;
    if (!finalSlug || finalSlug.trim().length === 0) {
      finalSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Asegurar que el slug sea único
      const existingPost = await BlogPost.findOne({ where: { slug: finalSlug } });
      if (existingPost) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    console.log('🔍 [BACKEND] Slug generado:', finalSlug);
    
    // Verificar proyecto si se especifica
    if (projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'El proyecto especificado no existe'
        });
      }
    }

    // Crear el post
    const postData = {
      slug: finalSlug,
      title: title.trim(),
      author: author?.trim() || null,
      content, // array de bloques
      excerpt: excerpt?.trim(),
      projectId: projectId || null,
      tags: Array.isArray(tags) ? tags : [],
      status,
      isFeatured: Boolean(isFeatured),
      publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      featuredImage: featuredImage || null,
      images: Array.isArray(images) ? images : [],
      videos: Array.isArray(videos) ? videos : []
    };

    console.log('🔍 [BACKEND] Creando post con datos:', postData);

    const post = await BlogPost.create(postData);

    // ✅ FIX: Forzar actualización de featuredImage si se proporcionó
    // El usuario reporta que "update" funciona pero "create" a veces falla con el JSON
    if (featuredImage) {
      console.log('🔄 [BACKEND] Forzando persistencia de featuredImage post-creación...');
      await post.update({ featuredImage });
      console.log('✅ [BACKEND] featuredImage actualizada correctamente.');
    }

    // Recargar con relaciones
    await post.reload({
      include: [
        
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ]
    });

    // Si se publica, enviar notificaciones a suscriptores
    if (status === 'published') {
      try {
        const subscribers = await Subscriber.findAll({
          where: { isActive: true }
        });
        
        if (subscribers.length > 0) {
          await sendBlogNotification(subscribers, post);
        }
      } catch (emailError) {
        console.warn('Error enviando notificaciones:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: post
    });
  } catch (error) {
    console.error('❌ [BACKEND] Error creando post:', error);
    console.error('❌ [BACKEND] Error name:', error.name);
    console.error('❌ [BACKEND] Error message:', error.message);
    console.error('❌ [BACKEND] Error stack:', error.stack);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un post con ese título o slug'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación: ' + validationErrors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// Actualizar post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`🔍 [BACKEND] updateBlogPost ID: ${id} - Datos recibidos:`, {
      title: updateData.title?.substring(0, 30),
      hasFeaturedImage: !!updateData.featuredImage,
      featuredImageType: typeof updateData.featuredImage,
      featuredImageValue: updateData.featuredImage ? JSON.stringify(updateData.featuredImage).substring(0, 200) : 'null'
    });

    // Si projectId viene como string vacío, convertir a null
    if (updateData.projectId === '') {
      updateData.projectId = null;
    }

    // Si se envía featuredImageIndex, copiar la imagen correspondiente
    if (
      typeof updateData.featuredImageIndex !== 'undefined' &&
      updateData.images &&
      Array.isArray(updateData.images)
    ) {
      const idx = parseInt(updateData.featuredImageIndex);
      if (!isNaN(idx) && idx >= 0 && idx < updateData.images.length) {
        updateData.featuredImage = updateData.images[idx];
      }
      // Elimina el índice del update para no guardarlo en la DB
      delete updateData.featuredImageIndex;
    }

    const post = await BlogPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Validaciones robustas solo sobre los campos enviados
    if (updateData.title && updateData.title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'El título debe tener al menos 5 caracteres'
      });
    }

    if (updateData.content) {
      if (!Array.isArray(updateData.content) || updateData.content.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El contenido debe ser un array de bloques y tener al menos un bloque.'
        });
      }
      const hasValidTextBlock = updateData.content.some(
        block => block.type === 'text' && typeof block.value === 'string' && block.value.trim().length >= 10
      );
      if (!hasValidTextBlock) {
        return res.status(400).json({
          success: false,
          message: 'El contenido debe incluir al menos un bloque de texto con 10 caracteres o más.'
        });
      }
    }

    if (typeof updateData.author !== 'undefined' && updateData.author !== null) {
      if (typeof updateData.author !== 'string' || updateData.author.trim().length === 0) {
        updateData.author = null;
      } else {
        updateData.author = updateData.author.trim();
      }
    }

    if (typeof updateData.excerpt !== 'undefined' && updateData.excerpt !== null) {
      updateData.excerpt = updateData.excerpt.trim();
    }

    if (typeof updateData.metaTitle !== 'undefined' && updateData.metaTitle !== null) {
      updateData.metaTitle = updateData.metaTitle.trim();
    }

    if (typeof updateData.metaDescription !== 'undefined' && updateData.metaDescription !== null) {
      updateData.metaDescription = updateData.metaDescription.trim();
    }

    // Si se está publicando por primera vez
    const wasUnpublished = post.status !== 'published';
    const willBePublished = updateData.status === 'published';

    if (willBePublished && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await post.update(updateData);

    // Recargar con relaciones
    await post.reload({
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ]
    });

    // Si se publica por primera vez, enviar notificaciones
    if (wasUnpublished && willBePublished) {
      try {
        const subscribers = await Subscriber.findAll({
          where: { isActive: true }
        });
        if (subscribers.length > 0) {
          await sendBlogNotification(subscribers, post);
        }
      } catch (emailError) {
        console.warn('Error enviando notificaciones:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: post
    });
  } catch (error) {
    console.error('Error actualizando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen destacada (standalone)
export const uploadFeaturedImage = async (req, res) => {
  try {
    console.log('[BACKEND] uploadFeaturedImage iniciado');
    console.log('[BACKEND] req.file:', req.file);
    console.log('[BACKEND] req.body:', req.body);
    
    if (!req.file) {
      console.warn('[BACKEND] No se proporcionó ningún archivo');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Usar la función uploadResponsiveImage de Cloudinary
    const results = await uploadResponsiveImage(req.file.path, 'blog-featured');

    console.log('[BACKEND] Imagen destacada subida exitosamente:', results);

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      ...results
    });

  } catch (error) {
    console.error('[BACKEND] Error en uploadFeaturedImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen para post
export const uploadBlogPostImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'featured' } = req.body; // 'featured' o 'gallery'

    // Soportar tanto single como multiple
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    console.log('[BACKEND] uploadBlogPostImage - Archivos recibidos:', files.length);
    console.log('[BACKEND] req.files:', req.files);
    console.log('[BACKEND] req.body:', req.body);
    
    if (!files.length) {
      console.warn('[BACKEND] No se proporcionó ningún archivo');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Si no hay ID, es una subida independiente (para imagen destacada antes de crear el post)
    if (!id || id === 'new') {
      console.log('[BACKEND] Subiendo imagen sin post específico');
      const folder = `blog/${new Date().getFullYear()}/uploads`;
      const file = files[0]; // Solo tomar el primer archivo
      const imageResult = await uploadResponsiveImage(file.path, folder);
      
      return res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: imageResult,
        // Para compatibilidad con el frontend
        desktop: imageResult.desktop,
        mobile: imageResult.mobile,
        url: imageResult.desktop || imageResult.url
      });
    }

    const post = await BlogPost.findByPk(id);
    if (!post) {
      console.warn('[BACKEND] Post no encontrado para id:', id);
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const folder = `blog/${new Date().getFullYear()}/${post.slug}`;
    let newImages = [];
    for (const file of files) {
      const img = await uploadResponsiveImage(file.path, folder);
      newImages.push(img);
    }

    let updateData = {};
    if (type === 'featured') {
      // Solo tomar la primera imagen
      console.log('[BACKEND] Guardando como imagen destacada:', newImages[0]);
      if (post.featuredImage) {
        try {
          await deleteResponsiveImages(post.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen anterior:', deleteError);
        }
      }
      updateData.featuredImage = newImages[0];
    } else if (type === 'gallery') {
      // Acumular todas las imágenes nuevas
      const currentImages = post.images || [];
      console.log('[BACKEND] Agregando a galería. Imágenes actuales:', currentImages.length, 'Nuevas:', newImages.length);
      updateData.images = [...currentImages, ...newImages];
    }

    console.log('[BACKEND] updateData a guardar:', updateData);
    await post.update(updateData);

    res.json({
      success: true,
      message: 'Imagen(es) subida(s) exitosamente',
      data: {
        post: post,
        newImages: newImages
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

// Subir video para post
export const uploadBlogPostVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo de video'
      });
    }

    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Subir video a Cloudinary
    const folder = `blog/${new Date().getFullYear()}/${post.slug}/videos`;
    const videoResult = await uploadVideo(req.file.path, folder);

    const videoData = {
      id: Date.now().toString(),
      title: title || 'Video',
      description: description || '',
      url: videoResult.secure_url,
      publicId: videoResult.public_id,
      duration: videoResult.duration,
      format: videoResult.format,
      uploadedAt: new Date().toISOString()
    };

    // Agregar video a la lista
    const currentVideos = post.videos || [];
    const updateData = {
      videos: [...currentVideos, videoData]
    };

    await post.update(updateData);

    res.json({
      success: true,
      message: 'Video subido exitosamente',
      data: {
        post: post,
        newVideo: videoData
      }
    });
  } catch (error) {
    console.error('Error subiendo video:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar imagen de galería
export const deleteBlogPostImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    if (imageId === 'featured') {
      // Eliminar imagen destacada
      if (post.featuredImage) {
        try {
          await deleteResponsiveImages(post.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
      }
      await post.update({ featuredImage: null });
    } else {
      // Eliminar de galería
      const currentImages = post.images || [];
      const imageIndex = parseInt(imageId);
      
      if (imageIndex >= 0 && imageIndex < currentImages.length) {
        const imageToDelete = currentImages[imageIndex];
        
        try {
          await deleteResponsiveImages(imageToDelete);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
        
        const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
        await post.update({ images: updatedImages });
      }
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar video
export const deleteBlogPostVideo = async (req, res) => {
  try {
    const { id, videoId } = req.params;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const currentVideos = post.videos || [];
    const videoIndex = currentVideos.findIndex(video => video.id === videoId);
    
    if (videoIndex !== -1) {
      const videoToDelete = currentVideos[videoIndex];
      
      try {
        await deleteVideo(videoToDelete.publicId);
      } catch (deleteError) {
        console.warn('Error eliminando video:', deleteError);
      }
      
      const updatedVideos = currentVideos.filter(video => video.id !== videoId);
      await post.update({ videos: updatedVideos });
    }

    res.json({
      success: true,
      message: 'Video eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando video:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Eliminar imágenes de Cloudinary
    if (post.featuredImage) {
      try {
        await deleteResponsiveImages(post.featuredImage);
      } catch (deleteError) {
        console.warn('Error eliminando imagen destacada:', deleteError);
      }
    }

    if (post.images && post.images.length > 0) {
      try {
        for (const imageSet of post.images) {
          await deleteResponsiveImages(imageSet);
        }
      } catch (deleteError) {
        console.warn('Error eliminando galería:', deleteError);
      }
    }

    // Eliminar post de la base de datos
    await post.destroy();

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener posts destacados
export const getFeaturedBlogPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await BlogPost.findAll({
      where: { 
        status: 'published',
        isFeatured: true 
      },
      include: [
       
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error obteniendo posts destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener posts recientes
export const getRecentBlogPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await BlogPost.findAll({
      where: { status: 'published' },
      
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error obteniendo posts recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVO: Obtener proyectos disponibles para relacionar con blog posts
export const getAvailableProjects = async (req, res) => {
  try {
    const { limit = 50, search } = req.query;

    const whereClause = {
      isActive: true,
      isPublic: true
    };

    // Búsqueda opcional por título
    if (search) {
      whereClause.title = {
        [Op.iLike]: `%${search}%`
      };
    }

    const projects = await Project.findAll({
      where: whereClause,
      attributes: ['id', 'title', 'slug', 'year', 'location', 'projectType'],
      order: [['year', 'DESC'], ['title', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error obteniendo proyectos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
