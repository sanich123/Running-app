import { ProfileType } from '@C/card/types';
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

export type UpdateComment = {
  commentId: string;
  activityId: string;
  body: { comment: string };
};

export type SendLike = {
  activityId: string;
  authorId: string;
  profilePhoto: string;
};

export type DeleteLike = {
  id: string;
  activityId: string;
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

export type CurrentWeekStatisticsRequest = {
  userId: string;
  firstDay: string;
  lastDay: string;
};

export type MonthStatisticsRequest = {
  userId: string;
  year: string;
  month: string;
};

export interface EmailDTO {
  name: string;
  surname: string;
  profilePhoto: string;
  recepientName: string;
  recepientSurname: string;
  recepientEmail: string;
}

export interface EmailComment extends EmailDTO {
  comment: string;
  mapPhotoUrl: string;
}

export interface EmailCommentLike extends EmailDTO {
  comment: string;
}
