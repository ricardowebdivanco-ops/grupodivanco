import { baseApi } from '../../services/api.js';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener todas las categorías
    getCategories: builder.query({
      query: ({ limit = 20, page = 1, active = true, includeSubcategories = true } = {}) => 
        `/categories?limit=${limit}&page=${page}&active=${active}&includeSubcategories=${includeSubcategories}`,
      providesTags: ['Category'],
    }),

    // Categorías para la homepage
    getFeaturedCategories: builder.query({
      query: (limit = 8) => `/categories/featured?limit=${limit}`,
      providesTags: ['Category'],
    }),

    // Obtener categoría por slug con subcategorías
    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Category', id: slug },
        'Subcategory'
      ],
    }),

    // Admin: Crear categoría
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    // Admin: Actualizar categoría
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'Category'
      ],
    }),

    // Admin: Subir imagen a categoría (por ID)
    uploadCategoryImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/categories/${id}/upload-image`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'Category'
      ],
    }),

    // Admin: Eliminar categoría
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        'Category'
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryImageMutation,
  useDeleteCategoryMutation,
} = categoriesApi;