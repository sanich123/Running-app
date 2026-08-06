import type { ActivityToSend } from '@R/services/activity/types';
import type { ProfileType } from '@Routes/card/types';

export interface SendActivity {
  body: ActivityToSend;
  id: string;
}

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
