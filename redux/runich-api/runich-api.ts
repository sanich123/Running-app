import { ActivityToSend } from '@R/activity/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
      merge: (currentCache, newItems) => {
        if (!currentCache?.message || !newItems?.message) {
          currentCache.activities?.push(...newItems.activities);
          currentCache.isLastPage = newItems.isLastPage;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    getAllActivityPhotosByUserId: builder.query({
      query: ({ userId, page, take }: { userId: string; page: number; take: number }) =>
        `/${activity}/${userId}/${photos}?page=${page}&take=${take}`,
      providesTags: [Tags.activities],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        if (!currentCache?.message || !newItems?.message) {
          currentCache?.photos?.push(...newItems?.photos);
          currentCache.isLastPage = newItems.isLastPage;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
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
      query: ({ activityId, take }: { activityId: string; take: number }) => `/${comment}/${activityId}?&take=${take}`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg.activityId }],
    }),
    getCommentsLengthByActivityId: builder.query({
      query: (id: string) => `/${comment}/${id}/count`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg }],
    }),
    postCommentWithActivityId: builder.mutation({
      query: ({ body, id }: SendComment) => ({
        url: `/${comment}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: Tags.comments, id: arg.id },
        { type: Tags.activities, id: arg.id },
      ],
    }),
    deleteCommentByCommentId: builder.mutation({
      query: ({ commentId, activityId }: { commentId: string; activityId: string }) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: Tags.comments, id: arg.activityId },
        { type: Tags.activities, id: arg.activityId },
      ],
    }),
    updateCommentByCommentId: builder.mutation({
      query: ({
        commentId,
        activityId,
        body,
      }: {
        commentId: string;
        activityId: string;
        body: { comment: string };
      }) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.patch,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: Tags.comments, id: arg.activityId },
        { type: Tags.activities, id: arg.activityId },
      ],
    }),
    getLikesByCommentId: builder.query({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg }],
    }),
    sendLikeToComment: builder.mutation({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg.commentId }],
      async onQueryStarted({ body, commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          runichApi.util.updateQueryData('getLikesByCommentId', commentId, (draft) => {
            draft.push({
              commentId,
              authorId: body.authorId,
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
    deleteLikeToComment: builder.mutation({
      query: ({ likeId, commentId }: { likeId: string; commentId: string }) => ({
        url: `/${comment}/${likeId}/${like}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg.commentId }],
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
  useGetCommentsLengthByActivityIdQuery,
  useGetLikesByActivityIdQuery,
  useGetLikesByCommentIdQuery,
  useGetLocationsByActivityIdQuery,
  useSendProfileInfoMutation,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useAddFriendMutation,
  useDeleteFriendMutation,
  usePostCommentWithActivityIdMutation,
  useDeleteCommentByCommentIdMutation,
  useSendLikeMutation,
  useDeleteLikeMutation,
  useSendLikeToCommentMutation,
  useDeleteLikeToCommentMutation,
  useUpdateCommentByCommentIdMutation,
} = runichApi;
