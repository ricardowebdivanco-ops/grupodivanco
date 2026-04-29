import express from 'express';
import multer from 'multer';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadBlogPostImage,
  uploadFeaturedImage,
  uploadBlogPostVideo,
  deleteBlogPostImage,
  deleteBlogPostVideo,
  getFeaturedBlogPosts,
  getRecentBlogPosts,
  getAvailableProjects
} from '../controllers/blogController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Configuración de multer para subida de archivos
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo para videos
  },
  fileFilter: (req, file, cb) => {
    // Aceptar imágenes y videos para el blog
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen o video'), false);
    }
  }
});

// Configuración específica para imágenes
const uploadImage = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB máximo para imágenes
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configuración específica para videos
const uploadVideo = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo para videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video'), false);
    }
  }
});

// Rutas públicas
router.get('/', getAllBlogPosts);
router.get('/featured', getFeaturedBlogPosts);
router.get('/recent', getRecentBlogPosts);

// ✅ NUEVA: Ruta para obtener proyectos disponibles (protegida para admin)
router.get('/available-projects', authenticateToken, requireRole(['admin']), getAvailableProjects);

// Ruta protegida para obtener por ID (para edición)
router.get('/id/:id', authenticateToken, requireRole(['admin']), getBlogPostById);

// Ruta pública para obtener por slug (debe ir al final para evitar conflictos)
router.get('/:slug', getBlogPostBySlug);

// Rutas protegidas (solo autores y admins pueden crear/editar)
router.post('/', authenticateToken, requireRole(['admin']), createBlogPost);
router.put('/:id', authenticateToken, requireRole(['admin']), updateBlogPost);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteBlogPost);

// Ruta específica para subir imagen destacada
router.post('/upload-featured-image', 
  authenticateToken, 
  requireRole(['admin']), 
  uploadImage.single('image'), 
  uploadFeaturedImage
);

// Middleware dinámico para aceptar single o array de imágenes
function dynamicImageUpload(req, res, next) {
  uploadImage.any()(req, res, next);
}

router.post('/:id/upload-image', 
  authenticateToken, 
  requireRole(['admin']), 
  dynamicImageUpload, 
  uploadBlogPostImage
);

router.post('/:id/upload-video', 
  authenticateToken, 
  requireRole(['admin']), 
  uploadVideo.single('video'), 
  uploadBlogPostVideo
);

// Eliminación de archivos
router.delete('/:id/images/:imageId', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteBlogPostImage
);

router.delete('/:id/videos/:videoId', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteBlogPostVideo
);

export default router;
