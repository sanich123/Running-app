import { Methods, Routes, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import type { FilteredProfilesResponse, ProfileResponse, SendProfile } from './types';
const { profile, user } = Routes;

export const profileApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getUserProfileByUserId: query<ProfileResponse | null, string>({
      query: (userId: string) => `/${user}/${userId}/${profile}`,
      providesTags: [Tags.profile],
    }),
    createProfileByUserId: mutation<ProfileResponse, SendProfile>({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments, Tags.notifications],
    }),
    updateProfileByUserId: mutation<ProfileResponse, SendProfile>({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    getFilteredUsersBySearchText: infiniteQuery<FilteredProfilesResponse, string, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: search, pageParam }) =>
        `/${profile}/filter${createSearchParams({
          take: 10,
          name: search,
          surname: search,
          email: search,
          cursor: pageParam || undefined,
        })}`,
      providesTags: [Tags.profile],
    }),
  }),
});

export const {
  useGetUserProfileByUserIdQuery,
  useUpdateProfileByUserIdMutation,
  useGetFilteredUsersBySearchTextInfiniteQuery,
} = profileApi;
