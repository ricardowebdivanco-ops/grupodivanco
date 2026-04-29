import { baseApi } from '../../services/api.js';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener posts del blog
    getBlogPosts: builder.query({
      query: ({ limit = 10, page = 1, featured } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
        });
        
        if (featured !== undefined) params.append('featured', featured.toString());
        
        
        return `/blog?${params}`;
      },
      providesTags: ['BlogPost'],
      transformResponse: (response) => {
        console.log('getBlogPosts response:', response);
        return response;
      }
    }),

    // Posts destacados para homepage
    getFeaturedBlogPosts: builder.query({
      query: (limit = 3) => `/blog/featured?limit=${limit}`,
      providesTags: ['BlogPost'],
      transformResponse: (response) => {
        console.log('getFeaturedBlogPosts response:', response);
        return response;
      }
    }),

    // Posts recientes
    getRecentBlogPosts: builder.query({
      query: (limit = 5) => `/blog/recent?limit=${limit}`,
      providesTags: ['BlogPost'],
      transformResponse: (response) => {
        console.log('getRecentBlogPosts response:', response);
        return response;
      }
    }),

    // Obtener post por slug
    getBlogPostBySlug: builder.query({
      query: (slug) => `/blog/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'BlogPost', id: slug }
      ],
    }),

    // Admin: Obtener post por ID (para edición)
    getBlogPostById: builder.query({
      query: (id) => `/blog/id/${id}`,
      providesTags: (result, error, id) => [
        { type: 'BlogPost', id: id }
      ],
    }),

    // Posts relacionados
    getRelatedBlogPosts: builder.query({
      query: ({ slug, limit = 3 }) => `/blog/${slug}/related?limit=${limit}`,
      providesTags: ['BlogPost'],
    }),

    // Admin: Crear post
    createBlogPost: builder.mutation({
      query: (postData) => ({
        url: '/blog',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['BlogPost'],
    }),

    // Admin: Actualizar post
    updateBlogPost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/blog/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogPost', id: id },
        'BlogPost'
      ],
    }),

    // ✅ NUEVO: Admin - Subir imagen destacada (independiente, sin post creado)
    uploadFeaturedImage: builder.mutation({
      query: (formData) => ({
        url: '/blog/upload-featured-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Admin: Subir imagen a post
    uploadBlogPostImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blog/${id}/upload-image`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogPost', id: id }
      ],
    }),

    // Admin: Subir video a post
    uploadBlogPostVideo: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blog/${id}/upload-video`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogPost', id: id }
      ],
    }),

    // Admin: Eliminar post
    deleteBlogPost: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BlogPost'],
    }),

    // Admin: Eliminar imagen de post
    deleteBlogPostImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/blog/${id}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogPost', id: id }
      ],
    }),

    // Admin: Eliminar video de post
    deleteBlogPostVideo: builder.mutation({
      query: ({ id, videoId }) => ({
        url: `/blog/${id}/videos/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogPost', id: id }
      ],
    }),

    // ✅ NUEVO: Admin - Obtener proyectos disponibles para relacionar
    getAvailableProjects: builder.query({
      query: ({ search, limit = 50 } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString()
        });
        
        if (search) params.append('search', search);
        
        return `/blog/available-projects?${params}`;
      },
      providesTags: ['Project'],
      keepUnusedDataFor: 300, // 5 minutos de cache
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetFeaturedBlogPostsQuery,
  useGetRecentBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useGetBlogPostByIdQuery,
  useGetRelatedBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUploadFeaturedImageMutation, // ✅ NUEVO HOOK
  useUploadBlogPostImageMutation,
  useUploadBlogPostVideoMutation,
  useDeleteBlogPostMutation,
  useDeleteBlogPostImageMutation,
  useDeleteBlogPostVideoMutation,
  useGetAvailableProjectsQuery, // ✅ NUEVO HOOK
} = blogApi;