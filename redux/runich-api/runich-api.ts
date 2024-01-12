import { ActivityToSend } from '@R/activity/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_NAME, Methods, Routes, Tags, headers } from './const';
import { SendComment, SendCommentLike, SendFriend, SendLike, SendProfile } from './types';

const { profile, activity, friend, comment, like, activityId, user, all, photos, followers } = Routes;

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_BASE_URL }),
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => `/${user}`,
      providesTags: [Tags.users],
    }),
    getUserProfileById: builder.query({
      query: (id: string) => `/${profile}/${id}`,
      providesTags: [Tags.profile],
    }),
    getActivitiesByUserId: builder.query({
      query: (id: string) => `/${activity}/${id}`,
      providesTags: [Tags.activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: builder.query({
      query: (id: string) => `/${activity}/${id}/${all}`,
      providesTags: [Tags.activities],
    }),
    getAllActivityPhotosByUserId: builder.query({
      query: (userId: string) => `/${activity}/${userId}/${photos}`,
      providesTags: [Tags.activities],
    }),
    getActivityByActivityId: builder.query({
      query: (id: string) => `/${activity}/${activityId}/${id}`,
      providesTags: [Tags.activities],
    }),
    getFriendsByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}`,
      providesTags: [Tags.friends],
    }),
    getFollowersByUserId: builder.query({
      query: (id: string) => `${friend}/${id}/${followers}`,
      providesTags: [Tags.friends],
    }),
    getCommentsByActivityId: builder.query({
      query: (id: string) => `/${comment}/${id}`,
      providesTags: [Tags.comments],
    }),
    getLikesByActivityId: builder.query({
      query: (id: string) => `/${like}/${id}`,
      providesTags: [Tags.likes],
    }),
    getLikesByCommentId: builder.query({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: [Tags.comments],
    }),
    sendProfileInfo: builder.mutation({
      query: ({ body, id }: SendProfile) => ({
        url: `/${user}/${id}/${profile}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.profile],
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
    postCommentWithActivityId: builder.mutation({
      query: ({ body, id }: SendComment) => ({
        url: `/${comment}/${id}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.comments],
    }),
    sendOrDeleteLike: builder.mutation({
      query: (body: SendLike) => ({
        url: `/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.likes],
    }),
    sendOrDeleteLikeToComment: builder.mutation({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
      invalidatesTags: [Tags.comments],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserProfileByIdQuery,
  useGetActivitiesByUserIdQuery,
  useGetAllActivityPhotosByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetActivityByActivityIdQuery,
  useGetFriendsByUserIdQuery,
  useGetFollowersByUserIdQuery,
  useGetCommentsByActivityIdQuery,
  useGetLikesByActivityIdQuery,
  useGetLikesByCommentIdQuery,
  useSendProfileInfoMutation,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useAddFriendMutation,
  useDeleteFriendMutation,
  usePostCommentWithActivityIdMutation,
  useSendOrDeleteLikeMutation,
  useSendOrDeleteLikeToCommentMutation,
} = runichApi;
