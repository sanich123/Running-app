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
  activityId?: string;
}

export interface DeleteCommentLike {
  likeId: string;
  commentId: string;
}
