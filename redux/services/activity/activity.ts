import { Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { ActivitiesReponse, ActivityToSend } from './types';

export const activityApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getActivitiesByUserId: infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams, queryArg) => lastPageParam + 1,
      },
      query: ({ queryArg: { id }, pageParam }) => `/activity/${id}?page=${pageParam}&take=10`,
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: infiniteQuery<ActivitiesReponse, { id: string }, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams, queryArg) => lastPageParam + 1,
      },
      query: ({ queryArg: { id }, pageParam }) => `/activity/${id}/all?page=${pageParam}&take=10`,
      providesTags: [Tags.activities],
    }),
    getAllActivityPhotosByUserId: query({
      query: ({ userId, take }: { userId: string; take: number }) => `/activity/${userId}/photos?take=${take}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: query({
      query: (id: string) => `/activity/activityId/${id}`,
      providesTags: (result, error, arg) => [Tags.activities, { type: Tags.activities, id: arg }],
    }),
    getLocationsByActivityId: query({
      query: (activityId: string) => `/activity/${activityId}/locations`,
      providesTags: [Tags.activities],
    }),
    updateActivityInfo: mutation({
      query: ({ body, id }) => ({
        url: `/activity/${id}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    addActivityByUserId: mutation({
      query: ({ body, id }: ActivityToSend) => ({
        url: `/activity/${id}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    deleteActivityById: mutation({
      query: (id: string) => ({
        url: `/activity/${id}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.activities],
    }),
    getSeveralActivitiesByTheirIds: query({
      query: ({ ids }: { ids: string }) => ({
        url: `/activity/activityIds?${ids}`,
      }),
      providesTags: [Tags.activities],
    }),
  }),
});

export const {
  useUpdateActivityInfoMutation,
  useGetActivitiesByUserIdInfiniteQuery,
  useGetAllActivityPhotosByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useGetSeveralActivitiesByTheirIdsQuery,
} = activityApi;
