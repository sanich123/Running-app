import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { SendFriend } from './types';

const { friend, followers } = Routes;

const followersApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
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
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.friends, id: arg.body.userId }, Tags.activities],
    }),
    deleteFriend: builder.mutation({
      query: (id: string) => ({
        url: `/${friend}/${id}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.friends, Tags.activities],
    }),
  }),
});

export const {
  useGetYouFollowUsersByUserIdQuery,
  useGetFollowersByUserIdQuery,
  useAddFriendMutation,
  useDeleteFriendMutation,
} = followersApi;
