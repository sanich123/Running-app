import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { SendProfile } from './types';
const { profile, user } = Routes;

export const profileApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserProfileByUserId: builder.query({
      query: (userId: string) => `${user}/${userId}/${profile}`,
      providesTags: [Tags.profile],
    }),
    createProfileByUserId: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    updateProfileByProfileId: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `${user}/${id}/${profile}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    getFilteredUsersBySearchText: builder.query({
      query: (search: string) =>
        `/${profile}/filter?page=${0}&limit=${10}&offset=0&name=${search}&surname=${search}&email=${search}&city=${search}&gender=${search}&sport=${search}`,
      providesTags: [Tags.profile],
    }),
  }),
});

export const {
  useGetUserProfileByUserIdQuery,
  useCreateProfileByUserIdMutation,
  useUpdateProfileByProfileIdMutation,
  useGetFilteredUsersBySearchTextQuery,
} = profileApi;
