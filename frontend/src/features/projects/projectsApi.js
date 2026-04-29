import { baseApi } from '../../services/api.js';

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ✅ ENDPOINT PRINCIPAL UNIFICADO - Obtener proyectos con filtros
    getProjects: builder.query({
      query: (params = {}) => {
        const {
          // Paginación
          limit = 12,
          page = 1,
          // Filtros básicos
          search,
          projectType,
          etapa,
          year,
          location,
          client,
          architect,
          tags,
          // Flags
          featured,
          publicOnly = true,
          // Ordenamiento
          sortBy = 'updatedAt',
          sortOrder = 'DESC'
        } = params;

        const searchParams = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          publicOnly: publicOnly.toString(),
          sortBy,
          sortOrder
        });
        
        // Agregar parámetros opcionales solo si existen
        if (search) searchParams.append('search', search);
        if (projectType) searchParams.append('projectType', projectType);
        if (etapa) searchParams.append('etapa', etapa);
        if (year) searchParams.append('year', year.toString());
        if (location) searchParams.append('location', location);
        if (client) searchParams.append('client', client);
        if (architect) searchParams.append('architect', architect);
        if (featured !== undefined) searchParams.append('featured', featured.toString());
        
        if (tags) {
          const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
          searchParams.append('tags', tagsString);
        }
        
        return `/projects?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Project', id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    // ✅ BÚSQUEDA ESPECÍFICA (si tu backend tiene endpoint separado)
    searchProjects: builder.query({
      query: ({ query, type = 'all', limit = 10 }) => {
        const params = new URLSearchParams({
          q: query,
          type,
          limit: limit.toString()
        });
        return `/projects/search?${params}`;
      },
      // Cache corto para búsquedas
      keepUnusedDataFor: 30, // 30 segundos
      providesTags: ['Project'],
    }),

    // ✅ OPCIONES DE FILTROS
    getFilterOptions: builder.query({
      query: () => '/projects/filter-options',
      providesTags: ['FilterOptions'],
      // Cache largo para opciones (cambian poco)
      keepUnusedDataFor: 300, // 5 minutos
    }),

    // ✅ SUGERENCIAS DE BÚSQUEDA
    getSearchSuggestions: builder.query({
      query: ({ query, limit = 5 }) => {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString()
        });
        return `/projects/suggestions?${params}`;
      },
      // No cachear sugerencias
      keepUnusedDataFor: 0,
    }),

    // ✅ PROYECTOS ESPECÍFICOS
    // Proyectos destacados
    getFeaturedProjects: builder.query({
      query: (limit = 6) => `/projects/featured?limit=${limit}`,
      providesTags: ['Project'],
      keepUnusedDataFor: 180, // 3 minutos
    }),

    // ✅ NUEVO: Proyectos para slider
    getSliderProjects: builder.query({
      query: (limit = 5) => `/projects/slider?limit=${limit}`,
      providesTags: ['Project', 'SliderProjects'],
      keepUnusedDataFor: 300, // 5 minutos - cache más largo
    }),

    // Proyectos por año (si existe endpoint específico)
    getProjectsByYear: builder.query({
      query: (year) => `/projects/year/${year}`,
      providesTags: ['Project'],
    }),

    // Proyecto individual por slug
    getProjectBySlug: builder.query({
      query: (slug) => `/projects/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Project', id: slug },
        { type: 'Project', id: result?.id }
      ],
    }),

    getProjectById: builder.query({
  query: (id) => `/projects/admin/${id}`,
  providesTags: (result, error, id) => [
    { type: 'Project', id },
  ],
}),


    // ✅ PROYECTOS RECIENTES (usando endpoint existente)
    getRecentProjects: builder.query({
      query: (limit = 6) => `/projects?limit=${limit}&sortBy=updatedAt&sortOrder=DESC&publicOnly=true`,
      providesTags: ['Project'],
      keepUnusedDataFor: 60, // 1 minuto
    }),

    // ✅ CRUD PARA ADMINISTRADORES
    // Crear proyecto
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project', 'FilterOptions'],
    }),

    // Actualizar proyecto
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        'FilterOptions'
      ],
    }),

    // Eliminar proyecto (soft delete)
    deleteProject: builder.mutation({
      query: ({ id, permanent = false }) => ({
        url: `/projects/${id}${permanent ? '?permanent=true' : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'FilterOptions'],
    }),

    // ✅ SISTEMA DE MULTIMEDIA MEJORADO
    // Subir archivo multimedia
    uploadProjectMedia: builder.mutation({
      query: ({ projectId, formData }) => {
        console.log('🔧 RTK Query - uploadProjectMedia:', {
          projectId,
          isFormData: formData instanceof FormData,
          hasFile: formData instanceof FormData ? formData.has('file') : false
        });

        return {
          url: `/projects/${projectId}/media`,
          method: 'POST',
          body: formData,
          // ✅ NO establecer Content-Type - deja que FormData lo maneje
        };
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: 'LIST' }
      ],
    }),

    // Obtener multimedia de un proyecto
    getProjectMedia: builder.query({
      query: ({ projectId, type, isActive = true }) => {
        const params = new URLSearchParams({
          isActive: isActive.toString()
        });
        if (type) params.append('type', type);
        
        return `/projects/${projectId}/media?${params}`;
      },
      providesTags: (result, error, { projectId }) => [
        { type: 'ProjectMedia', id: projectId }
      ],
    }),

    // ✅ NUEVA MUTACIÓN: Toggle imagen del slider
    toggleSliderImage: builder.mutation({
      query: ({ projectId, mediaId }) => ({
        url: `/projects/${projectId}/media/${mediaId}/slider-toggle`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: 'LIST' },
        'SliderProjects'
      ],
    }),

    // ✅ NUEVA MUTACIÓN: Eliminar archivo de media
    deleteProjectMedia: builder.mutation({
      query: ({ projectId, mediaId }) => ({
        url: `/projects/${projectId}/media/${mediaId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: 'LIST' }
      ],
    }),

    // ✅ GESTIÓN DE ARCHIVOS MULTIMEDIA
    // Actualizar metadata de archivo
    updateMediaFile: builder.mutation({
      query: ({ mediaId, projectId, ...data }) => ({
        url: `/media/${mediaId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: projectId }
      ],
    }),

    // Eliminar archivo multimedia
    deleteMediaFile: builder.mutation({
      query: ({ mediaId, projectId }) => ({
        url: `/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' }
      ],
    }),

    // Reordenar archivos multimedia
    reorderProjectMedia: builder.mutation({
      query: ({ projectId, mediaOrder }) => ({
        url: `/projects/${projectId}/media/reorder`,
        method: 'PUT',
        body: { mediaOrder }, // Array de IDs en el orden deseado
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'ProjectMedia', id: projectId },
        { type: 'Project', id: projectId }
      ],
    }),

    // ✅ UTILIDADES Y ESTADÍSTICAS
    // Incrementar vistas (si tienes analytics)
    incrementProjectViews: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}/views`,
        method: 'POST',
      }),
      // No invalidar cache para no causar re-renders
      invalidatesTags: [],
    }),

  }),
});

// ✅ HOOKS EXPORTADOS
export const {
  // Consultas principales
  useGetProjectsQuery,
  useLazyGetProjectsQuery,
  
  // Búsqueda
  useSearchProjectsQuery,
  useLazySearchProjectsQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  
  // Filtros y opciones
  useGetFilterOptionsQuery,
  
  // Proyectos específicos
  useGetFeaturedProjectsQuery,
  useGetSliderProjectsQuery,        // ✅ NUEVO HOOK
  useGetRecentProjectsQuery,
  useGetProjectsByYearQuery,
  useGetProjectBySlugQuery,
   useGetProjectByIdQuery,
  
  // CRUD Admin
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  
  // Sistema multimedia
  useUploadProjectMediaMutation,
  useGetProjectMediaQuery,
  useToggleSliderImageMutation,     // ✅ NUEVO HOOK
  useDeleteProjectMediaMutation,    // ✅ AGREGAR ESTE HOOK
  useUpdateMediaFileMutation,
  useDeleteMediaFileMutation,
  useReorderProjectMediaMutation,
  
  // Utilidades
  useIncrementProjectViewsMutation,
  
} = projectsApi;

// ✅ SELECTORES ÚTILES (opcional)
export const selectProjectById = (projectId) => (state) => {
  return projectsApi.endpoints.getProjects.select()(state)?.data?.data?.find(
    project => project.id === projectId
  );
};

export const selectFeaturedProjects = (state) => {
  return projectsApi.endpoints.getFeaturedProjects.select()(state)?.data?.data || [];
};