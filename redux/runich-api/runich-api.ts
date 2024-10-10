import { ActivityToSend } from '@R/activity/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_NAME, LIMIT_OF_REQUEST, Methods, Routes, Tags, headers } from './const';
import {
  CurrentWeekStatisticsRequest,
  DeleteCommentLike,
  DeleteLike,
  EmailComment,
  EmailCommentLike,
  EmailDTO,
  MonthStatisticsRequest,
  SendComment,
  SendCommentLike,
  SendFriend,
  SendLike,
  SendProfile,
  UpdateComment,
} from './types';

const {
  profile,
  activity,
  friend,
  comment,
  like,
  activityId,
  user,
  all,
  photos,
  followers,
  statistics,
  email,
  commentLike,
} = Routes;

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users, Tags.commentLikes],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
    timeout: LIMIT_OF_REQUEST,
  }),

  endpoints: (builder) => ({
    //Profile
    getUserProfileByUserId: builder.query({
      query: (userId: string) => `${user}/${userId}/${profile}`,
      providesTags: [Tags.profile],
    }),
    createProfileByUserId: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    updateProfileByProfileId: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `${user}/${id}/${profile}`,
        method: Methods.patch,
        headers,
        body,
      }),
      invalidatesTags: [Tags.profile, Tags.activities, Tags.likes, Tags.comments],
    }),
    deleteUserByUserId: builder.mutation({
      query: (id: string) => ({
        url: `${user}/${id}`,
        method: Methods.delete,
      }),
    }),
    getFilteredUsersBySearchText: builder.query({
      query: (search: string) =>
        `/${profile}/filter?page=${0}&limit=${10}&offset=0&name=${search}&surname=${search}&email=${search}&city=${search}&gender=${search}&sport=${search}`,
      providesTags: [Tags.profile],
    }),

    //Followers
    getYouFollowUsersByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.friends, id: arg }],
    }),
    getFollowersByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}/${followers}`,
      providesTags: (result, error, arg) => [{ type: Tags.friends, id: arg }],
    }),
    addFriend: builder.mutation({
      query: ({ body, id }: SendFriend) => ({
        url: `/${friend}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.friends, id: arg.body.userId }],
    }),
    deleteFriend: builder.mutation({
      query: (id: string) => ({
        url: `/${friend}/${id}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: [Tags.friends],
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

    getSeveralActivitiesByTheirIds: builder.query({
      query: ({ ids }: { ids: string }) => ({
        url: `/activity/activityIds?${ids}`,
        headers,
      }),
      providesTags: [Tags.activities],
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
      query: ({ commentId, activityId, body }: UpdateComment) => ({
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
      query: ({ likeId, commentId }: DeleteCommentLike) => ({
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
      query: ({ id, activityId }: DeleteLike) => ({
        url: `/${like}/${id}/${activityId}`,
        method: Methods.delete,
        headers,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
    }),

    //Statistcs

    getAnnualStatisticsByUserId: builder.query({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/year-category`,
        headers,
      }),
      providesTags: [Tags.activities],
    }),

    getCurrentWeekStatistics: builder.query({
      query: ({ userId, firstDay, lastDay }: CurrentWeekStatisticsRequest) => ({
        url: `/${statistics}/${userId}/week?firstDay=${firstDay}&lastDay=${lastDay}`,
        headers,
      }),
      providesTags: [Tags.activities],
    }),

    getAllTimeStatisticsByUserId: builder.query({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/all`,
        headers,
      }),
      providesTags: [Tags.activities],
    }),

    getMonthStatistics: builder.query({
      query: ({ userId, year, month }: MonthStatisticsRequest) => ({
        url: `/${statistics}/${userId}/year-month?year=${year}&month=${month}`,
        headers,
      }),
      providesTags: [Tags.activities],
    }),

    //Emails

    sendEmailAfterSendingLike: builder.mutation({
      query: (body: EmailDTO & { mapPhotoUrl: string }) => ({
        url: `/${email}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),

    sendEmailAfterSendingComment: builder.mutation({
      query: (body: EmailComment) => ({
        url: `/${email}/${comment}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),

    sendEmailAfterSendingCommentLike: builder.mutation({
      query: (body: EmailCommentLike) => ({
        url: `/${email}/${commentLike}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
  }),
});

export const {
  //Profile
  useGetUserProfileByUserIdQuery,
  useCreateProfileByUserIdMutation,
  useUpdateProfileByProfileIdMutation,
  useDeleteUserByUserIdMutation,
  useGetFilteredUsersBySearchTextQuery,

  //Activity
  useUpdateActivityInfoMutation,
  useGetActivitiesByUserIdQuery,
  useGetAllActivityPhotosByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetActivityByActivityIdQuery,
  useGetLocationsByActivityIdQuery,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,

  //Followers
  useGetYouFollowUsersByUserIdQuery,
  useGetFollowersByUserIdQuery,
  useAddFriendMutation,
  useDeleteFriendMutation,

  //Comments
  useGetCommentsByActivityIdQuery,
  useGetCommentsLengthByActivityIdQuery,
  usePostCommentWithActivityIdMutation,
  useDeleteCommentByCommentIdMutation,
  useUpdateCommentByCommentIdMutation,

  //Likes
  useGetLikesByActivityIdQuery,
  useGetLikesByCommentIdQuery,
  useSendLikeMutation,
  useDeleteLikeMutation,
  useSendLikeToCommentMutation,
  useDeleteLikeToCommentMutation,

  //Statistics
  useGetAnnualStatisticsByUserIdQuery,
  useGetCurrentWeekStatisticsQuery,
  useGetAllTimeStatisticsByUserIdQuery,
  useGetMonthStatisticsQuery,
  useGetSeveralActivitiesByTheirIdsQuery,

  //Emails
  useSendEmailAfterSendingLikeMutation,
  useSendEmailAfterSendingCommentMutation,
  useSendEmailAfterSendingCommentLikeMutation,
} = runichApi;
