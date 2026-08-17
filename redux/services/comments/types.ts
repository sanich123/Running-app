export type {
  CommentLikeResponse,
  CommentLikeSummaryResponse,
  CommentMutationResponse,
  CommentResponse,
  CommentsResponse,
} from '@R/runich-api/types';

export interface SendComment {
  body: {
    comment: string;
  };
  id: string;
}

export interface UpdateComment {
  commentId: string;
  activityId: string;
  body: { comment: string };
}

export interface SendCommentLike {
  body: {
    commentId: string;
  };
  commentId: string;
}

export interface DeleteCommentLike {
  likeId: string;
  commentId: string;
}
