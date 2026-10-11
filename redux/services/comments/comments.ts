import { Methods, Routes, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteCommentLike, SendComment, SendCommentLike, UpdateComment } from './types';
import type {
  CommentLikeResponse,
  CommentLikeSummaryResponse,
  CommentMutationResponse,
  CommentsResponse,
} from '@R/runich-api/types';

const { comment, like } = Routes;

export const commentsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getCommentsByActivityId: infiniteQuery<CommentsResponse, { activityId: string }, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { activityId }, pageParam }) =>
        `/${comment}/${activityId}${createSearchParams({ limit: 10, cursor: pageParam || undefined })}`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg.activityId }],
    }),
    getCommentsLengthByActivityId: query<number, string>({
      query: (id: string) => `/${comment}/${id}/count`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg }],
    }),
    postCommentWithActivityId: mutation<void, SendComment>({
      query: ({ body, id }: SendComment) => ({
        url: `/${comment}/${id}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: Tags.comments, id: arg.id },
        { type: Tags.activities, id: arg.id },
      ],
    }),
    deleteCommentByCommentId: mutation<void, { commentId: string; activityId: string }>({
      query: ({ commentId }: { commentId: string; activityId: string }) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, { activityId }) => [
        { type: Tags.comments, id: activityId },
        { type: Tags.activities, id: activityId },
      ],
    }),
    updateCommentByCommentId: mutation<CommentMutationResponse, UpdateComment>({
      query: ({ commentId, body }: UpdateComment) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.patch,
        body,
      }),
      invalidatesTags: (result, error, { activityId }) => [
        { type: Tags.comments, id: activityId },
        { type: Tags.activities, id: activityId },
      ],
    }),
    getLikesByCommentId: query<CommentLikeSummaryResponse[], string>({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg }],
    }),
    sendLikeToComment: mutation<CommentLikeResponse, SendCommentLike>({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: Tags.commentLikes, id: arg.commentId },
        ...(arg.activityId ? [{ type: Tags.comments, id: arg.activityId }] : []),
      ],
      async onQueryStarted({ commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getLikesByCommentId', commentId, (draft) => {
            draft.push({ authorId: '', id: `:optimistic` });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteLikeToComment: mutation<void, DeleteCommentLike>({
      query: ({ likeId }: DeleteCommentLike) => ({
        url: `/${comment}/${likeId}/${like}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, { commentId }) => [{ type: Tags.commentLikes, id: commentId }],
    }),
  }),
});

export const {
  useGetCommentsByActivityIdInfiniteQuery,
  useGetCommentsLengthByActivityIdQuery,
  usePostCommentWithActivityIdMutation,
  useDeleteCommentByCommentIdMutation,
  useUpdateCommentByCommentIdMutation,
  useSendLikeToCommentMutation,
  useDeleteLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
} = commentsApi;
