import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteCommentLike, SendComment, SendCommentLike, UpdateComment } from './types';

const { comment, like } = Routes;

const commentsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCommentsByActivityId: builder.query({
      query: ({ activityId, take }: { activityId: string; take: number }) => `/${comment}/${activityId}?&take=${take}`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg.activityId }],
    }),
    getCommentsLengthByActivityId: builder.query({
      query: (id: string) => `/${comment}/${id}/count`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg }],
    }),
    postCommentWithActivityId: builder.mutation({
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
    deleteCommentByCommentId: builder.mutation({
      query: ({ commentId }: { commentId: string; activityId: string }) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, { activityId }) => [
        { type: Tags.comments, id: activityId },
        { type: Tags.activities, id: activityId },
      ],
    }),
    updateCommentByCommentId: builder.mutation({
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
    getLikesByCommentId: builder.query({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg }],
    }),
    sendLikeToComment: builder.mutation({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg.commentId }],
      async onQueryStarted({ body, commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getLikesByCommentId', commentId, (draft) => {
            draft.push({
              commentId,
              authorId: body.authorId,
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
    deleteLikeToComment: builder.mutation({
      query: ({ likeId }: DeleteCommentLike) => ({
        url: `/${comment}/${likeId}/${like}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, { commentId }) => [{ type: Tags.commentLikes, id: commentId }],
    }),
  }),
});

export const {
  useGetCommentsByActivityIdQuery,
  useGetCommentsLengthByActivityIdQuery,
  usePostCommentWithActivityIdMutation,
  useDeleteCommentByCommentIdMutation,
  useUpdateCommentByCommentIdMutation,
  useSendLikeToCommentMutation,
  useDeleteLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
} = commentsApi;
