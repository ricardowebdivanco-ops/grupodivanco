import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsBySubcategory,
  getProductsByCategory,
  uploadProductImage,
  deleteProductImage,
  fixProductCurrency
} from '../controllers/productController.js';

const router = express.Router();

// Configuración de multer para subida de archivos
const upload = multer({ 
  dest: 'uploads/temp/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite por archivo
    files: 10 // Máximo 10 archivos por vez
  }
});

// ====================================
// RUTAS PÚBLICAS
// ====================================

// Obtener todos los productos con filtros
router.get('/', getProducts);

// Obtener productos destacados
router.get('/featured', getFeaturedProducts);

// Obtener productos por categoría (slug)
router.get('/category/:categorySlug', getProductsByCategory);

// Obtener productos por subcategoría (slug)
router.get('/subcategory/:subcategorySlug', getProductsBySubcategory);

// Obtener producto específico por slug
router.get('/:slug', getProductBySlug);

// ====================================
// RUTAS ADMINISTRATIVAS
// ====================================

// Endpoint de mantenimiento: Actualizar moneda de productos a COP
router.post('/admin/fix-currency', fixProductCurrency);

// Crear nuevo producto
router.post('/', createProduct);

// Actualizar producto
router.put('/:id', updateProduct);

// Subir imágenes de producto
router.post('/:id/upload-image', 
  upload.array('image', 10), // Permite hasta 10 imágenes
  uploadProductImage
);

// Eliminar imagen específica
router.delete('/:id/images/:imageId', deleteProductImage);

// Eliminar producto
router.delete('/:id', deleteProduct);

export default router;
