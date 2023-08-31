import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const runnichApi = createApi({
  reducerPath: 'runnichApi',
  tagTypes: ['activities', 'profile'],
  baseQuery: fetchBaseQuery({ baseUrl: 'https://runich-backend.onrender.com' }),
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => '/user' }),
    getUserProfileById: builder.query({
      query: (id) => `/profile/${id}`,
      providesTags: ['profile'],
    }),
    getActivitiesByUserId: builder.query({
      query: (id) => `/activity/${id}`,
      providesTags: ['activities'],
    }),
    signUpUser: builder.mutation({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body,
      }),
    }),
    signInUser: builder.mutation({
      query: (body) => ({
        url: '/auth/signin',
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body,
      }),
    }),
    sendProfileInfo: builder.mutation({
      query: (body) => ({
        url: '/profile',
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body,
      }),
      invalidatesTags: ['profile'],
    }),
    addActivityByUserId: builder.mutation({
      query: ({ body, id }) => ({
        url: `/activity/${id}`,
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body,
      }),
      invalidatesTags: ['activities'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetActivitiesByUserIdQuery,
  useAddActivityByUserIdMutation,
  useSignUpUserMutation,
  useSignInUserMutation,
  useSendProfileInfoMutation,
  useGetUserProfileByIdQuery,
} = runnichApi;
