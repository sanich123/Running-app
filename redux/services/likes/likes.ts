import { Methods, Routes, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteLike, SendLike } from './types';
import type { LikeListPageResponse, LikeListResponse, LikeResponse } from '@R/runich-api/types';

const { like } = Routes;

export const likesApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation, infiniteQuery }) => ({
    getLikesByActivityId: infiniteQuery<LikeListPageResponse, { activityId: string }, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { activityId }, pageParam }) =>
        `/${like}/${activityId}${createSearchParams({ limit: 30, cursor: pageParam || undefined })}`,
      transformResponse: (response: LikeListPageResponse | LikeListResponse[]) =>
        Array.isArray(response)
          ? { likes: response, hasMore: false, nextCursor: null, currentUserLike: null }
          : response,
      providesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
    }),
    sendLike: mutation<LikeResponse, SendLike>({
      query: ({ activityId }: SendLike) => ({
        url: `/${like}`,
        method: Methods.post,
        body: { activityId },
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
      async onQueryStarted({ activityId, authorId, profilePhoto }, { dispatch, queryFulfilled }) {
        const optimisticLikeId = `optimistic-${activityId}-${authorId}`;
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', { activityId }, (draft) => {
            const firstPage = draft.pages[0];
            if (!firstPage || firstPage.likes.some(({ authorId: existingAuthorId }) => existingAuthorId === authorId))
              return;

            firstPage.likes.unshift({
              id: optimisticLikeId,
              activityId,
              authorId,
              date: new Date().toISOString(),
              profileId: '',
              profile: { profilePhoto },
            });
            firstPage.currentUserLike = { id: optimisticLikeId, authorId };
          }),
        );

        try {
          const { data: createdLike } = await queryFulfilled;
          dispatch(
            likesApi.util.updateQueryData('getLikesByActivityId', { activityId }, (draft) => {
              const firstPage = draft.pages[0];
              if (!firstPage) return;
              const optimisticLikeIndex = firstPage.likes.findIndex(({ id }) => id === optimisticLikeId);
              if (optimisticLikeIndex === -1) return;

              const hasCreatedLike = draft.pages.some(({ likes }) => likes.some(({ id }) => id === createdLike.id));
              if (hasCreatedLike) {
                firstPage.likes.splice(optimisticLikeIndex, 1);
                return;
              }

              firstPage.likes[optimisticLikeIndex] = {
                ...firstPage.likes[optimisticLikeIndex],
                ...createdLike,
                profile: createdLike.profile ?? firstPage.likes[optimisticLikeIndex].profile,
              };
              firstPage.currentUserLike = { id: createdLike.id, authorId: createdLike.authorId };
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteLike: mutation<LikeResponse, DeleteLike>({
      query: ({ id, activityId }: DeleteLike) => ({
        url: `/${like}/${id}/${activityId}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.likes, id: arg.activityId }],
      async onQueryStarted({ id, activityId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          likesApi.util.updateQueryData('getLikesByActivityId', { activityId }, (draft) => {
            draft.pages.forEach(({ likes }) => {
              const likeIndex = likes.findIndex((like) => like.id === id);
              if (likeIndex !== -1) likes.splice(likeIndex, 1);
            });
            const firstPage = draft.pages[0];
            if (firstPage?.currentUserLike?.id === id) firstPage.currentUserLike = null;
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

export const { useGetLikesByActivityIdInfiniteQuery, useSendLikeMutation, useDeleteLikeMutation } = likesApi;
