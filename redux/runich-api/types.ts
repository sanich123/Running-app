import { ActivityToSend } from '@R/activity/types';
import { ProfileSettings } from '@R/profile/types';

export type SendProfile = {
  body: ProfileSettings;
  id: string;
};

export type SendActivity = {
  body: ActivityToSend;
  id: string;
};

export type SendFriend = {
  body: {
    userId: string;
  };
  id: string;
};

export type SendComment = {
  body: {
    comment: string;
    authorId: string;
  };
  id: string;
};

export type SendLike = {
  activityId: string;
  authorId: string;
};

export type SendCommentLike = {
  body: {
    commentId: string;
    authorId: string;
  };
  commentId: string;
};

export type CommentResponse = { authorId: string; comment: string; id: string; date: Date };