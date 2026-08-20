import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { FilteredProfilesResponse, ProfileResponse, SendProfile } from './types';
const { profile, user } = Routes;

export const profileApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserProfileByUserId: builder.query<ProfileResponse | null, string>({
      query: (userId: string) => `/${user}/${userId}/${profile}`,
      providesTags: [Tags.profile],
    }),
    createProfileByUserId: builder.mutation<ProfileResponse, SendProfile>({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    updateProfileByUserId: builder.mutation<ProfileResponse, SendProfile>({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    getFilteredUsersBySearchText: builder.query<FilteredProfilesResponse, string>({
      query: (search) =>
        `/${profile}/filter?page=0&size=10&name=${encodeURIComponent(search)}&surname=${encodeURIComponent(search)}&email=${encodeURIComponent(search)}`,
      providesTags: [Tags.profile],
    }),
  }),
});

export const {
  useGetUserProfileByUserIdQuery,
  useUpdateProfileByUserIdMutation,
  useGetFilteredUsersBySearchTextQuery,
} = profileApi;
