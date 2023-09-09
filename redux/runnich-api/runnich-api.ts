import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { headers, TAGS, ROUTES } from '../../constants/api/api-contsts';

const { activities, profile, comments, likes, friends, users } = TAGS;
const { profile: routeProfile, activity, friend, comment, like, auth, signIn, signUp, activityId } = ROUTES;

export const runnichApi = createApi({
  reducerPath: 'runnichApi',
  tagTypes: [activities, profile, comments, likes, friends, users],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_BASE_URL }),
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/user',
      providesTags: [users],
    }),
    getUserProfileById: builder.query({
      query: (id) => `/${routeProfile}/${id}`,
      providesTags: [profile],
    }),
    getActivitiesByUserId: builder.query({
      query: (id) => `/${activity}/${id}`,
      providesTags: [activities],
    }),
    getActivitiesByUserIdWithFriendsActivities: builder.query({
      query: (id) => `/${activity}/${id}/all`,
      providesTags: [activities],
    }),
    getActivityByActivityId: builder.query({
      query: (id) => `/${activity}/${activityId}/${id}`,
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
    signUpUser: builder.mutation({
      query: (body) => ({
        url: `/${auth}/${signUp}`,
        method: 'POST',
        headers,
        body,
      }),
    }),
    signInUser: builder.mutation({
      query: (body) => ({
        url: `/${auth}/${signIn}`,
        method: 'POST',
        headers,
        body,
      }),
    }),
    sendProfileInfo: builder.mutation({
      query: (body) => ({
        url: `/${routeProfile}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [profile],
    }),
    addActivityByUserId: builder.mutation({
      query: ({ body, id }) => ({
        url: `/${activity}/${id}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [activities],
    }),
    deleteActivityById: builder.mutation({
      query: (id) => ({
        url: `/${activity}/${id}`,
        method: 'DELETE',
        headers,
      }),
      invalidatesTags: [activities],
    }),
    addFriend: builder.mutation({
      query: (body: { userId: string; friendId: string }) => ({
        url: `/${friend}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [friends, activities, users],
    }),
    deleteFriend: builder.mutation({
      query: (id) => ({
        url: `/${friend}/${id}`,
        method: 'DELETE',
        headers,
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
      query: (body) => ({
        url: `/${like}`,
        method: 'POST',
        headers,
        body,
      }),
      invalidatesTags: [likes],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserProfileByIdQuery,
  useGetActivitiesByUserIdQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetActivityByActivityIdQuery,
  useGetFriendsByUserIdQuery,
  useGetFollowersByUserIdQuery,
  useGetCommentsByActivityIdQuery,
  useGetLikesByActivityIdQuery,
  useSignUpUserMutation,
  useSignInUserMutation,
  useSendProfileInfoMutation,
  useAddActivityByUserIdMutation,
  useDeleteActivityByIdMutation,
  useAddFriendMutation,
  useDeleteFriendMutation,
  usePostCommentWithActivityIdMutation,
  useSendOrDeleteLikeMutation,
} = runnichApi;
