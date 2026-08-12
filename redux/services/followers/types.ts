export type { FollowerResponse, FollowingResponse } from '@R/runich-api/types';

export interface SendFriend {
  body: {
    userId: string;
  };
  id: string;
}
