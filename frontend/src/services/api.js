import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query con autenticación automática
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // ✅ CRÍTICO: Solo establecer JSON para requests que NO son FormData
    // Si no establecemos content-type, el navegador lo hará automáticamente
    // Para FormData será: multipart/form-data; boundary=...
    // Para JSON será: application/json (si lo establecemos explícitamente)
    
    // NO establecer content-type aquí - deja que RTK Query y el navegador lo manejen
    // headers.set('content-type', 'application/json'); // ❌ REMOVER ESTA LÍNEA
    
    return headers;
  },
});

// Base query con manejo de errores y re-autenticación  
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // ✅ AGREGAR: Establecer content-type solo para JSON
  if (args && typeof args === 'object' && args.body && !(args.body instanceof FormData)) {
    // Solo para requests con body que NO son FormData
    if (!args.headers) args.headers = {};
    args.headers['content-type'] = 'application/json';
  }
  
  try {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
      // Token expirado o no autorizado
      api.dispatch({ type: 'auth/logout' });
      
      // Redirigir a página de no autorizado
      // Usar setTimeout para evitar problemas de sincronización
      setTimeout(() => {
        window.location.href = '/no-autorizado';
      }, 100);
    }
    
    return result;
  } catch (error) {
    // Manejar errores de red y otros errores inesperados
    console.error('[API] Error en baseQueryWithReauth:', error);
    return {
      error: {
        status: 'CUSTOM_ERROR',
        data: { message: 'Error de conexión con el servidor' },
        error: error.message
      }
    };
  }
};

// API base para todas las queries
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Auth', 
    'Category', 
    'Subcategory', 
    'Product', // ✅ Agregar Product
    'Project', 
    'BlogPost', 
    'Subscriber',
    'ProjectMedia', // ✅ Agregar este tag type
    'FilterOptions' // ✅ Agregar este tag type
  ],
  endpoints: () => ({}),
});
