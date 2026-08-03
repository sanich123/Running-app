import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteLike, SendLike } from './types';

const { like } = Routes;

export const likesApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLikesByActivityId: builder.query({
      query: (id: string) => `/${like}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.likes, id: arg }],
    }),
    sendLike: builder.mutation({
      query: (body: SendLike) => ({
        url: `/${like}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
      async onQueryStarted({ activityId, authorId, profilePhoto }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
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
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
    }),
  }),
});

export const {
  useGetLikesByActivityIdQuery,
  useSendLikeMutation,
  useDeleteLikeMutation,
} = likesApi;
