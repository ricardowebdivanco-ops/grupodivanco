import express from 'express';
import multer from 'multer';
import {
  getAllProjects,
  getProjectsByYear,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
  getSliderProjects,
  toggleSliderImage,     // ✅ NUEVA FUNCIÓN
  searchProjects,
  getFilterOptions,
  getSearchSuggestions,
  uploadProjectMedia,
  deleteProjectMedia,    // ✅ AGREGAR ESTA LÍNEA
  testProjectCreation,
  debugCreateProject
} from '../controllers/projectController.js';

import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// ✅ Configuración de multer actualizada para diferentes tipos de media
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // ✅ Aumentado a 50MB para videos
  },
  fileFilter: (req, file, cb) => {
    // ✅ Expandir tipos permitidos para el nuevo sistema MediaFile
    const allowedTypes = [
      // Imágenes
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Documentos
      'application/pdf',
      'application/zip'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// ✅ RUTAS PÚBLICAS (ordenadas para evitar conflictos)
// Rutas específicas primero (antes de parámetros dinámicos)
router.get('/search', searchProjects);              // ✅ Nueva
router.get('/filter-options', getFilterOptions);    // ✅ Nueva
router.get('/suggestions', getSearchSuggestions);   // ✅ Nueva
router.get('/featured', getFeaturedProjects);
router.get('/slider', getSliderProjects);           // ✅ Nueva
router.get('/year/:year', getProjectsByYear);

// ✅ RUTAS DE DEBUG TEMPORALES
router.get('/debug/test-creation', testProjectCreation);
router.post('/debug/create', debugCreateProject);
// Ruta general (debe ir después de las específicas)
router.get('/', getAllProjects);

// Ruta con parámetro dinámico (debe ir al final)
router.get('/:slug', getProjectBySlug);

router.get('/admin/:id', 
  authenticateToken, 
  requireRole(['admin', 'editor']), 
  getProjectById
);

// ✅ RUTAS PROTEGIDAS (para administradores)
// CRUD básico
router.post('/', authenticateToken, requireRole(['admin']), createProject);
router.put('/:id', authenticateToken, requireRole(['admin']), updateProject);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteProject);

// ✅ Nueva ruta para subir archivos multimedia (reemplaza upload-image)
router.post('/:id/media', 
  (req, res, next) => {
    console.log('🔍 Headers:', req.headers);
    console.log('🔍 Content-Type:', req.get('Content-Type'));
    next();
  },
  authenticateToken, 
  requireRole(['admin']), 
  (req, res, next) => {
    console.log('✅ Auth passed, procesando multer...');
    next();
  },
  upload.single('file'), // ✅ Cambio de 'image' a 'file'
  (req, res, next) => {
    console.log('✅ Multer procesado, archivo:', req.file);
    console.log('✅ Body:', req.body);
    next();
  },
  uploadProjectMedia     // ✅ Nueva función
);

// ✅ NUEVA RUTA: Toggle imagen del slider
router.put('/:projectId/media/:mediaId/slider-toggle', 
  authenticateToken, 
  requireRole(['admin', 'editor']), 
  toggleSliderImage
);

// ✅ NUEVA RUTA: Eliminar archivo de media
router.delete('/:projectId/media/:mediaId', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteProjectMedia
);

export default router;