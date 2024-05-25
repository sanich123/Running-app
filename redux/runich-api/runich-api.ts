import { ActivityToSend } from '@R/activity/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { uuidv4 } from 'react-native-compressor';

import { API_NAME, LIMIT_OF_REQUEST, Methods, Routes, Tags, headers } from './const';
import { SendComment, SendCommentLike, SendFriend, SendLike, SendProfile } from './types';

const { profile, activity, friend, comment, like, activityId, user, all, photos, followers } = Routes;

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users, Tags.commentLikes],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
    timeout: LIMIT_OF_REQUEST,
  }),

  endpoints: (builder) => ({
    //Profile
    getUsers: builder.query({
      query: () => `/${user}`,
      providesTags: [Tags.users],
    }),
    getUserProfileById: builder.query({
      query: (id: string) => `/${profile}/${id}`,
      providesTags: [Tags.profile],
    }),
    getAllActivityPhotosByUserId: builder.query({
      query: (userId: string) => `/${activity}/${userId}/${photos}`,
      providesTags: [Tags.activities],
    }),
    getFriendsByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}`,
      providesTags: [Tags.friends],
    }),
    getFollowersByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}/${followers}`,
      providesTags: [Tags.friends],
    }),
    updateProfileInfo: builder.mutation({
      query: ({ body, id }) => ({
        url: `/${profile}/${id}`,
        method: 'PATCH',
        headers,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities],
    }),
    sendProfileInfo: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    addFriend: builder.mutation({
      query: ({ body, id }: SendFriend) => ({
        url: `/${friend}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.friends, Tags.activities, Tags.users],
    }),
    deleteFriend: builder.mutation({
      query: ({ body, id }: SendFriend) => ({
        url: `/${friend}/${id}`,
        method: Methods.delete,
        headers,
        body,
      }),
      invalidatesTags: [Tags.friends, Tags.activities, Tags.users],
    }),

    //Activities
    getActivitiesByUserId: builder.query({
      query: ({ id, page, take }: { id: string; page: number; take: number }) =>
        `/${activity}/${id}?page=${page}&take=${take}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        currentCache.activities.push(...newItems.activities);
        currentCache.isLastPage = newItems.isLastPage;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: builder.query({
      query: ({ id, page, take }: { id: string; page: number; take: number }) =>
        `/${activity}/${id}/${all}?page=${page}&take=${take}`,
      providesTags: (result) =>
        result?.activities
          ? [
              ...result.activities.map(({ id }: { id: string }) => ({ type: Tags.activities, id })),
              { type: Tags.activities, id: 'ActivitiesList' },
            ]
          : [{ type: Tags.activities, id: 'ActivitiesList' }],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        currentCache.activities.push(...newItems.activities);
        currentCache.isLastPage = newItems.isLastPage;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    getActivityByActivityId: builder.query({
      query: (id: string) => `/${activity}/${activityId}/${id}`,
      providesTags: [Tags.activities],
    }),
    getLocationsByActivityId: builder.query({
      query: (activityId: string) => `/${activity}/${activityId}/locations`,
      providesTags: [Tags.activities],
    }),
    updateActivityInfo: builder.mutation({
      query: ({ body, id }) => ({
        url: `/${activity}/${id}`,
        method: 'PATCH',
        headers,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    addActivityByUserId: builder.mutation({
      query: ({ body, id }: ActivityToSend) => ({
        url: `/${activity}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.activities],
    }),
    deleteActivityById: builder.mutation({
      query: (id: string) => ({
        url: `/${activity}/${id}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: [Tags.activities],
    }),

    //Comments
    getCommentsByActivityId: builder.query({
      query: (id: string) => `/${comment}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg }],
    }),
    postCommentWithActivityId: builder.mutation({
      query: ({ body, id }: SendComment) => ({
        url: `/${comment}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.comments, id: arg.id }],
    }),

    //Likes
    getLikesByActivityId: builder.query({
      query: (id: string) => `/${like}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.likes, id: arg }],
    }),
    sendLike: builder.mutation({
      query: (body: SendLike) => ({
        url: `/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],

      async onQueryStarted({ activityId, authorId, profilePhoto }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          runichApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
            draft.push({
              activityId,
              authorId,
              date: new Date().toString(),
              profile: { profilePhoto },
              id: uuidv4(),
            });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteLike: builder.mutation({
      query: ({ id, activityId }: { id: string; activityId: string }) => ({
        url: `/${like}/${id}/${activityId}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
    }),
    getLikesByCommentId: builder.query({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: [Tags.commentLikes],
    }),
    sendOrDeleteLikeToComment: builder.mutation({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.commentLikes],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserProfileByIdQuery,
  useUpdateActivityInfoMutation,
  useUpdateProfileInfoMutation,
  useGetActivitiesByUserIdQuery,
  useGetAllActivityPhotosByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetActivityByActivityIdQuery,
  useGetFriendsByUserIdQuery,
  useGetFollowersByUserIdQuery,
  useGetCommentsByActivityIdQuery,
  useGetLikesByActivityIdQuery,
  useGetLikesByCommentIdQuery,
  useGetLocationsByActivityIdQuery,
  useSendProfileInfoMutation,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useAddFriendMutation,
  useDeleteFriendMutation,
  usePostCommentWithActivityIdMutation,
  useSendLikeMutation,
  useDeleteLikeMutation,
  useSendOrDeleteLikeToCommentMutation,
} = runichApi;
