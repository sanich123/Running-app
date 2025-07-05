import { ProfileType } from '@C/card/types';
import { ActivityToSend } from '@R/services/activity/types';

export type SendActivity = {
  body: ActivityToSend;
  id: string;
};











export type CommentResponse = {
  authorId: string;
  comment: string;
  id: string;
  date: string;
  profile: ProfileType;
};

export type CommentLikeResponse = {
  commentLike: {
    authorId: string;
    id: string;
  }[];
};




