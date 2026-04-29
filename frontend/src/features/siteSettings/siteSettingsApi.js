import { baseApi } from '../../services/api.js';

export const siteSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHeroImage: builder.query({
      query: () => '/settings/hero-image',
      providesTags: ['HeroImage'],
    }),
    updateHeroImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return {
          url: '/settings/hero-image',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['HeroImage'],
    }),
  }),
});

export const { useGetHeroImageQuery, useUpdateHeroImageMutation } = siteSettingsApi;
