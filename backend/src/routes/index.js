import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import productRoutes from './productRoutes.js'; // ← Ya lo tienes importado
import projectRoutes from './projectRoutes.js';
import blogRoutes from './blogRoutes.js';
import subscriberRoutes from './subscriberRoutes.js';
import searchRoutes from './searchRoutes.js';
import syncRoutes from './syncRoutes.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas del showroom
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/products', productRoutes); // ← Agregar esta línea

// Rutas de proyectos
router.use('/projects', projectRoutes);

// Rutas del blog
router.use('/blog', blogRoutes);

// Rutas de suscriptores
router.use('/subscribers', subscriberRoutes);

// Rutas de búsqueda
router.use('/search', searchRoutes);

// Rutas de sincronización (temporal)
router.use('/sync', syncRoutes);

// Ruta de información del API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Divanco - Estudio de Arquitectura',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      categories: '/categories',
      subcategories: '/subcategories',
      products: '/products', // ← Agregar al listado de endpoints
      projects: '/projects',
      blog: '/blog',
      subscribers: '/subscribers',
      search: '/search',
      sync: '/sync (temporal)'
    }
  });
});

export default router;