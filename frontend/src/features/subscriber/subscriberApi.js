import { baseApi } from '../../services/api.js';

export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Suscribirse al newsletter
    subscribe: builder.mutation({
      query: (email) => ({
        url: '/subscribers',
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Subscriber'],
    }),

    // Cancelar suscripción
    unsubscribe: builder.mutation({
      query: (token) => ({
        url: `/subscribers/unsubscribe/${token}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriber'],
    }),

    // Admin: Obtener estadísticas
    getSubscriberStats: builder.query({
      query: () => '/subscribers/stats',
      providesTags: ['Subscriber'],
    }),

    // Admin: Lista de suscriptores
    getSubscribers: builder.query({
      query: ({ limit = 50, page = 1, status = 'active', search = '' } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          status: status,
        });
        if (search) {
          params.append('search', search);
        }
        return `/subscribers/list?${params}`;
      },
      providesTags: ['Subscriber'],
    }),

    // Admin: Eliminar suscriptor permanentemente
    deleteSubscriber: builder.mutation({
      query: (id) => ({
        url: `/subscribers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriber'],
    }),

    // Admin: Exportar suscriptores
    exportSubscribers: builder.query({
      query: () => ({
        url: '/subscribers/export',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriberStatsQuery,
  useGetSubscribersQuery,
  useDeleteSubscriberMutation,
  useExportSubscribersQuery,
} = subscribersApi;