import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { FollowerResponse, FollowingResponse } from '@R/runich-api/types';

const { friend, followers } = Routes;

export const followersApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getYouFollowUsersByUserId: builder.query<FollowingResponse[], string>({
      query: (id: string) => `/${friend}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.friends, id: arg }],
    }),
    getFollowersByUserId: builder.query<FollowerResponse[], string>({
      query: (id: string) => `/${friend}/${id}/${followers}`,
      providesTags: (result, error, arg) => [{ type: Tags.friends, id: arg }],
    }),
    addFriend: builder.mutation<FollowingResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${friend}/${id}`,
        method: Methods.post,
      }),
      // The following-list query is keyed by the current user's id, while this
      // mutation receives the followed user's id. Invalidate the whole friends
      // tag so both following and followers queries refresh after a change.
      invalidatesTags: [Tags.friends, Tags.activities],
    }),
    deleteFriend: builder.mutation<void, string>({
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
