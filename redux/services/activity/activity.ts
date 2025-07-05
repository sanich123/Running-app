import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { ActivityToSend } from './types';
const { activity, all, activityId, photos } = Routes;

export const activityApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getActivitiesByUserId: builder.query({
      query: ({ id, page, take }: { id: string; page: number; take: number }) =>
        `/${activity}/${id}?page=${page}&take=${take}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        if (!currentCache?.message || !newItems?.message) {
          currentCache?.activities.push(...newItems?.activities);
          currentCache.isLastPage = newItems.isLastPage;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: builder.query({
      query: ({ id, page, take }: { id: string; page: number; take: number }) =>
        `/${activity}/${id}/${all}?page=${page}&take=${take}`,
      providesTags: [Tags.activities],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 0) {
          return newItems;
        } else {
          if (!currentCache?.message || !newItems?.message) {
            currentCache.activities?.push(...newItems.activities);
            currentCache.isLastPage = newItems.isLastPage;
          }
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        if (!previousArg) return true;
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getAllActivityPhotosByUserId: builder.query({
      query: ({ userId, take }: { userId: string; take: number }) => `/${activity}/${userId}/${photos}?take=${take}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: builder.query({
      query: (id: string) => `/${activity}/${activityId}/${id}`,
      providesTags: (result, error, arg) => [Tags.activities, { type: Tags.activities, id: arg }],
    }),
    getLocationsByActivityId: builder.query({
      query: (activityId: string) => `/${activity}/${activityId}/locations`,
      providesTags: [Tags.activities],
    }),
    updateActivityInfo: builder.mutation({
      query: ({ body, id }) => ({
        url: `/${activity}/${id}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    addActivityByUserId: builder.mutation({
      query: ({ body, id }: ActivityToSend) => ({
        url: `/${activity}/${id}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    deleteActivityById: builder.mutation({
      query: (id: string) => ({
        url: `/${activity}/${id}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.activities],
    }),
    getSeveralActivitiesByTheirIds: builder.query({
      query: ({ ids }: { ids: string }) => ({
        url: `/activity/activityIds?${ids}`,
      }),
      providesTags: [Tags.activities],
    }),
  }),
});

export const {
  useUpdateActivityInfoMutation,
  useGetActivitiesByUserIdQuery,
  useGetAllActivityPhotosByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useGetSeveralActivitiesByTheirIdsQuery,
} = activityApi;
