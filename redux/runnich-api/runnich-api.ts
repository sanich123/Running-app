import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type QueryObj = {
  url: string;
  request: string;
};

export const runnichApi = createApi({
  reducerPath: 'runnichApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://runnich-service.onrender.com/' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'user',
    }),
  }),
});

export const { useGetUsersQuery } = runnichApi;
