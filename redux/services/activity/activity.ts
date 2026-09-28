import { Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  ActivityToSend,
  ActivityUpdateRequest,
  AppendActivityMediaRequest,
  GetActivityLocationsRequest,
  GetActivitiesByIdsRequest,
  GetActivityMediaRequest,
} from './types';
import type {
  ActivitiesResponse,
  ActivityListItemResponse,
  ActivityMutationResponse,
  ActivityMediaMutationResponse,
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
    getAllActivityMediaByUserId: infiniteQuery<ActivityMediaResponse, GetActivityMediaRequest, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { userId, take }, pageParam }) =>
        `/activity/${userId}/media?take=${take}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: query<ActivityResponse | null, string>({
      query: (id: string) => `/activity/activityId/${id}`,
      providesTags: (result, error, arg) => [Tags.activities, { type: Tags.activities, id: arg }],
    }),
    getLocationsByActivityId: query<ActivityLocationsResponse | null, GetActivityLocationsRequest>({
      query: ({ activityId, replay }: GetActivityLocationsRequest) =>
        `/activity/${activityId}/locations${replay ? '?replay=true' : ''}`,
      providesTags: [Tags.activities],
    }),
    getStravaMigrationStatus: query<ActivityMigrationJobResponse, string>({
      query: (jobId: string) => `/activity/migration-strava/jobs/${jobId}`,
    }),
    getCurrentStravaMigrationStatus: query<ActivityMigrationJobResponse | null, void>({
      query: () => '/activity/migration-strava/current',
    }),
    updateActivityInfo: mutation<ActivityMutationResponse, ActivityUpdateRequest>({
      query: ({ body, id }) => ({
        url: `/activity/${id}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.activities, Tags.statistics],
    }),
    appendActivityMedia: mutation<ActivityMediaMutationResponse, AppendActivityMediaRequest>({
      query: ({ id, media }) => ({
        url: `/activity/${id}/media`,
        method: Methods.post,
        body: { media },
      }),
      invalidatesTags: [Tags.activities],
    }),
    addActivityByUserId: mutation<ActivityMutationResponse, ActivityToSend>({
      query: ({ body, id }: ActivityToSend) => ({
        url: `/activity/${id}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.activities, Tags.statistics],
    }),
    deleteActivityById: mutation<void, string>({
      query: (id: string) => ({
        url: `/activity/${id}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.activities, Tags.statistics],
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
  useAppendActivityMediaMutation,
  useGetActivitiesByUserIdInfiniteQuery,
  useGetAllActivityMediaByUserIdInfiniteQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useGetStravaMigrationStatusQuery,
  useGetCurrentStravaMigrationStatusQuery,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useGetSeveralActivitiesByTheirIdsQuery,
} = activityApi;
