// ========================
// API Endpoints Registration
// ========================
// Este archivo asegura que todos los endpoints de RTK Query se registren correctamente

// Importar todas las APIs que extienden baseApi para registrar sus endpoints
import '../features/categories/categoriesApi';
import '../features/subcategories/subcategoriesApi';  
import '../features/products/productsApi';

// Esto es necesario para que RTK Query registre todos los endpoints
// que extienden baseApi usando injectEndpoints

export { baseApi } from './api';
