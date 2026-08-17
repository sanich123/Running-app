export type { LikeResponse } from '@R/runich-api/types';

export interface SendLike {
  activityId: string;
  authorId: string;
  /** Used only for the optimistic cache entry; the API does not accept it. */
  profilePhoto: string;
}

export type LikeRequest = Omit<SendLike, 'profilePhoto'>;

export interface DeleteLike {
  id: string;
  activityId: string;
}
