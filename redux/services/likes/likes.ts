import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteLike, SendLike } from './types';
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
      query: ({ activityId }: SendLike) => ({
        url: `/${like}`,
        method: Methods.post,
        body: { activityId },
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
      async onQueryStarted({ activityId, authorId, profilePhoto }, { dispatch, queryFulfilled }) {
        const optimisticLikeId = `optimistic-${activityId}-${authorId}`;
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
            if (draft.some(({ authorId: existingAuthorId }) => existingAuthorId === authorId)) return;

            draft.unshift({
              id: optimisticLikeId,
              activityId,
              authorId,
              date: new Date().toISOString(),
              profileId: '',
              profile: { profilePhoto },
            });
          }),
        );

        try {
          const { data: createdLike } = await queryFulfilled;
          dispatch(
            likesApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
              const optimisticLikeIndex = draft.findIndex(({ id }) => id === optimisticLikeId);
              if (optimisticLikeIndex === -1) return;

              const hasCreatedLike = draft.some(({ id }) => id === createdLike.id);
              if (hasCreatedLike) {
                draft.splice(optimisticLikeIndex, 1);
                return;
              }

              draft[optimisticLikeIndex] = {
                ...draft[optimisticLikeIndex],
                ...createdLike,
                profile: createdLike.profile ?? draft[optimisticLikeIndex].profile,
              };
            }),
          );
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
      async onQueryStarted({ id, activityId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', activityId, (draft) => {
            const likeIndex = draft.findIndex((like) => like.id === id);
            if (likeIndex !== -1) draft.splice(likeIndex, 1);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetLikesByActivityIdQuery, useSendLikeMutation, useDeleteLikeMutation } = likesApi;
