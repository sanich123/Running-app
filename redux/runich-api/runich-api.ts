import { ActivityToSend } from '@R/activity/types';
import { ProfileSettings } from '@R/profile/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { headers, TAGS, ROUTES } from '../../constants/api/api-contsts';

const { activities, profile, comments, likes, friends, users } = TAGS;
const { profile: routeProfile, activity, friend, comment, like, activityId } = ROUTES;

export const runichApi = createApi({
  reducerPath: 'runnichApi',
  tagTypes: [activities, profile, comments, likes, friends, users],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_BASE_URL }),
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  keepUnusedDataFor: process.env.IS_TESTING ? 0 : 30,
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/user',
      providesTags: [users],
    }),
    getUserProfileById: builder.query({
      query: (id: string) => `/${routeProfile}/${id}`,
      providesTags: [profile],
      keepUnusedDataFor: process.env.IS_TESTING ? 0 : 1,
    }),
    getActivitiesByUserId: builder.query({
      query: (id: string) => `/${activity}/${id}`,
      providesTags: [activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: builder.query({
      query: (id: string) => `/${activity}/${id}/all`,
      providesTags: [activities],
      keepUnusedDataFor: process.env.IS_TESTING ? 0 : 1,
    }),
    getAllActivityPhotosByUserId: builder.query({
      query: (userId: string) => `/${activity}/${userId}/photos`,
      providesTags: [activities],
    }),
    getActivityByActivityId: builder.query({
      query: (id: string) => `/${activity}/${activityId}/${id}`,
      providesTags: [activities],
    }),
    getFriendsByUserId: builder.query({
      query: (id: string) => `/${friend}/${id}`,
      providesTags: [friends],
    }),
    getFollowersByUserId: builder.query({
      query: (id: string) => `${friend}/${id}/followers`,
      providesTags: [friends],
    }),
    getCommentsByActivityId: builder.query({
      query: (id: string) => `/${comment}/${id}`,
      providesTags: [comments],
    }),
    getLikesByActivityId: builder.query({
      query: (id: string) => `/${like}/${id}`,
      providesTags: [likes],
    }),
    getLikesByCommentId: builder.query({
      query: (commentId: string) => `/${comment}/${commentId}/like`,
      providesTags: [comments],
    }),
    sendProfileInfo: builder.mutation({
      query: ({ body, id }: { body: ProfileSettings; id: string }) => ({
        url: `/user/${id}/${routeProfile}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [profile],
    }),
    addActivityByUserId: builder.mutation({
      query: ({ body, id }: { body: ActivityToSend; id: string }) => ({
        url: `/${activity}/${id}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [activities],
    }),
    deleteActivityById: builder.mutation({
      query: (id: string) => ({
        url: `/${activity}/${id}`,
        method: 'DELETE',
        headers,
      }),
      invalidatesTags: [activities],
    }),
    addFriend: builder.mutation({
      query: ({ body, id }: { body: { userId: string }; id: string }) => ({
        url: `/${friend}/${id}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [friends, activities, users],
    }),
    deleteFriend: builder.mutation({
      query: ({ body, id }: { body: { userId: string }; id: string }) => ({
        url: `/${friend}/${id}`,
        method: 'DELETE',
        headers,
        body,
      }),
      invalidatesTags: [friends, activities, users],
    }),
    postCommentWithActivityId: builder.mutation({
      query: ({ body, id }: { body: { comment: string; authorId: string }; id: string }) => ({
        url: `/${comment}/${id}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [comments],
    }),
    sendOrDeleteLike: builder.mutation({
      query: (body: { activityId: string; authorId: string }) => ({
        url: `/${like}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [likes],
    }),
    sendOrDeleteLikeToComment: builder.mutation({
      query: ({ body, commentId }: { body: { commentId: string; authorId: string }; commentId: string }) => ({
        url: `/${comment}/${commentId}/like`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [comments],
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
