import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import fetch from 'isomorphic-fetch';

export type QueryObj = {
  url: string;
  request: string;
};

export const graphiqlApi = createApi({
  reducerPath: 'graphiqlApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://' }),
  endpoints: (builder) => ({
    sendGraphiqlResponse: builder.mutation({
      query: ({ url, request }: QueryObj) => ({
        url,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: request,
        }),
      }),
    }),
  }),
});

export const { useSendGraphiqlResponseMutation } = graphiqlApi;
