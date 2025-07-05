export type SendComment = {
  body: {
    comment: string;
    authorId: string;
  };
  id: string;
};

export type UpdateComment = {
  commentId: string;
  activityId: string;
  body: { comment: string };
};

export type SendCommentLike = {
  body: {
    commentId: string;
    authorId: string;
  };
  commentId: string;
};

export type DeleteCommentLike = {
  likeId: string;
  commentId: string;
};
