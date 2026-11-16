export interface CommentMutationResponse {
  authorId: string;
  comment: string;
  activityId: string;
  profileId: string;
  id: string;
  date: string;
  moderationStatus?: 'pending' | 'processing' | 'visible' | 'hidden' | 'removed';
}

export interface CommentLikeSummaryResponse {
  authorId: string;
  id: string;
}

interface CommentProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  user?: { email?: string | null } | null;
}

export interface CommentResponse {
  authorId: string;
  comment: string | null;
  moderationStatus?: 'pending' | 'processing' | 'visible' | 'hidden' | 'removed';
  activityId: string;
  profileId: string;
  id: string;
  date: string;
  profile: CommentProfileResponse;
  commentLike: CommentLikeSummaryResponse[];
}

export interface CommentsResponse {
  comments: CommentResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface CommentLikeResponse {
  date: string;
  authorId: string;
  commentId: string;
  profileId: string;
  id: string;
}
