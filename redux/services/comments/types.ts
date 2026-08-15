export interface SendComment {
  body: {
    comment: string;
    authorId: string;
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
    authorId: string;
  };
  commentId: string;
}

export interface DeleteCommentLike {
  likeId: string;
  commentId: string;
}
