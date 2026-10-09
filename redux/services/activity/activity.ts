import { Methods, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  ActivityToSend,
  ActivityUpdateRequest,
  AppendActivityMediaRequest,
  DeleteActivityMediaRequest,
  GetActivityLocationsRequest,
  GetActivitiesByIdsRequest,
  GetActivityMediaRequest,
  WatchWorkoutsImportRequest,
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
  WatchWorkoutBatchImportResponse,
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
        `/activity/${id}${createSearchParams({ take: ACTIVITY_PAGE_SIZE, cursor: pageParam || undefined })}`,
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: infiniteQuery<ActivitiesResponse, { id: string }, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { id }, pageParam }) =>
        `/activity/${id}/all${createSearchParams({ take: ACTIVITY_PAGE_SIZE, cursor: pageParam || undefined })}`,
      providesTags: [Tags.activities],
    }),
    getAllActivityMediaByUserId: infiniteQuery<ActivityMediaResponse, GetActivityMediaRequest, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { userId, take }, pageParam }) =>
        `/activity/${userId}/media${createSearchParams({ take, cursor: pageParam || undefined })}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: query<ActivityResponse | null, string>({
      query: (id: string) => `/activity/activityId/${id}`,
      providesTags: (result, error, arg) => [Tags.activities, { type: Tags.activities, id: arg }],
    }),
    getLocationsByActivityId: query<ActivityLocationsResponse | null, GetActivityLocationsRequest>({
      query: ({ activityId, replay }: GetActivityLocationsRequest) =>
        `/activity/${activityId}/locations${createSearchParams({ replay: replay || undefined })}`,
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
    deleteActivityMedia: mutation<void, DeleteActivityMediaRequest>({
      query: ({ activityId, mediaId }) => ({
        url: `/activity/${activityId}/media/${mediaId}`,
        method: Methods.delete,
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
    importWatchWorkouts: mutation<WatchWorkoutBatchImportResponse, WatchWorkoutsImportRequest>({
      query: ({ id, workouts }) => ({
        url: `/activity/${id}/watch-import`,
        method: Methods.post,
        body: { workouts },
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
        url: `/activity/activityIds${createSearchParams({ ids })}`,
      }),
      providesTags: [Tags.activities],
    }),
  }),
});

export const {
  useUpdateActivityInfoMutation,
  useAppendActivityMediaMutation,
  useDeleteActivityMediaMutation,
  useGetActivitiesByUserIdInfiniteQuery,
  useGetAllActivityMediaByUserIdInfiniteQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useGetStravaMigrationStatusQuery,
  useGetCurrentStravaMigrationStatusQuery,
  useAddActivityByUserIdMutation,
  useImportWatchWorkoutsMutation,
  useDeleteActivityByIdMutation,
  useGetSeveralActivitiesByTheirIdsQuery,
} = activityApi;
