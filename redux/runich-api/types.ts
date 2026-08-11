import type { ProfileType } from '@S/card/types';

export interface CommentResponse {
  authorId: string;
  comment: string;
  id: string;
  date: string;
  profile: ProfileType;
}

export interface CommentLikeResponse {
  commentLike: {
    authorId: string;
    id: string;
  }[];
}
