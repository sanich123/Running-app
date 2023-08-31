import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const runnichApi = createApi({
  reducerPath: 'runnichApi',
  tagTypes: ['activities', 'profile'],
  baseQuery: fetchBaseQuery({ baseUrl: 'https://runich-backend.onrender.com' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/user',
    }),
    getUserProfileById: builder.query({
      query: (id) => `/profile/${id}`,
      providesTags: ['profile'],
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
  }),
});

export const {
  useGetUsersQuery,
  useSignUpUserMutation,
  useSignInUserMutation,
  useSendProfileInfoMutation,
  useGetUserProfileByIdQuery,
} = runnichApi;
