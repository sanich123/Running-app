import { Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  ActivitiesReponse,
  ActivityMutationResponse,
  ActivityToSend,
  ActivityUpdateRequest,
  GetActivitiesByIdsRequest,
  GetActivityPhotosRequest,
} from './types';
import type { ActivityLocationsResponse, ActivityMediaResponse, ActivityResponse } from '@R/runich-api/types';

export const activityApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getActivitiesByUserId: infiniteQuery<ActivitiesReponse, { id: string }, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => lastPageParam + 1,
      },
      query: ({ queryArg: { id }, pageParam }) => `/activity/${id}?page=${pageParam}&take=10`,
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: infiniteQuery<ActivitiesReponse, { id: string }, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => lastPageParam + 1,
      },
      query: ({ queryArg: { id }, pageParam }) => `/activity/${id}/all?page=${pageParam}&take=10`,
      providesTags: [Tags.activities],
    }),
    getAllActivityPhotosByUserId: query<ActivityMediaResponse, GetActivityPhotosRequest>({
      query: ({ userId, take }) => `/activity/${userId}/photos?take=${take}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: query<ActivityResponse | null, string>({
      query: (id: string) => `/activity/activityId/${id}`,
      providesTags: (result, error, arg) => [Tags.activities, { type: Tags.activities, id: arg }],
    }),
    getLocationsByActivityId: query<ActivityLocationsResponse | null, string>({
      query: (activityId: string) => `/activity/${activityId}/locations`,
      providesTags: [Tags.activities],
    }),
    updateActivityInfo: mutation<ActivityMutationResponse, ActivityUpdateRequest>({
      query: ({ body, id }) => ({
        url: `/activity/${id}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    addActivityByUserId: mutation<ActivityMutationResponse, ActivityToSend>({
      query: ({ body, id }: ActivityToSend) => ({
        url: `/activity/${id}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    deleteActivityById: mutation<void, string>({
      query: (id: string) => ({
        url: `/activity/${id}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.activities],
    }),
    getSeveralActivitiesByTheirIds: query<ActivityResponse[], GetActivitiesByIdsRequest>({
      query: ({ ids }) => ({
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
