import type { ProfileType } from '@S/card/types';

export interface LikeResponse {
  date: string;
  authorId: string;
  id: string;
  activityId: string;
  profileId: string;
  profile?: ProfileType | null;
}

export interface LikeListResponse extends Omit<LikeResponse, 'profile'> {
  profile: ProfileType;
}

export interface LikeListPageResponse {
  likes: LikeListResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  currentUserLike: Pick<LikeListResponse, 'id' | 'authorId'> | null;
}

type FriendProfileResponse = Pick<
  ProfileType,
  'city' | 'name' | 'surname' | 'profilePhoto' | 'profilePhotoBlurhash' | 'allowNewFollowers'
>;

export interface FollowingResponse {
  createdAt: string;
  updatedAt: string;
  userId: string;
  friendId: string;
  profileId: string;
  id: string;
  profile?: FriendProfileResponse | null;
}

export interface FollowerResponse {
  createdAt: string;
  updatedAt: string;
  userId: string;
  friendId: string;
  profileId: string;
  id: string;
  user: { profile?: FriendProfileResponse | null };
}
