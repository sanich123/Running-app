import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteLike, LikeRequest, SendLike } from './types';
import type { LikeListResponse, LikeResponse } from '@R/runich-api/types';

const { like } = Routes;

const likesApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLikesByActivityId: builder.query<LikeListResponse[], string>({
      query: (id: string) => `/${like}/${id}`,
      providesTags: (result, error, arg) => [{ type: Tags.likes, id: arg }],
    }),
    sendLike: builder.mutation<LikeResponse, SendLike>({
      query: ({ activityId, authorId }: LikeRequest) => ({
        url: `/${like}`,
        method: Methods.post,
        body: { activityId, authorId },
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
      async onQueryStarted({ activityId, authorId, profilePhoto }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
            draft.push({
              id: `optimistic-${activityId}-${authorId}`,
              activityId,
              authorId,
              date: new Date().toISOString(),
              profileId: '',
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
    deleteLike: builder.mutation<LikeResponse, DeleteLike>({
      query: ({ id, activityId }: DeleteLike) => ({
        url: `/${like}/${id}/${activityId}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
    }),
  }),
});

export const { useGetLikesByActivityIdQuery, useSendLikeMutation, useDeleteLikeMutation } = likesApi;
