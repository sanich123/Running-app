import { MOCK_FOLLOWERS } from '@T/mocks/mock-followers';
import { MOCK_FRIENDS } from '@T/mocks/mock-friends';
import { MOCK_LOCATION } from '@T/mocks/mock-location';

export const deleteFriendSuccess = (req: any, res: any, ctx: any) => res(ctx.status(204), ctx.json(''));

export const addFriendSuccess = (req: any, res: any, ctx: any) => res(ctx.status(201), ctx.json(MOCK_LOCATION));

export const getFollowersSuccess = (req: any, res: any, ctx: any) => res(ctx.status(200), ctx.json(MOCK_FOLLOWERS));

export const getFollowingsSuccess = (req: any, res: any, ctx: any) => res(ctx.status(200), ctx.json(MOCK_FRIENDS));
