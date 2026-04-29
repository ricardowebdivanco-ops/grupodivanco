import { useState, useCallback } from 'react';
import { 
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetProductsBySubcategoryQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
  useDeleteProductMutation,
} from './productsApi';

// Hook para obtener productos con filtros
export const useProducts = (filters = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useGetProductsQuery(filters);

  return {
    products: data?.products || [],
    totalProducts: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    error,
    refetch
  };
};

// Hook para obtener producto por slug
export const useProduct = (slug) => {
  const result = useGetProductBySlugQuery(slug, {
    skip: !slug,
    // Temporal: Forzar refetch para debugging
    refetchOnMountOrArgChange: true,
  });

  console.log('🎣 useProduct Hook Debug:');
  console.log('  Slug:', slug);
  console.log('  Raw result:', result);
  console.log('  Product data:', result.data);
  console.log('  Product type:', typeof result.data);
  console.log('  Product keys:', result.data ? Object.keys(result.data) : 'no data');
  console.log('  Images:', result.data?.images);
  console.log('  Price:', result.data?.price);
  console.log('  Is loading:', result.isLoading);
  console.log('  Error:', result.error);

  return {
    product: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
};

// Hook para productos destacados
export const useFeaturedProducts = (limit = 8) => {
  const {
    data: products,
    isLoading,
    error
  } = useGetFeaturedProductsQuery(limit);

  return {
    products: products || [],
    isLoading,
    error
  };
};

// Hook para productos por subcategoría
export const useProductsBySubcategory = (subcategorySlug, options = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useGetProductsBySubcategoryQuery(
    { subcategorySlug, ...options },
    { skip: !subcategorySlug }
  );

  return {
    products: data?.products || [],
    totalProducts: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    subcategory: data?.subcategory || null,
    isLoading,
    error,
    refetch
  };
};

// Hook para manejar CRUD de productos (Admin)
export const useProductManager = () => {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  const [deleteImage, { isLoading: isDeletingImage }] = useDeleteProductImageMutation();

  const handleCreateProduct = useCallback(async (productData) => {
    try {
      const result = await createProduct(productData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Error al crear producto' };
    }
  }, [createProduct]);

  const handleUpdateProduct = useCallback(async (id, productData) => {
    try {
      const result = await updateProduct({ id, ...productData }).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Error al actualizar producto' };
    }
  }, [updateProduct]);

  const handleDeleteProduct = useCallback(async (id) => {
    try {
      await deleteProduct(id).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Error al eliminar producto' };
    }
  }, [deleteProduct]);

  const handleUploadImage = useCallback(async (productId, files) => {
    try {
      const formData = new FormData();
      
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('image', file));
      } else {
        formData.append('image', files);
      }

      const result = await uploadImage({ id: productId, formData }).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Error al subir imágenes' };
    }
  }, [uploadImage]);

  const handleDeleteImage = useCallback(async (productId, imageId) => {
    try {
      await deleteImage({ id: productId, imageId }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Error al eliminar imagen' };
    }
  }, [deleteImage]);

  return {
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    uploadImage: handleUploadImage,
    deleteImage: handleDeleteImage,
    isCreating,
    isUpdating,
    isDeleting,
    isUploading,
    isDeletingImage
  };
};

// Hook para filtros de productos
export const useProductFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    subcategoryId: null,
    categoryId: null,
    featured: undefined,
    isNew: undefined,
    brand: '',
    sortBy: 'order',
    sortOrder: 'ASC',
    ...initialFilters
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when multiple filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      subcategoryId: null,
      categoryId: null,
      featured: undefined,
      isNew: undefined,
      brand: '',
      sortBy: 'order',
      sortOrder: 'ASC'
    });
  }, []);

  const setPage = useCallback((page) => {
    updateFilter('page', page);
  }, [updateFilter]);

  const setSearch = useCallback((search) => {
    updateFilter('search', search);
  }, [updateFilter]);

  const setCategory = useCallback((categoryId) => {
    updateFilters({ categoryId, subcategoryId: null });
  }, [updateFilters]);

  const setSubcategory = useCallback((subcategoryId) => {
    updateFilter('subcategoryId', subcategoryId);
  }, [updateFilter]);

  const setSorting = useCallback((sortBy, sortOrder = 'ASC') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    setPage,
    setSearch,
    setCategory,
    setSubcategory,
    setSorting
  };
};

// Hook para obtener productos por categoría
export const useProductsByCategory = (categorySlug, options = {}) => {
  const {
    page = 1,
    limit = 12,
    sortBy = 'order',
    sortOrder = 'ASC'
  } = options;

  const result = useGetProductsByCategoryQuery({
    categorySlug,
    page,
    limit,
    sortBy,
    sortOrder
  }, {
    skip: !categorySlug
  });

  return {
    products: result.data?.products || [],
    category: result.data?.category || null,
    pagination: {
      total: result.data?.total || 0,
      totalPages: result.data?.totalPages || 0,
      currentPage: result.data?.currentPage || 1,
    },
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
};
