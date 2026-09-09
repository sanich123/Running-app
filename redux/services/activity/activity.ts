import { Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  ActivityToSend,
  ActivityUpdateRequest,
  GetActivitiesByIdsRequest,
  GetActivityPhotosRequest,
} from './types';
import type {
  ActivitiesResponse,
  ActivityListItemResponse,
  ActivityMutationResponse,
  ActivityLocationsResponse,
  ActivityMediaResponse,
  ActivityMigrationJobResponse,
  ActivityResponse,
} from '@R/runich-api/types';

const ACTIVITY_PAGE_SIZE = 20;

const activityApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getActivitiesByUserId: infiniteQuery<ActivitiesResponse, { id: string }, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { id }, pageParam }) =>
        `/activity/${id}?take=${ACTIVITY_PAGE_SIZE}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: infiniteQuery<ActivitiesResponse, { id: string }, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { id }, pageParam }) =>
        `/activity/${id}/all?take=${ACTIVITY_PAGE_SIZE}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
      providesTags: [Tags.activities],
    }),
    getAllActivityPhotosByUserId: infiniteQuery<ActivityMediaResponse, GetActivityPhotosRequest, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { userId, take }, pageParam }) =>
        `/activity/${userId}/photos?take=${take}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
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
    getStravaMigrationStatus: query<ActivityMigrationJobResponse, string>({
      query: (jobId: string) => `/activity/migration-strava/jobs/${jobId}`,
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
    getSeveralActivitiesByTheirIds: query<ActivityListItemResponse[], GetActivitiesByIdsRequest>({
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
  useGetAllActivityPhotosByUserIdInfiniteQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useGetStravaMigrationStatusQuery,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useGetSeveralActivitiesByTheirIdsQuery,
} = activityApi;
