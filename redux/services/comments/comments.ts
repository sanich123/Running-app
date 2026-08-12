import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { DeleteCommentLike, SendComment, SendCommentLike, UpdateComment } from './types';
import type {
  CommentLikeResponse,
  CommentLikeSummaryResponse,
  CommentResponse,
  CommentsResponse,
} from '@R/runich-api/types';

const { comment, like } = Routes;

const commentsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCommentsByActivityId: builder.query<CommentsResponse, { activityId: string; take: number }>({
      query: ({ activityId, take }) => `/${comment}/${activityId}?take=${take}`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg.activityId }],
    }),
    getCommentsLengthByActivityId: builder.query<number, string>({
      query: (id: string) => `/${comment}/${id}/count`,
      providesTags: (result, error, arg) => [{ type: Tags.comments, id: arg }],
    }),
    postCommentWithActivityId: builder.mutation<void, SendComment>({
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
    deleteCommentByCommentId: builder.mutation<void, { commentId: string; activityId: string }>({
      query: ({ commentId }: { commentId: string; activityId: string }) => ({
        url: `/${comment}/${commentId}`,
        method: Methods.delete,
      }),
      invalidatesTags: (result, error, { activityId }) => [
        { type: Tags.comments, id: activityId },
        { type: Tags.activities, id: activityId },
      ],
    }),
    updateCommentByCommentId: builder.mutation<CommentResponse, UpdateComment>({
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
    getLikesByCommentId: builder.query<CommentLikeSummaryResponse[], string>({
      query: (commentId: string) => `/${comment}/${commentId}/${like}`,
      providesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg }],
    }),
    sendLikeToComment: builder.mutation<CommentLikeResponse, SendCommentLike>({
      query: ({ body, commentId }: SendCommentLike) => ({
        url: `/${comment}/${commentId}/${like}`,
        method: Methods.post,
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: Tags.commentLikes, id: arg.commentId }],
      async onQueryStarted({ body, commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getLikesByCommentId', commentId, (draft) => {
            draft.push({ authorId: body.authorId, id: `${commentId}:${body.authorId}` });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteLikeToComment: builder.mutation<void, DeleteCommentLike>({
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
